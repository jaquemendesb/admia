import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateKnowledgeSchema } from "@/lib/validation/knowledge"
import { getKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry } from "@/lib/services/knowledge.service"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "knowledge", "VIEW", async () => {
    const entry = await getKnowledgeEntry(id)
    if (!entry) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(entry)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "knowledge", "UPDATE", async () => {
    const body = await req.json()
    const parsed = updateKnowledgeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const entry = await updateKnowledgeEntry(id, parsed.data)
    return NextResponse.json(entry)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "knowledge", "DELETE", async () => {
    await deleteKnowledgeEntry(id)
    return new NextResponse(null, { status: 204 })
  })
}
