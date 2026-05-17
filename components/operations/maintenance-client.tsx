"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Play, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import {
  JOB_TYPE_LABELS,
  JOB_TYPE_DESCRIPTIONS,
  JOB_IS_DESTRUCTIVE,
  ADMIN_SAFE_JOBS,
  type JobType,
} from "@/lib/validation/maintenance"

type JobRow = {
  id: string
  job_type: string
  status: string
  started_at: string | null
  finished_at: string | null
  payload: unknown
  created_at: string
  created_by: { name: string | null; email: string } | null
}

interface MaintenanceClientProps {
  jobs: JobRow[]
  canExecute: boolean
  isSuperAdmin: boolean
}

const STATUS_VARIANT: Record<string, "success" | "destructive" | "secondary" | "outline"> = {
  SUCCESS: "success",
  FAILED: "destructive",
  RUNNING: "outline",
  PENDING: "secondary",
  CANCELLED: "secondary",
}

const JOB_TYPES_ORDER: JobType[] = [
  "SYNC_ALL_INTEGRATIONS",
  "PURGE_MESSAGES",
  "PURGE_SYNC_LOGS",
  "PURGE_SOFT_DELETED_CONTACTS",
  "PURGE_SOFT_DELETED_CATALOG",
  "PURGE_AUDIT_LOGS",
]

export function MaintenanceClient({ jobs, canExecute, isSuperAdmin }: MaintenanceClientProps) {
  const router = useRouter()
  const [executingJob, setExecutingJob] = useState<JobType | null>(null)
  const [confirmJob, setConfirmJob] = useState<JobType | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleExecute(jobType: JobType) {
    if (JOB_IS_DESTRUCTIVE[jobType]) {
      setConfirmJob(jobType)
      return
    }
    await doExecute(jobType)
  }

  async function doExecute(jobType: JobType) {
    setLoading(true)
    setExecutingJob(jobType)
    try {
      const res = await fetch("/api/maintenance/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_type: jobType }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao executar job")
        return
      }
      toast.success(`Job "${JOB_TYPE_LABELS[jobType]}" iniciado`)
      router.refresh()
    } finally {
      setLoading(false)
      setExecutingJob(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Job buttons */}
      {canExecute && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOB_TYPES_ORDER.map((jobType) => {
            const isDestructive = JOB_IS_DESTRUCTIVE[jobType]
            const isAdminSafe = ADMIN_SAFE_JOBS.includes(jobType)
            const canRun = isSuperAdmin || isAdminSafe
            const isRunning = executingJob === jobType && loading

            return (
              <Card key={jobType} className={isDestructive ? "border-destructive/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{JOB_TYPE_LABELS[jobType]}</CardTitle>
                    {isDestructive && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Destrutivo
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{JOB_TYPE_DESCRIPTIONS[jobType]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant={isDestructive ? "destructive" : "default"}
                    disabled={!canRun || isRunning}
                    onClick={() => handleExecute(jobType)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isRunning ? "Executando..." : canRun ? "Executar" : "SUPER_ADMIN apenas"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Job history */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Executado por</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum job executado.
                </TableCell>
              </TableRow>
            )}
            {jobs.map((job) => {
              const label = JOB_TYPE_LABELS[job.job_type as JobType] ?? job.job_type
              const payload = job.payload as Record<string, unknown> | null
              const duration =
                job.started_at && job.finished_at
                  ? `${Math.round((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                  : job.started_at
                    ? "Em andamento"
                    : "—"
              return (
                <TableRow key={job.id}>
                  <TableCell className="font-medium text-sm">{label}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[job.status] ?? "secondary"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {job.created_by?.name ?? job.created_by?.email ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {job.started_at ? new Date(job.started_at).toLocaleString("pt-BR") : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{duration}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {payload?.deleted_count != null && `${payload.deleted_count} removidos`}
                      {payload?.integrations_processed != null && `${payload.integrations_processed} integrações`}
                      {payload?.error != null && (
                        <span className="text-destructive">{String(payload.error).slice(0, 60)}</span>
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!confirmJob}
        onOpenChange={(o) => { if (!o) setConfirmJob(null) }}
        title={`Executar: ${confirmJob ? JOB_TYPE_LABELS[confirmJob] : ""}`}
        description={`Esta operação é irreversível e irá remover dados permanentemente. Confirma a execução de "${confirmJob ? JOB_TYPE_LABELS[confirmJob] : ""}"?`}
        confirmLabel="Sim, executar"
        variant="destructive"
        onConfirm={async () => {
          if (confirmJob) {
            setConfirmJob(null)
            await doExecute(confirmJob)
          }
        }}
      />
    </div>
  )
}
