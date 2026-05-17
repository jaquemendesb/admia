import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { Shell } from "@/components/layout/shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <Shell session={session}>{children}</Shell>
}
