import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createKnowledgeSchema } from "@/lib/validation/knowledge"
import { listKnowledge, createKnowledgeEntry } from "@/lib/services/knowledge.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "knowledge", "VIEW", async (req) => {
    const { searchParams } = new URL(req.url)
    const entries = await listKnowledge(searchParams.get("channel_id"))
    return NextResponse.json(entries)
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "knowledge", "CREATE", async () => {
    const body = await req.json()
    const parsed = createKnowledgeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const entry = await createKnowledgeEntry(parsed.data)
    return NextResponse.json(entry, { status: 201 })
  })
}
