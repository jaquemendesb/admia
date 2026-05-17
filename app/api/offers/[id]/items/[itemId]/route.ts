import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { removeOfferItem } from "@/lib/services/offers.service"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { itemId } = await params
  return withPermission(req, "offers", "UPDATE", async () => {
    await removeOfferItem(itemId)
    return new NextResponse(null, { status: 204 })
  })
}
