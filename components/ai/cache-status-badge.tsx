"use client"

import { useEffect, useState } from "react"
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type CacheStatus = {
  status: "ok" | "never_synced" | "redis_unavailable"
  success?: boolean
  resources?: string[]
  updated_at?: string
  error?: string | null
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return "agora mesmo"
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return `há ${Math.floor(diff / 86400)}d`
}

export function CacheStatusBadge() {
  const [status, setStatus] = useState<CacheStatus | null>(null)
  const [syncing, setSyncing] = useState(false)

  async function fetchStatus() {
    try {
      const r = await fetch("/api/runtime/cache/status")
      if (r.ok) setStatus(await r.json())
    } catch {
      // ignore
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch("/api/runtime/cache/sync", { method: "POST" })
      // Wait for n8n to process and ack back to ADMIA
      await new Promise((r) => setTimeout(r, 4000))
      await fetchStatus()
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!status) return null

  const isOk    = status.status === "ok" && status.success
  const isNever = status.status === "never_synced"
  const isError = !isOk && !isNever

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
        isOk
          ? "bg-green-50 text-green-700 border-green-200"
          : isNever
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}>
        {isOk
          ? <CheckCircle2 className="h-3 w-3" />
          : isNever
          ? <Clock className="h-3 w-3" />
          : <AlertCircle className="h-3 w-3" />}
        <span>
          {isOk
            ? `Cache sincronizado ${timeAgo(status.updated_at!)}`
            : isNever
            ? "Cache nunca sincronizado"
            : "Redis indisponível"}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs gap-1"
        onClick={handleSync}
        disabled={syncing}
      >
        <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Sincronizando…" : "Sincronizar"}
      </Button>
    </div>
  )
}
