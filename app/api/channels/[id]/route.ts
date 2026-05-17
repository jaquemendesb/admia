import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { updateChannelSchema } from "@/lib/validation/channels"
import { getChannel, updateChannel, deleteChannel } from "@/lib/services/channels.service"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "business_channels", "VIEW", async () => {
    const channel = await getChannel(id)
    if (!channel) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(channel)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "business_channels", "UPDATE", async () => {
    const body = await req.json()
    const parsed = updateChannelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const channel = await updateChannel(id, parsed.data)
    return NextResponse.json(channel)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withPermission(req, "business_channels", "DELETE", async () => {
    await deleteChannel(id)
    return new NextResponse(null, { status: 204 })
  })
}
