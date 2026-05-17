import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { listContactMemory } from "@/lib/services/contacts.service"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "contact_memory", "VIEW", async () => {
    return NextResponse.json(await listContactMemory(id))
  })
}
