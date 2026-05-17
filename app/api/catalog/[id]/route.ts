import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateCatalogItemSchema } from "@/lib/validation/catalog"
import { getCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/services/catalog.service"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "catalog", "VIEW", async () => {
    const item = await getCatalogItem(id)
    if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(item)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "catalog", "UPDATE", async () => {
    const body = await req.json()
    const parsed = updateCatalogItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const item = await updateCatalogItem(id, parsed.data)
    return NextResponse.json(item)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "catalog", "DELETE", async () => {
    await deleteCatalogItem(id)
    return new NextResponse(null, { status: 204 })
  })
}
