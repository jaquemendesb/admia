import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { addOfferItemSchema } from "@/lib/validation/offers"
import { addOfferItem } from "@/lib/services/offers.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "offers", "UPDATE", async () => {
    const body = await req.json()
    const parsed = addOfferItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const item = await addOfferItem(id, parsed.data)
    return NextResponse.json(item, { status: 201 })
  })
}
