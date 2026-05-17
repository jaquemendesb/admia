import type { Metadata } from "next"
import { auth } from "@/lib/auth/config"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bem-vindo, {session?.user?.name ?? session?.user?.email}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Plataforma
          </p>
          <p className="text-base font-medium text-brand-navy mt-1">
            ADMIA — Phase 0
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Foundation</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Perfil
          </p>
          <p className="text-base font-medium text-brand-navy mt-1">
            {session?.user?.role}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session?.user?.email}
          </p>
        </div>
      </div>
    </div>
  )
}
