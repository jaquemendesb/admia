# Redis Cache Strategy — ADMIA Runtime API

## Contexto

O workflow n8n faz chamadas HTTP ao ADMIA a cada execução para buscar dados de governança. Dados como persona e agents mudam raramente — cachear no Redis elimina queries ao PostgreSQL e processamento Next.js/Prisma para cada mensagem, além de tornar o workflow resiliente a downtime do ADMIA.

## O que cachear

| Chave Redis | Endpoint ADMIA | TTL | Justificativa |
|---|---|---|---|
| `persona:{slug}` | `/api/runtime/persona?slug={slug}` | 1 hora | Muda raramente — só ao editar no ADMIA |
| `agents:{role}` | `/api/runtime/agents?role={role}` | 1 hora | Muda raramente — só ao editar no ADMIA |
| `config:automation` | `/api/runtime/config` | 5 minutos | Pode mudar com mais frequência (test_mode, etc.) |
| `policy:{phone}` | `/api/runtime/contact-policy` | 1 minuto | Por contato, pode mudar a qualquer momento |

## Padrão cache-aside no n8n

Para cada chamada ADMIA, o padrão é:

```
Redis GET {chave}
  → HIT  → usa dado em cache → próximo nó
  → MISS → GET ADMIA {endpoint} → Redis SET {chave} TTL → próximo nó
```

### Nós necessários por recurso (exemplo: persona)

```
[Redis GET persona:jaque]
        ↓
[IF cache hit?]
   true  ──→ (usa $json.value do Redis)
   false ──→ [GET ADMIA Persona] → [Redis SET persona:jaque TTL=3600]
```

O Redis SET deve serializar o objeto como JSON string:
```javascript
// Code node antes do Redis SET
return [{ json: { key: 'persona:jaque', value: JSON.stringify($json), ttl: 3600 } }]
```

O Redis GET retorna string — deserializar antes de usar:
```javascript
// Code node após Redis GET (no branch HIT)
return [{ json: JSON.parse($json.value) }]
```

## Invalidação de cache

### Opção 1 — Endpoint no ADMIA (recomendada)
Criar `DELETE /api/runtime/cache/invalidate` (SUPER_ADMIN only) que executa:
```
redis.del('persona:jaque', 'agents:ROUTER', 'agents:CONVERSATION', ...)
```
Chamar após salvar persona ou agents no ADMIA UI.

### Opção 2 — Comando direto no servidor
```bash
docker exec -it n8n_redis redis-cli DEL persona:jaque agents:ROUTER agents:CONVERSATION agents:SUPPORT agents:MEMORY config:automation
```

### Opção 3 — Aceitar defasagem (mais simples)
TTL curto (5-10 min) e nenhuma invalidação manual. Mudanças propagam automaticamente após o TTL expirar. Adequado para o volume atual.

## Redis a usar

**`n8n_redis`** — já conectado ao n8n, sem nova infraestrutura. O debounce de mensagens também usará este mesmo Redis.

Credencial n8n: criar `Redis API` do tipo `Redis` apontando para `redis:6379` (nome do serviço dentro da stack).

## Ordem de implementação

1. **Debounce de mensagens** ← implementar primeiro (impacto direto na UX)
2. **Cache Redis** ← este documento
3. **Histórico de conversa** ← contexto entre mensagens para o LLM

## Impacto esperado

- Elimina 3-4 chamadas HTTP internas por execução
- Reduz queries ao PostgreSQL do ADMIA
- Workflow resiliente a downtime temporário do ADMIA ou banco
- Ganho de latência marginal agora (~30-100ms); relevante com alto volume
