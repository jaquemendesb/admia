import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listSyncLogs } from "@/lib/services/woo-sync.service"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const STATUS_VARIANT: Record<string, "success" | "destructive" | "secondary" | "outline"> = {
  SUCCESS: "success",
  PARTIAL: "outline",
  FAILED: "destructive",
  RUNNING: "secondary",
  PENDING: "secondary",
}

export default async function SyncLogsPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "sync_logs", "VIEW")) {
    return <div className="text-muted-foreground p-8">Sem permissão.</div>
  }

  const logs = await listSyncLogs()

  return (
    <div className="space-y-6">
      <PageHeader title="Logs de Sincronização" description="Histórico de sincronizações entre sistemas." />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integração</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum log de sincronização.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => {
              const details = log.details as Record<string, unknown> | null
              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-medium">{log.integration.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{log.sync_type}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[log.status] ?? "secondary"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.started_at).toLocaleString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {log.finished_at ? new Date(log.finished_at).toLocaleString("pt-BR") : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {details && (
                      <span className="text-xs text-muted-foreground">
                        {typeof details.created === "number" && `+${details.created} `}
                        {typeof details.updated === "number" && `~${details.updated} `}
                        {typeof details.deactivated === "number" && details.deactivated > 0 && `-${details.deactivated} `}
                        {Array.isArray(details.errors) && details.errors.length > 0 && (
                          <span className="text-destructive">{details.errors.length} erros</span>
                        )}
                        {typeof details.error === "string" && (
                          <span className="text-destructive">{details.error.slice(0, 60)}</span>
                        )}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
