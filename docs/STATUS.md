# Status do Projeto — PJM Automation Ecosystem

Atualizado em: 2026-05-22

---

## Visão Geral

O ecossistema é composto por duas camadas independentes:

| Camada | Responsabilidade | Status |
|---|---|---|
| **ADMIA** (`admia.jaquemendes.com`) | Governança administrativa — CRUD, RBAC, configuração | ✅ Todas as fases completas |
| **Runtime** (n8n + LiteLLM + WAHA) | Orquestração, IA, transporte WhatsApp | ✅ Operacional em produção |

---

## ADMIA — Status por Fase

### Phase 0 — Foundation ✅
- Next.js App Router + TypeScript strict
- Auth.js (sessão protegida)
- RBAC 3 roles: SUPER_ADMIN / ADMIN / READONLY
- Prisma schema com 23+ modelos
- AES-256-GCM encryption para credenciais
- Audit log
- Docker Swarm + Traefik configurados (`admia.jaquemendes.com`)

### Phase 1 — Design System ✅
- Shell layout: sidebar + topbar + breadcrumbs
- Componentes reutilizáveis: `StatusBadge`, `DataTable` (TanStack v8), `EmptyState`, `ErrorState`, `ConfirmDialog`, `FormDialog`, `SubmitButton`, `PageHeader`, `PageSkeleton`, `DataTablePagination`, `DataTableToolbar`
- Todos os shadcn/ui primitivos configurados
- Tokens de marca Prof Jaque Mendes aplicados

### Phase 2 — Commerce CRUD ✅
- **Channels** — CRUD completo
- **Catalog** — CRUD com busca accent-insensitive (TRANSLATE+ILIKE, sem extensão PostgreSQL)
- **Offers** + OfferItems — CRUD completo
- **Knowledge Base** — CRUD completo
- **Integrations** — CRUD com credenciais encriptadas (AES-256-GCM)
- WooCommerce webhook URL e secret gerado/copiado no formulário de integração

### Phase 3 — AI Governance ✅
- **Personas** — CRUD completo (system_prompt, temperatura, etc.)
- **Agents** — CRUD por role (ROUTER / CONVERSATION / SUPPORT / MEMORY / POLICY)
- **AutomationConfig** — CRUD de configuração de automação
- Prompt templates editáveis via UI

### Phase 4 — Contact Governance ✅
- **Contacts** — governança administrativa (não CRM)
- **ContactMemory** — inspeção de memória por contato
- **ContactPolicy** — TEST / WHITELIST / BLACKLIST
- **PolicyLog** — visibilidade de decisões de política

### Phase 5 — WooCommerce Sync ✅
- WooClient (basic auth, paginado)
- WooNormalizer
- WooSyncService (idempotente: cria/atualiza/desativa)
- SyncLog com status enum
- Endpoint `/api/integrations/[id]/sync`
- Webhook receiver em `/api/runtime/woo-webhook`:
  - Topic check ANTES da validação de assinatura (pings de cadastro retornam 200 imediatamente)
  - HMAC-SHA256 validado só para eventos `product.*`
  - `product.created` com status != `publish` → ignorado (draft)
  - Sync em background (não bloqueia resposta WooCommerce)

### Phase 6 — Runtime Integration ✅
- Endpoints protegidos por `RUNTIME_API_KEY`:
  - `GET /api/runtime/persona?slug=`
  - `GET /api/runtime/agents?role=`
  - `GET /api/runtime/knowledge?channel_id=`
  - `GET /api/runtime/config`
  - `GET /api/runtime/contact-policy`
  - `GET /api/runtime/catalog?q=`
- Runtime guard em `lib/rbac/runtime-guard.ts`
- Página de status em `/operations/runtime`
- Busca de catálogo accent-insensitive via `TRANSLATE(LOWER(col), accented, plain) ILIKE term`

### Phase 7 — Operations & Maintenance ✅
- Endpoint `GET /api/health` com DB check + counts
- Página `/operations/system-health` com refresh em tempo real
- Jobs de manutenção: `PURGE_SYNC_LOGS`, `PURGE_SOFT_DELETED_CATALOG`
- Seeds de retenção: `retention_days_messages=90`, `retention_days_audit=365`, `retention_days_sync_logs=90`
- Navegação "Saúde do Sistema" no menu Operações

---

## Runtime n8n — Status

### Workflow Principal
- **ID:** `bbA9Ny38Ude2p8gP`
- **URL:** `https://automacao.jaquemendes.com`

### Arquitetura de Roteamento (Switch Intent)
| Output | Intenção | Destino |
|---|---|---|
| 0 | CONVERSATION | Agent Jaque Conversation (`sales-main`) |
| 1 | SUPPORT | Agent Jaque Support (`support-main`) |
| 2 | MEMORY | Agent Jaque Memory (`memory-fast`) |
| 3 | IGNORE | Silencioso — sem resposta |
| 4 | Fallback | Mensagem de erro (instabilidade) |

### Split de Mensagens ✅ (implementado)
- AI responde com blocos separados por `|||`
- Nó `Split Messages` divide em múltiplos itens
- Loop `Split In Batches` (batchSize: 1) envia um por vez via POST WAHA
- `Wait Msgs` adiciona delay de 2s entre mensagens
- Cadeia: `Prepare Response → Split Messages → Split In Batches → POST WAHA → Wait Msgs → Split In Batches`

### Configurações do Agent CONVERSATION
- `max_tokens`: 800 (aumentado de 250)
- `temperature`: 0.4
- Instrução de formato: blocos separados por `|||`, máx 3-4 linhas por bloco, sem markdown

---

## LiteLLM — Status

**URL:** `https://routerllm.jaquemendes.com`  
**Config:** `docker_litellm_config.yaml`

### Model Aliases configurados
| Alias | Modelo real | Usado por |
|---|---|---|
| `router-fast` | gpt-4.1-mini | Jaque Router (classificação) |
| `sales-main` | gpt-4.1 | Jaque Conversation (vendas) |
| `support-main` | gpt-4.1-mini | Jaque Support |
| `memory-fast` | gpt-4.1-mini | Jaque Memory |
| `followup-fast` | gpt-4.1-mini | Followup (futuro) |

### Guardrails Lakera — DESATIVADO
- Endpoint `/v1/prompt_injection` foi deprecado pela Lakera
- Novo endpoint é `/v2/guard` (formato diferente de body)
- LiteLLM v1.85.1 ainda usa o endpoint antigo (hardcoded)
- `fail_on_error: false` não previne propagação da exceção no `custom_guardrail.py`
- **Workaround:** guardrails removidos da config até LiteLLM atualizar o hook

---

## Documentação de Agents e Personas

### Estrutura da pasta `docs/`

```
docs/
├── STATUS.md                          ← este arquivo
├── personas/
│   ├── jaque.md                       ← documentação completa da persona Jaque
│   └── jaque-cmp.md                   ← system_prompt pronto para copiar no ADMIA
├── agents/
│   ├── jaque-router.md                ← documentação completa do Router
│   ├── jaque-router-cmp.md            ← prompt_template pronto para copiar no ADMIA
│   ├── jaque-conversation.md          ← documentação completa do Conversation
│   ├── jaque-conversation-cmp.md      ← prompt_template pronto para copiar no ADMIA
│   ├── jaque-support.md               ← documentação completa do Support
│   ├── jaque-support-cmp.md           ← prompt_template pronto para copiar no ADMIA
│   ├── jaque-memory.md                ← documentação completa do Memory
│   └── jaque-memory-cmp.md            ← prompt_template pronto para copiar no ADMIA
└── architecture/                      ← documentos de arquitetura ADMIA (binding)
    ├── 00_execution_rules.md
    ├── 01_product_architecture.md
    ├── 02_domain_model.md
    ├── 03_database_rules.md
    ├── 04_rbac_matrix.md
    ├── 05_ui_information_architecture.md
    ├── 06_design_system_rules.md
    ├── 07_api_boundaries.md
    ├── 08_woocommerce_rules.md
    ├── 09_ai_runtime_architecture.md
    ├── 10_n_8_n_runtime_rules.md
    ├── 11_deployment_rules.md
    ├── 12_security_rules.md
    ├── 13_phase_plan.md
    ├── 14_acceptance_gates.md
    ├── 15_master_claude_task.md
    ├── 16_project_structure.md
    └── redis-cache-strategy.md        ← estratégia documentada, ainda não implementada no n8n
```

### Convenção dos arquivos `-cmp.md`
Arquivos `*-cmp.md` contêm **somente o prompt**, sem contexto de documentação. São usados para copiar diretamente no campo `prompt_template` ou `system_prompt` do ADMIA UI (AI → Personas ou AI → Agentes).

### Prompts atualizados recentemente
| Arquivo | Última alteração |
|---|---|
| `jaque-router-cmp.md` | Dúvida 3: saudações = CONVERSATION (2026-05-22) |
| `jaque-router.md` | Idem |
| `jaque-conversation-cmp.md` | Tom direto e objetivo, formato `|||` (sessão anterior) |
| `jaque-conversation.md` | Idem |

---

## Pendente / Próximas Melhorias

### Alta prioridade
| Item | Descrição | Doc de referência |
|---|---|---|
| **Debounce de mensagens** | Usuário manda 2-3 msgs seguidas → n8n processa separado, gerando respostas duplicadas. Redis lock por `chat_id` com janela de ~3s para agregar. | `docs/architecture/redis-cache-strategy.md` |
| **Cache Redis no n8n** | Cachear persona/agents/config do ADMIA no Redis (TTL 1h/5min). Elimina 3-4 chamadas HTTP por execução. | `docs/architecture/redis-cache-strategy.md` |
| **Histórico de conversa** | Incluir mensagens anteriores no contexto enviado ao LLM. Necessário para continuidade de conversa. | — |

### Média prioridade
| Item | Descrição |
|---|---|
| **Reativar Lakera guardrails** | Aguardar LiteLLM atualizar hook para endpoint `/v2/guard` |
| **WooCommerce `product.updated`** | Webhook cadastrado, sync em background funcional. Validar fluxo completo em produção. |
| **Testar split de mensagens** | Enviar "atividades de matemática para 5º ano" e verificar múltiplos blocos com delay de 2s |

### Baixa prioridade / Futuro
| Item | Descrição |
|---|---|
| **Endpoint de invalidação de cache** | `DELETE /api/runtime/cache/invalidate` (SUPER_ADMIN) para limpar Redis após editar persona/agents no ADMIA |
| **Agent Followup** | Alias `followup-fast` já configurado no LiteLLM, workflow ainda não implementado |
