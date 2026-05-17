"use client"

import { useState, useTransition } from "react"
import { RefreshCw, CheckCircle2, XCircle, Activity, Database, Users, Link2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface HealthData {
  status: "ok" | "degraded"
  uptime_seconds: number
  started_at: string
  checks: Record<string, { status: "ok" | "error"; detail?: string }>
  counts: Record<string, number>
}

interface SystemHealthClientProps {
  initial: HealthData
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const COUNT_META: Record<string, { label: string; icon: React.ElementType; warnIf?: (v: number) => boolean }> = {
  active_users: { label: "Usuários ativos", icon: Users },
  active_integrations: { label: "Integrações ativas", icon: Link2 },
  contacts: { label: "Contatos", icon: Users },
  failed_sync_logs: { label: "Sync logs com falha", icon: AlertTriangle, warnIf: (v) => v > 0 },
  running_jobs: { label: "Jobs em execução", icon: Activity, warnIf: (v) => v > 0 },
}

export function SystemHealthClient({ initial }: SystemHealthClientProps) {
  const [data, setData] = useState<HealthData>(initial)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isPending, startTransition] = useTransition()

  function refresh() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" })
        const json = await res.json()
        setData(json)
        setLastRefresh(new Date())
      } catch {
        // silently ignore
      }
    })
  }

  const isHealthy = data.status === "ok"

  return (
    <div className="space-y-6">
      {/* Overall status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isHealthy ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <XCircle className="h-6 w-6 text-destructive" />
          )}
          <div>
            <p className="font-semibold text-lg leading-none">
              {isHealthy ? "Sistema saudável" : "Sistema degradado"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Última verificação: {lastRefresh.toLocaleTimeString("pt-BR")}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Separator />

      {/* Uptime */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Uptime</CardDescription>
            <CardTitle className="text-2xl font-bold">{formatUptime(data.uptime_seconds)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Iniciado em {new Date(data.started_at).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        {Object.entries(data.counts).map(([key, value]) => {
          const meta = COUNT_META[key]
          if (!meta) return null
          const Icon = meta.icon
          const warn = meta.warnIf?.(value)
          return (
            <Card key={key} className={warn ? "border-amber-300" : ""}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </CardDescription>
                <CardTitle className={`text-2xl font-bold ${warn ? "text-amber-600" : ""}`}>
                  {value.toLocaleString("pt-BR")}
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Dependency checks */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Verificações de dependências</h2>
        <div className="space-y-2">
          {Object.entries(data.checks).map(([name, check]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-md border px-4 py-3 bg-white"
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{name}</span>
                {check.detail && (
                  <span className="text-xs text-muted-foreground truncate max-w-xs">{check.detail}</span>
                )}
              </div>
              <Badge
                variant={check.status === "ok" ? "default" : "destructive"}
                className={check.status === "ok" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              >
                {check.status === "ok" ? "Operacional" : "Erro"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Runtime endpoints reference */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Endpoints de runtime</h2>
        <div className="rounded-md border bg-white divide-y text-xs font-mono">
          {[
            "GET /api/health",
            "GET /api/runtime/persona",
            "GET /api/runtime/agents",
            "GET /api/runtime/knowledge",
            "GET /api/runtime/config",
            "GET /api/runtime/contact-policy",
            "GET /api/runtime/catalog",
          ].map((ep) => (
            <div key={ep} className="flex items-center gap-3 px-4 py-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground">{ep}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
