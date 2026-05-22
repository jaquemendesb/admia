/**
 * n8n Redis Cache Setup
 *
 * 1. Cria workflow "ADMIA Cache Refresh" (webhook → fetch ADMIA → Redis SET → ack ADMIA)
 * 2. Modifica workflow principal (bbA9Ny38Ude2p8gP):
 *    - Adiciona Redis GET Runtime + Resolve Runtime Code + Redis SET Runtime
 *    - Substitui GET ADMIA Agents CONV/SUPP/MEM por Code nodes que leem do cache
 *    - Atualiza POST LiteLLM Classify para referenciar Resolve Runtime
 */

import { readFileSync } from 'fs';

// ─── Config ───────────────────────────────────────────────────────────────────
const lines = readFileSync('.env.tools', 'utf8').split('\n');
const env = {};
for (const l of lines) { const m = l.match(/^([^#=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim(); }

const N8N   = env.N8N_BASE_URL;
const KEY   = env.N8N_API_KEY;
const WF_ID = 'bbA9Ny38Ude2p8gP';

const ADMIA_URL    = 'https://admia.jaquemendes.com';
const RUNTIME_KEY  = env.ADMIA_RUNTIME_KEY || 'Bearer O/RhGlgP4YL1UBFziEA0PGSR6IgqBqTbU9Hl9PqCyj8=';
const CRED_REDIS   = env.N8N_CRED_REDIS_ID;

const h = { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' };

async function api(method, path, body) {
  const r = await fetch(`${N8N}/api/v1${path}`, {
    method, headers: h,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`${method} ${path} → ${r.status}: ${t}`); }
  return r.json();
}

// ─── 1. Create "ADMIA Cache Refresh" workflow ─────────────────────────────────
console.log('Creating ADMIA Cache Refresh workflow...');

const WEBHOOK_SECRET = 'admia-cache-secret-replace-me';
const ADMIA_ACK_URL  = `${ADMIA_URL}/api/runtime/cache/ack`;

const resolveAllCode = `
const ADMIA_URL = '${ADMIA_URL}';
const RUNTIME_KEY = '${RUNTIME_KEY}';
const h = { Authorization: RUNTIME_KEY };

const [pR, rR, cR, sR, mR] = await Promise.all([
  fetch(ADMIA_URL + '/api/runtime/persona?slug=jaque', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=ROUTER', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=CONVERSATION', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=SUPPORT', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=MEMORY', { headers: h }),
]);
const [persona, ar, ac, as_, am] = await Promise.all([pR.json(), rR.json(), cR.json(), sR.json(), mR.json()]);

const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);

return [{ json: {
  persona,
  router_agent: toArr(ar)[0] ?? null,
  agents_conv:  toArr(ac),
  agents_supp:  toArr(as_),
  agents_mem:   toArr(am),
}}];
`.trim();

const buildCacheValueCode = `
return [{ json: { key: 'admia:runtime', value: JSON.stringify($input.item.json) } }];
`.trim();

const ackCode = `
const ADMIA_ACK = '${ADMIA_ACK_URL}';
const RUNTIME_KEY = '${RUNTIME_KEY}';

const success = $input.item.json !== null;
const resources = ['persona', 'router_agent', 'agents_conv', 'agents_supp', 'agents_mem']
  .filter(k => $input.item.json[k] !== null);

await fetch(ADMIA_ACK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: RUNTIME_KEY },
  body: JSON.stringify({ success, resources, error: null }),
});
return [{ json: { ack_sent: true, resources } }];
`.trim();

const cacheRefreshWf = {
  name: 'ADMIA Cache Refresh',
  nodes: [
    {
      id: 'wh-trigger',
      name: 'Webhook Cache Refresh',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        path: 'admia-cache-refresh',
        responseMode: 'responseNode',
        options: {},
      },
      webhookId: 'admia-cache-refresh',
    },
    {
      id: 'respond-ack',
      name: 'Respond Queued',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [460, 300],
      parameters: {
        respondWith: 'json',
        responseBody: '={ "queued": true }',
        options: {},
      },
    },
    {
      id: 'fetch-all',
      name: 'Fetch All ADMIA Runtime',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [680, 300],
      parameters: { jsCode: resolveAllCode },
    },
    {
      id: 'build-cache-val',
      name: 'Build Cache Value',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [900, 300],
      parameters: { jsCode: buildCacheValueCode },
    },
    {
      id: 'redis-set-runtime',
      name: 'Redis SET Runtime Cache',
      type: 'n8n-nodes-base.redis',
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        operation: 'set',
        key: '={{ $json.key }}',
        value: '={{ $json.value }}',
        expire: true,
        ttl: 604800, // 7 days
      },
      credentials: { redis: { id: CRED_REDIS, name: 'Redis' } },
    },
    {
      id: 'send-ack',
      name: 'Send ACK to ADMIA',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1340, 300],
      parameters: { jsCode: ackCode },
    },
  ],
  connections: {
    'Webhook Cache Refresh': { main: [[{ node: 'Respond Queued', type: 'main', index: 0 }, { node: 'Fetch All ADMIA Runtime', type: 'main', index: 0 }]] },
    'Fetch All ADMIA Runtime': { main: [[{ node: 'Build Cache Value', type: 'main', index: 0 }]] },
    'Build Cache Value': { main: [[{ node: 'Redis SET Runtime Cache', type: 'main', index: 0 }]] },
    'Redis SET Runtime Cache': { main: [[{ node: 'Send ACK to ADMIA', type: 'main', index: 0 }]] },
  },
  settings: { executionOrder: 'v1' },
  staticData: null,
};

const created = await api('POST', '/workflows', cacheRefreshWf);
console.log(`✅ Cache Refresh workflow created: ID=${created.id}`);

// Activate it
await api('POST', `/workflows/${created.id}/activate`);
console.log('✅ Cache Refresh workflow activated');

// ─── 2. Modify main workflow ───────────────────────────────────────────────────
console.log('\nFetching main workflow...');
const wf = await api('GET', `/workflows/${WF_ID}`);

// ── 2a. Add new nodes ──────────────────────────────────────────────────────────

const resolveRuntimeCode = `
const ADMIA_URL = '${ADMIA_URL}';
const RUNTIME_KEY = '${RUNTIME_KEY}';

// Input from Redis GET Runtime node
const cached = $input.item.json?.value;
if (cached) {
  return [{ json: { ...JSON.parse(cached), _from_cache: true } }];
}

// Cache miss — fetch everything from ADMIA in parallel
const h = { Authorization: RUNTIME_KEY };
const [pR, rR, cR, sR, mR] = await Promise.all([
  fetch(ADMIA_URL + '/api/runtime/persona?slug=jaque', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=ROUTER', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=CONVERSATION', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=SUPPORT', { headers: h }),
  fetch(ADMIA_URL + '/api/runtime/agents?role=MEMORY', { headers: h }),
]);
const [persona, ar, ac, as_, am] = await Promise.all([pR.json(), rR.json(), cR.json(), sR.json(), mR.json()]);
const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);

return [{ json: {
  persona,
  router_agent: toArr(ar)[0] ?? null,
  agents_conv:  toArr(ac),
  agents_supp:  toArr(as_),
  agents_mem:   toArr(am),
  _from_cache: false,
} }];
`.trim();

const newNodes = [
  {
    id: 'redis-get-runtime',
    name: 'Redis GET Runtime',
    type: 'n8n-nodes-base.redis',
    typeVersion: 1,
    position: [2864, -128],
    parameters: {
      operation: 'get',
      key: 'admia:runtime',
      options: {},
    },
    credentials: { redis: { id: CRED_REDIS, name: 'Redis' } },
  },
  {
    id: 'resolve-runtime',
    name: 'Resolve Runtime',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [3088, -128],
    parameters: { jsCode: resolveRuntimeCode },
  },
  {
    id: 'redis-set-runtime-main',
    name: 'Redis SET Runtime',
    type: 'n8n-nodes-base.redis',
    typeVersion: 1,
    position: [3312, -128],
    parameters: {
      operation: 'set',
      key: 'admia:runtime',
      value: "={{ JSON.stringify($json) }}",
      expire: true,
      ttl: 604800,
    },
    credentials: { redis: { id: CRED_REDIS, name: 'Redis' } },
  },
];

// ── 2b. Replace CONV/SUPP/MEM agent nodes with Code nodes ─────────────────────
const agentCodeNode = (role, field, pos) => ({
  id: `agent-cache-${role.toLowerCase()}`,
  name: `GET ADMIA Agents ${role}`,
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: pos,
  parameters: {
    jsCode: `
const rt = $('Resolve Runtime').item.json;
const agents = rt?.${field};
if (agents && agents.length > 0) return [{ json: agents[0] }];

// Fallback: fetch from ADMIA
const resp = await fetch('${ADMIA_URL}/api/runtime/agents?role=${role}', {
  headers: { Authorization: '${RUNTIME_KEY}' }
});
const data = await resp.json();
return [{ json: Array.isArray(data) ? data[0] : data }];
`.trim(),
  },
});

// Remove existing CONV/SUPP/MEM nodes, replace with Code versions
const existingConv = wf.nodes.find(n => n.name === 'GET ADMIA Agents CONV');
const existingSupp = wf.nodes.find(n => n.name === 'GET ADMIA Agents SUPP');
const existingMem  = wf.nodes.find(n => n.name === 'GET ADMIA Agents MEM');

wf.nodes = wf.nodes
  .filter(n => !['GET ADMIA Agents CONV','GET ADMIA Agents SUPP','GET ADMIA Agents MEM',
                  'GET ADMIA Persona','GET ADMIA Router Agent',
                  'Redis GET Runtime','Resolve Runtime','Redis SET Runtime'].includes(n.name))
  .concat(newNodes)
  .concat([
    agentCodeNode('CONV', 'agents_conv', existingConv?.position ?? [3984, -304]),
    agentCodeNode('SUPP', 'agents_supp', existingSupp?.position ?? [5328, -112]),
    agentCodeNode('MEM',  'agents_mem',  existingMem?.position  ?? [5776,   56]),
  ]);

// ── 2c. Update connections ─────────────────────────────────────────────────────

// IF Responder (true/0) → Redis GET Runtime (instead of GET ADMIA Persona)
wf.connections['IF Responder'] = {
  main: [
    [{ node: 'Redis GET Runtime', type: 'main', index: 0 }],
    [],
  ],
};

// Redis GET Runtime → Resolve Runtime
wf.connections['Redis GET Runtime'] = { main: [[{ node: 'Resolve Runtime', type: 'main', index: 0 }]] };

// Resolve Runtime → Redis SET Runtime
wf.connections['Resolve Runtime'] = { main: [[{ node: 'Redis SET Runtime', type: 'main', index: 0 }]] };

// Redis SET Runtime → POST LiteLLM Classify
wf.connections['Redis SET Runtime'] = { main: [[{ node: 'POST LiteLLM Classify', type: 'main', index: 0 }]] };

// Remove orphaned old nodes from connections
delete wf.connections['GET ADMIA Persona'];
delete wf.connections['GET ADMIA Router Agent'];

// ── 2d. Update POST LiteLLM Classify body expression ─────────────────────────
const classifyNode = wf.nodes.find(n => n.name === 'POST LiteLLM Classify');
classifyNode.parameters.jsonBody = `={{ JSON.stringify({
  "model": ($('Resolve Runtime').item.json.router_agent?.model_alias ?? 'router-fast'),
  "messages": [
    { "role": "system", "content": ($('Resolve Runtime').item.json.router_agent?.prompt_template ?? '') },
    { "role": "user",   "content": $('DT Ctto').item.json.leadResponse }
  ],
  "temperature": 0,
  "max_tokens": 10
}) }}`;

// ── 2e. Save main workflow ─────────────────────────────────────────────────────
console.log('\nSaving main workflow...');
const putResp = await fetch(`${N8N}/api/v1/workflows/${WF_ID}`, {
  method: 'PUT',
  headers: h,
  body: JSON.stringify({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1' },
    staticData: wf.staticData ?? null,
  }),
});

if (!putResp.ok) { console.error('PUT failed:', await putResp.text()); process.exit(1); }
const result = await putResp.json();
console.log(`✅ Main workflow updated. Total nodes: ${result.nodes.length}`);
console.log('\nCache Refresh webhook URL:');
console.log(`  ${N8N}/webhook/admia-cache-refresh`);
console.log('\nNext steps:');
console.log('  1. Add REDIS_URL to ADMIA .env (e.g. redis://redis:6379)');
console.log('  2. Add N8N_CACHE_WEBHOOK_URL=https://automacao.jaquemendes.com/webhook/admia-cache-refresh');
console.log('  3. Redeploy ADMIA');
console.log('  4. Test: save a persona in ADMIA → check n8n executions → check /api/runtime/cache/status');
