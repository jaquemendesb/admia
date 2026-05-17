import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createCatalogItemSchema } from "@/lib/validation/catalog"
import { listCatalogItems, createCatalogItem } from "@/lib/services/catalog.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "catalog", "VIEW", async (req) => {
    const { searchParams } = new URL(req.url)
    const items = await listCatalogItems({
      search: searchParams.get("search") ?? undefined,
      source_type: searchParams.get("source_type") ?? undefined,
      item_type: searchParams.get("item_type") ?? undefined,
    })
    return NextResponse.json(items)
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "catalog", "CREATE", async () => {
    const body = await req.json()
    const parsed = createCatalogItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const item = await createCatalogItem(parsed.data)
    return NextResponse.json(item, { status: 201 })
  })
}
