export interface WooProduct {
  id: number
  name: string
  slug: string
  permalink: string
  status: string
  sku: string
  short_description: string
  description: string
  price: string
  regular_price: string
  sale_price: string
  images: { src: string }[]
  categories: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string }[]
  meta_data: { key: string; value: unknown }[]
  date_modified: string
}

export class WooClient {
  private readonly baseUrl: string
  private readonly authHeader: string

  constructor(storeUrl: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = storeUrl.replace(/\/$/, "")
    this.authHeader = "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/wp-json/wc/v3${path}`, {
      headers: { Authorization: this.authHeader, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`Woo API error ${res.status}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  async testConnection(): Promise<{ ok: boolean; store_name?: string }> {
    try {
      const data = await this.request<{ name: string }>("/system_status")
      return { ok: true, store_name: data?.name }
    } catch {
      const info = await this.request<{ name: string }>("")
      return { ok: true, store_name: info?.name }
    }
  }

  async fetchAllProducts(onPage?: (count: number) => void): Promise<WooProduct[]> {
    const all: WooProduct[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const batch = await this.request<WooProduct[]>(
        `/products?status=any&per_page=${perPage}&page=${page}&orderby=id&order=asc`
      )
      all.push(...batch)
      onPage?.(all.length)
      if (batch.length < perPage) break
      page++
      // Respect Woo rate limits between pages
      await new Promise((r) => setTimeout(r, 200))
    }
    return all
  }
}
