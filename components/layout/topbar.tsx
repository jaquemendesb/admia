import type { Session } from "next-auth"
import { SignOutButton } from "./sign-out-button"

interface TopbarProps {
  session: Session
}

export function Topbar({ session }: TopbarProps) {
  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium text-foreground leading-none">
            {session.user?.name ?? session.user?.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session.user?.role}
          </p>
        </div>
        <SignOutButton />
      </div>
    </header>
  )
}
