import Redis from "ioredis"

// Lazy singleton — client is only created on first use, not at build time.
let _instance: Redis | undefined

function getInstance(): Redis {
  if (_instance) return _instance
  const url = process.env.REDIS_URL
  if (!url) throw new Error("REDIS_URL not configured")
  // lazyConnect omitido intencionalmente: o Proxy já garante instanciação lazy.
  // Com lazyConnect:true + enableOfflineQueue:false, o primeiro comando falha
  // porque o cliente nasce em estado 'wait' e recusa comandos antes de conectar.
  _instance = new Redis(url, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
  })
  return _instance
}

// Proxy so callers use redis.get / redis.set without knowing about lazy init.
export const redis = new Proxy({} as Redis, {
  get(_, prop: string) {
    return (getInstance() as unknown as Record<string, unknown>)[prop]
  },
})
