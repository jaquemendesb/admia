/**
 * Triggers the n8n ADMIA Cache Refresh webhook after persona/agent changes.
 * Fire-and-forget — never blocks the save operation.
 */
export async function triggerCacheRefresh(): Promise<void> {
  const webhookUrl = process.env.N8N_CACHE_WEBHOOK_URL
  if (!webhookUrl) return

  const secret = process.env.N8N_CACHE_WEBHOOK_SECRET
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify({ trigger: "admia_change", timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    // Intentional: cache refresh failure must never surface to the user
  }
}
