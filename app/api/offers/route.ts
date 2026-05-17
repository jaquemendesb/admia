import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createOfferSchema } from "@/lib/validation/offers"
import { listOffers, createOffer } from "@/lib/services/offers.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "offers", "VIEW", async () => {
    const offers = await listOffers()
    return NextResponse.json(offers)
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "offers", "CREATE", async () => {
    const body = await req.json()
    const parsed = createOfferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const offer = await createOffer(parsed.data)
    return NextResponse.json(offer, { status: 201 })
  })
}
