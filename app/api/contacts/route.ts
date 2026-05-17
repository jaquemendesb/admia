import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { listContacts } from "@/lib/services/contacts.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "contacts", "VIEW", async () => {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? undefined
    const activeParam = searchParams.get("active")
    const active = activeParam === "true" ? true : activeParam === "false" ? false : undefined
    const page = Number(searchParams.get("page") ?? "1")
    const pageSize = Number(searchParams.get("pageSize") ?? "50")
    return NextResponse.json(await listContacts({ search, active, page, pageSize }))
  })
}
