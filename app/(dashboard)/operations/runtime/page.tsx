import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { getRuntimeAgents } from "@/lib/services/runtime.service"
import { getRuntimePersona } from "@/lib/services/runtime.service"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RuntimeIntegrationPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "maintenance_jobs", "VIEW")) {
    return <div className="text-muted-foreground p-8">Sem permissão.</div>
  }

  const [agents, defaultPersona] = await Promise.all([
    getRuntimeAgents(),
    getRuntimePersona(),
  ])

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://admia.jaquemendes.com"
  const runtimeKeyConfigured = !!process.env.RUNTIME_API_KEY

  const endpoints = [
    { method: "GET", path: "/api/runtime/persona", description: "Persona padrão ativa (system_prompt, tone, language)", params: "?slug=<slug> (opcional)" },
    { method: "GET", path: "/api/runtime/agents", description: "Todos os agentes ativos com prompt_template e model_alias", params: "?role=ROUTER|CONVERSATION|SUPPORT|MEMORY|POLICY" },
    { method: "GET", path: "/api/runtime/knowledge", description: "Base de conhecimento ativa", params: "?channel=<slug-do-canal>" },
    { method: "GET", path: "/api/runtime/config", description: "Mapa chave-valor de toda a automation_config", params: "—" },
    { method: "GET", path: "/api/runtime/contact-policy", description: "Verifica blacklist/whitelist/test_mode de um contato", params: "?phone=<número>" },
    { method: "GET", path: "/api/runtime/catalog", description: "Catálogo ativo de itens (filtrado por canal)", params: "?channel=<slug-do-canal>" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integração Runtime"
        description="Referência de endpoints e configurações para integração com n8n e LiteLLM."
      />

      {/* API Key status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Autenticação Runtime</CardTitle>
          <CardDescription>
            n8n deve enviar o header <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Authorization: Bearer &lt;RUNTIME_API_KEY&gt;</code> em todas as chamadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={runtimeKeyConfigured ? "success" : "destructive"}>
              {runtimeKeyConfigured ? "RUNTIME_API_KEY configurada" : "RUNTIME_API_KEY ausente — endpoints inativos"}
            </Badge>
            {!runtimeKeyConfigured && (
              <span className="text-sm text-muted-foreground">
                Adicione <code className="font-mono text-xs">RUNTIME_API_KEY</code> ao ambiente e reinicie.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoints de Governança para n8n</CardTitle>
          <CardDescription>Base URL: <code className="font-mono text-xs">{baseUrl}</code></CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Método</TableHead>
                <TableHead className="w-72">Endpoint</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-52">Parâmetros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((ep) => (
                <TableRow key={ep.path}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{ep.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs">{ep.path}</code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ep.description}</span>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-muted-foreground">{ep.params}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Current Agents / LiteLLM model aliases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agentes Ativos — Aliases de Modelo (LiteLLM)</CardTitle>
          <CardDescription>
            Verifique se os aliases abaixo estão configurados no LiteLLM em{" "}
            <code className="font-mono text-xs">routerllm.jaquemendes.com</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Alias no LiteLLM</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum agente configurado. Configure em IA → Agentes.
                  </TableCell>
                </TableRow>
              )}
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.agent_role}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-sm">{agent.model_alias}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Ativo</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Default Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Persona Padrão</CardTitle>
          <CardDescription>Persona injetada quando nenhuma persona específica for selecionada.</CardDescription>
        </CardHeader>
        <CardContent>
          {defaultPersona ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{defaultPersona.name}</span>
                <Badge variant="outline" className="font-mono text-xs">{defaultPersona.slug}</Badge>
                <span className="text-xs text-muted-foreground">{defaultPersona.language} · {defaultPersona.tone ?? "tom não definido"}</span>
              </div>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-32 whitespace-pre-wrap font-mono">
                {defaultPersona.system_prompt.slice(0, 400)}{defaultPersona.system_prompt.length > 400 ? "…" : ""}
              </pre>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Nenhuma persona padrão configurada. Configure em IA → Personas.</span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
