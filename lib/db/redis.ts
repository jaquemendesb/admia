import Redis from "ioredis"

// Lazy singleton — client is only created on first use, not at build time.
let _instance: Redis | undefined

function getInstance(): Redis {
  if (_instance) return _instance
  const url = process.env.REDIS_URL
  if (!url) throw new Error("REDIS_URL not configured")
  _instance = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  })
  return _instance
}

// Proxy so callers use redis.get / redis.set without knowing about lazy init.
export const redis = new Proxy({} as Redis, {
  get(_, prop: string) {
    return (getInstance() as unknown as Record<string, unknown>)[prop]
  },
})
