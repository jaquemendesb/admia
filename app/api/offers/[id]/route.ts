import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateOfferSchema, addOfferItemSchema } from "@/lib/validation/offers"
import { getOffer, updateOffer, deleteOffer, addOfferItem, removeOfferItem } from "@/lib/services/offers.service"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "offers", "VIEW", async () => {
    const offer = await getOffer(id)
    if (!offer) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(offer)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "offers", "UPDATE", async () => {
    const body = await req.json()
    const parsed = updateOfferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const offer = await updateOffer(id, parsed.data)
    return NextResponse.json(offer)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "offers", "DELETE", async () => {
    await deleteOffer(id)
    return new NextResponse(null, { status: 204 })
  })
}
