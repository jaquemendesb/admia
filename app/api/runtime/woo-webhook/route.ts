import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db/client"
import { runWooSync } from "@/lib/services/woo-sync.service"

export async function POST(req: NextRequest) {
  const integrationId = req.nextUrl.searchParams.get("integration_id")
  if (!integrationId) {
    return NextResponse.json({ error: "Missing integration_id" }, { status: 400 })
  }

  const integration = await prisma.integration.findFirst({
    where: { id: integrationId, deleted_at: null, active: true },
    select: { id: true, metadata: true },
  })
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 })
  }

  // Read body once — needed for both signature validation and payload parsing
  const rawBody = await req.text()

  // Validate WooCommerce HMAC-SHA256 signature
  const signature = req.headers.get("x-wc-webhook-signature")
  const webhookSecret = (integration.metadata as Record<string, unknown> | null)?.webhook_secret as string | undefined

  if (webhookSecret) {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("base64")
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  }

  // Only process product events
  const topic = req.headers.get("x-wc-webhook-topic") ?? ""
  if (!topic.startsWith("product.")) {
    return NextResponse.json({ ok: true, skipped: true, topic })
  }

  // For product.created: skip drafts — no point importing a product that isn't published yet.
  // For product.updated / product.deleted: always sync — the product may have gone from
  // published → draft and we need to deactivate it in the catalog.
  if (topic === "product.created") {
    let payload: Record<string, unknown> = {}
    try { payload = JSON.parse(rawBody) } catch { /* ignore parse errors */ }
    if (payload.status !== "publish") {
      return NextResponse.json({ ok: true, skipped: true, topic, reason: "draft" })
    }
  }

  // Respond 200 immediately — WooCommerce retries on timeout
  // Run sync in background (Next.js keeps the process alive for async work)
  runWooSync(integrationId).catch((err) =>
    console.error(`[woo-webhook] sync failed for ${integrationId}:`, err)
  )

  return NextResponse.json({ ok: true, queued: true, topic })
}
