import { NextRequest, NextResponse } from "next/server"
import { withPermission } from "@/lib/rbac/guard"
import { createChannelSchema } from "@/lib/validation/channels"
import { listChannels, createChannel } from "@/lib/services/channels.service"

export async function GET(req: NextRequest) {
  return withPermission(req, "business_channels", "VIEW", async () => {
    const channels = await listChannels()
    return NextResponse.json(channels)
  })
}

export async function POST(req: NextRequest) {
  return withPermission(req, "business_channels", "CREATE", async (req, { userId }) => {
    const body = await req.json()
    const parsed = createChannelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
    }
    const channel = await createChannel(parsed.data)
    return NextResponse.json(channel, { status: 201 })
  })
}
