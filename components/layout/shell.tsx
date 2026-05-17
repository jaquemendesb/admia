import type { Session } from "next-auth"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Toaster } from "@/components/ui/sonner"

interface ShellProps {
  children: React.ReactNode
  session: Session
}

export function Shell({ children, session }: ShellProps) {
  const role = session.user.role ?? "READONLY"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar session={session} />
        <main className="flex-1 overflow-y-auto p-6 bg-muted">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
