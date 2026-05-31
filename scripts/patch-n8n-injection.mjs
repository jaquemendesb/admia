/**
 * Patches the n8n workflow to add prompt injection protection:
 * 1. Prepare Conv Messages — adds injection filter + wraps user message in XML tags
 * 2. POST LiteLLM Classify — wraps user content in XML tags
 * 3. POST LiteLLM Supp    — wraps user content in XML tags
 * 4. POST LiteLLM Mem     — wraps user content in XML tags
 *
 * Run: node scripts/patch-n8n-injection.mjs
 */
import fs from "node:fs"
import https from "node:https"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dir = path.dirname(fileURLToPath(import.meta.url))
const envToolsPath = path.join(__dir, "..", ".env.tools")

// ── Load .env.tools ──────────────────────────────────────────────────────────
const envVars = {}
fs.readFileSync(envToolsPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const m = line.match(/^([^#][^=]*)=(.*)$/)
    if (m) envVars[m[1].trim()] = m[2].trim()
  })

const N8N_BASE = envVars["N8N_BASE_URL"]
const N8N_KEY  = envVars["N8N_API_KEY"]
const WF_ID    = envVars["N8N_WORKFLOW_ID"]

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function httpsReq(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const payload = body ? JSON.stringify(body) : undefined
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method,
        headers: {
          "X-N8N-API-KEY": N8N_KEY,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let d = ""
        res.on("data", (c) => (d += c))
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(d) }) }
          catch { resolve({ status: res.statusCode, body: d }) }
        })
      }
    )
    req.on("error", reject)
    if (payload) req.write(payload)
    req.end()
  })
}

// ── Injection filter snippet (injected at top of Prepare Conv Messages) ─────
// Uses \$ to escape from the template literal — will become $ in the actual code
const INJECTION_FILTER_SNIPPET = `
// ── Prompt injection filter (auto-added) ─────────────────────────────────────
const _INJECTION_PATTERNS = [
  /ignore\\s+(all\\s+)?(previous|above|prior)\\s+instructions?/i,
  /ignore\\s+tudo\\s+(acima|anterior|anteriores)/i,
  /esqueça?\\s+(tudo|as\\s+instruções|seu\\s+papel)/i,
  /você\\s+agora\\s+é\\s+/i,
  /now\\s+you\\s+are\\s+/i,
  /forget\\s+(your\\s+)?(instructions?|role|rules?)/i,
  /act\\s+as\\s+(if\\s+)?/i,
  /new\\s+(system\\s+)?instructions?:/i,
  /\\[system\\]/i,
  /override\\s+(your\\s+)?(instructions?|behavior)/i,
  /jailbreak/i,
  /DAN\\s+mode/i,
  /revele?\\s+(suas?\\s+)?(instruções|prompt|sistema)/i,
  /reveal\\s+(your\\s+)?(instructions?|system\\s+prompt)/i,
];
const _rawUserMsg = String($('DT Ctto').item.json.leadResponse ?? '');
if (_INJECTION_PATTERNS.some(p => p.test(_rawUserMsg))) {
  console.log('[InjectionFilter] Blocked:', _rawUserMsg.substring(0, 80));
  return [{ json: {
    bodyStr: null,
    injection_blocked: true,
    response_text: 'Não consegui entender sua mensagem. Pode reformular?',
    is_error: true,
    chat_id: $('DT Ctto').item.json.leadChatID,
    session: $('DT Ctto').item.json.leadSession,
  }}];
}
// ─────────────────────────────────────────────────────────────────────────────
`

// ── XML wrapper helper for n8n expression strings ────────────────────────────
// Wraps an n8n expression value with XML tags for prompt injection defense
function xmlWrap(expr) {
  return `'<mensagem_usuario>\\n' + ${expr} + '\\n</mensagem_usuario>'`
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching workflow", WF_ID, "from", N8N_BASE)
  const { status, body: wf } = await httpsReq("GET", `${N8N_BASE}/api/v1/workflows/${WF_ID}`, {}, null)
  if (status !== 200) throw new Error(`GET workflow failed: ${status}`)
  console.log(`Workflow "${wf.name}" fetched — ${wf.nodes.length} nodes`)

  let patched = 0

  // ── 1. Prepare Conv Messages ─────────────────────────────────────────────
  const prepNode = wf.nodes.find((n) => n.id === "prepare-conv-messages")
  if (!prepNode) throw new Error("Node prepare-conv-messages not found")

  let prepCode = prepNode.parameters.jsCode

  if (prepCode.includes("_INJECTION_PATTERNS")) {
    console.log("  [1] Prepare Conv Messages — injection filter already present, skipping")
  } else {
    prepCode = INJECTION_FILTER_SNIPPET + "\n" + prepCode
    console.log("  [1] Prepare Conv Messages — injection filter added")
    patched++
  }

  // Wrap user message in XML tags
  const XML_WRAP_MARKER = "<mensagem_usuario>"
  if (prepCode.includes(XML_WRAP_MARKER)) {
    console.log("  [1] Prepare Conv Messages — XML wrap already present, skipping")
  } else {
    const before = "{ role: 'user', content: userMessage }"
    const after  = "{ role: 'user', content: '<mensagem_usuario>\\n' + userMessage + '\\n</mensagem_usuario>' }"
    if (!prepCode.includes(before)) throw new Error("Could not find user message line in Prepare Conv Messages")
    prepCode = prepCode.replace(before, after)
    console.log("  [1] Prepare Conv Messages — XML wrap applied to user message")
    patched++
  }

  prepNode.parameters.jsCode = prepCode

  // ── 2. POST LiteLLM Classify ──────────────────────────────────────────────
  const classifyNode = wf.nodes.find((n) => n.id === "aa11bb22-cc33-dd44-ee55-ff6677889900")
  if (!classifyNode) throw new Error("Node POST LiteLLM Classify not found")

  if (classifyNode.parameters.jsonBody.includes("<mensagem_usuario>")) {
    console.log("  [2] POST LiteLLM Classify — XML wrap already present")
  } else {
    const target = `"content": $('DT Ctto').item.json.leadResponse`
    if (!classifyNode.parameters.jsonBody.includes(target))
      throw new Error("Could not find user content in Classify jsonBody")
    classifyNode.parameters.jsonBody = classifyNode.parameters.jsonBody.replace(
      target,
      `"content": ${xmlWrap("$('DT Ctto').item.json.leadResponse")}`
    )
    console.log("  [2] POST LiteLLM Classify — XML wrap applied")
    patched++
  }

  // ── 3. POST LiteLLM Supp ─────────────────────────────────────────────────
  const suppNode = wf.nodes.find((n) => n.id === "ff660011-2233-4455-6677-889900112233")
  if (!suppNode) throw new Error("Node POST LiteLLM Supp not found")

  if (suppNode.parameters.jsonBody.includes("<mensagem_usuario>")) {
    console.log("  [3] POST LiteLLM Supp — XML wrap already present")
  } else {
    const target = `{"role": "user", "content": $('DT Ctto').item.json.leadResponse}`
    if (!suppNode.parameters.jsonBody.includes(target))
      throw new Error("Could not find user content in Supp jsonBody")
    suppNode.parameters.jsonBody = suppNode.parameters.jsonBody.replace(
      target,
      `{"role": "user", "content": ${xmlWrap("$('DT Ctto').item.json.leadResponse")}}`
    )
    console.log("  [3] POST LiteLLM Supp — XML wrap applied")
    patched++
  }

  // ── 4. POST LiteLLM Mem ──────────────────────────────────────────────────
  const memNode = wf.nodes.find((n) => n.id === "11223344-5566-7788-9900-112233445567")
  if (!memNode) throw new Error("Node POST LiteLLM Mem not found")

  if (memNode.parameters.jsonBody.includes("<mensagem_usuario>")) {
    console.log("  [4] POST LiteLLM Mem — XML wrap already present")
  } else {
    const target = `{"role": "user", "content": $('DT Ctto').item.json.leadResponse}`
    if (!memNode.parameters.jsonBody.includes(target))
      throw new Error("Could not find user content in Mem jsonBody")
    memNode.parameters.jsonBody = memNode.parameters.jsonBody.replace(
      target,
      `{"role": "user", "content": ${xmlWrap("$('DT Ctto').item.json.leadResponse")}}`
    )
    console.log("  [4] POST LiteLLM Mem — XML wrap applied")
    patched++
  }

  // ── 5. Log Classify — fix referências a nós inexistentes ───────────────────
  // GET ADMIA Persona e GET ADMIA Router Agent foram removidos e substituídos
  // por Resolve Runtime. O Log Classify ainda referencia os nós antigos,
  // causando erros em ~20-40% das execuções.
  const logNode = wf.nodes.find((n) => n.id === "log1-0001-2222-3333-444455556666")
  if (!logNode) throw new Error("Node Log Classify not found")

  const LOG_FIX_MARKER = "Resolve Runtime"
  if (logNode.parameters.jsCode.includes(LOG_FIX_MARKER)) {
    console.log("  [5] Log Classify — already fixed, skipping")
  } else {
    logNode.parameters.jsCode = `const intent  = $json.choices[0].message.content.trim().toUpperCase();
const runtime = $('Resolve Runtime').item.json;
const persona = runtime?.persona ?? null;
const router  = runtime?.router_agent ?? null;
return [{ json: {
  ...$json,
  _log: {
    classifiedIntent: intent,
    personaName:      persona?.name ?? null,
    routerAlias:      router?.model_alias ?? null,
    leadPhone:        $('DT Ctto').item.json.leadPhone,
    timestamp:        new Date().toISOString()
  }
}}];`
    console.log("  [5] Log Classify — fixed stale node references (GET ADMIA Persona → Resolve Runtime)")
    patched++
  }

  if (patched === 0) {
    console.log("\nNada a atualizar — todas as proteções já estão presentes.")
    return
  }

  console.log(`\n${patched} mudanças aplicadas. Enviando para n8n...`)

  // n8n PUT accepts only these fields — strip server-generated metadata
  // ── Cleanup: remove orphaned connections (nodes that were deleted) ──────────
  const nodeNames = new Set(wf.nodes.map((n) => n.name))
  let orphansRemoved = 0
  Object.entries(wf.connections).forEach(([source, ports]) => {
    Object.entries(ports).forEach(([port, branches]) => {
      branches.forEach((branch, bi) => {
        if (!Array.isArray(branch)) return
        const cleaned = branch.filter((conn) => {
          if (conn?.node && !nodeNames.has(conn.node)) {
            console.log(`  [cleanup] Removed orphaned connection: ${source} → ${conn.node}`)
            orphansRemoved++
            return false
          }
          return true
        })
        branches[bi] = cleaned
      })
    })
  })
  if (orphansRemoved) console.log(`  [cleanup] ${orphansRemoved} orphaned connection(s) removed`)

  // n8n PUT: strip all server-generated fields, keep only writable ones
  // settings only accepts known keys: executionOrder, timezone, etc.
  const { executionOrder, saveManualExecutions, callerPolicy, errorWorkflow } = wf.settings ?? {}
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      ...(executionOrder ? { executionOrder } : {}),
      ...(saveManualExecutions !== undefined ? { saveManualExecutions } : {}),
      ...(callerPolicy ? { callerPolicy } : {}),
      ...(errorWorkflow ? { errorWorkflow } : {}),
    },
    staticData: wf.staticData ?? null,
  }

  const { status: putStatus, body: putBody } = await httpsReq(
    "PUT",
    `${N8N_BASE}/api/v1/workflows/${WF_ID}`,
    {},
    payload
  )

  if (putStatus === 200) {
    console.log(`✅ Workflow atualizado com sucesso (versão ${putBody.versionId ?? "?"})`)
  } else {
    console.error("❌ PUT falhou:", putStatus, JSON.stringify(putBody).substring(0, 200))
    process.exit(1)
  }
}

main().catch((e) => { console.error("❌", e.message); process.exit(1) })
