import { prisma } from "@/lib/db/client"

// ── Persona ───────────────────────────────────────────────────────────────────

export async function getRuntimePersona(slug?: string) {
  if (slug) {
    return prisma.persona.findFirst({
      where: { slug, active: true, deleted_at: null },
      select: { id: true, name: true, slug: true, system_prompt: true, tone: true, language: true },
    })
  }
  return prisma.persona.findFirst({
    where: { is_default: true, active: true, deleted_at: null },
    select: { id: true, name: true, slug: true, system_prompt: true, tone: true, language: true },
  })
}

// ── Agents ────────────────────────────────────────────────────────────────────

export async function getRuntimeAgents(role?: string) {
  return prisma.aiAgent.findMany({
    where: {
      active: true,
      deleted_at: null,
      ...(role && { agent_role: role as never }),
    },
    select: {
      id: true, name: true, slug: true, agent_role: true,
      model_alias: true, prompt_template: true,
    },
    orderBy: { agent_role: "asc" },
  })
}

// ── Knowledge ─────────────────────────────────────────────────────────────────

export async function getRuntimeKnowledge(channelSlug?: string) {
  let channelId: string | undefined
  if (channelSlug) {
    const channel = await prisma.businessChannel.findFirst({
      where: { slug: channelSlug, active: true, deleted_at: null },
      select: { id: true },
    })
    channelId = channel?.id
  }

  return prisma.knowledgeBase.findMany({
    where: {
      active: true,
      deleted_at: null,
      ...(channelId !== undefined && { business_channel_id: channelId }),
    },
    select: { id: true, title: true, slug: true, content: true, knowledge_type: true },
    orderBy: { knowledge_type: "asc" },
  })
}

// ── Automation Config ─────────────────────────────────────────────────────────

export async function getRuntimeConfig(): Promise<Record<string, string>> {
  const rows = await prisma.automationConfig.findMany({
    select: { config_key: true, config_value: true },
  })
  return Object.fromEntries(rows.map((r) => [r.config_key, r.config_value]))
}

// ── Contact Policy Check ──────────────────────────────────────────────────────

export interface ContactPolicyCheck {
  contact_id: string | null
  phone: string
  blacklisted: boolean
  whitelisted: boolean
  test_mode: boolean
  active_policies: { policy_type: string; notes: string | null }[]
}

export async function checkContactPolicy(phone: string): Promise<ContactPolicyCheck> {
  const contact = await prisma.contact.findFirst({
    where: { phone, deleted_at: null },
    select: {
      id: true,
      contact_policies: {
        where: { active: true },
        select: { policy_type: true, notes: true },
      },
    },
  })

  if (!contact) {
    return { contact_id: null, phone, blacklisted: false, whitelisted: false, test_mode: false, active_policies: [] }
  }

  const policies = contact.contact_policies
  return {
    contact_id: contact.id,
    phone,
    blacklisted: policies.some((p) => p.policy_type === "BLACKLIST"),
    whitelisted: policies.some((p) => p.policy_type === "WHITELIST"),
    test_mode: policies.some((p) => p.policy_type === "TEST"),
    active_policies: policies,
  }
}

// ── Catalog Context ───────────────────────────────────────────────────────────

export async function getRuntimeCatalog(channelSlug?: string, q?: string) {
  let channelId: string | undefined
  if (channelSlug) {
    const channel = await prisma.businessChannel.findFirst({
      where: { slug: channelSlug, active: true, deleted_at: null },
      select: { id: true },
    })
    channelId = channel?.id
  }

  const textFilter = buildTextFilter(q)

  if (channelId) {
    const assignments = await prisma.channelAssignment.findMany({
      where: {
        business_channel_id: channelId,
        deleted_at: null,
        visible: true,
        catalog_item: { active: true, deleted_at: null, ...textFilter },
      },
      include: {
        catalog_item: {
          select: {
            id: true, title: true, slug: true, item_type: true,
            short_description: true, price: true, sale_price: true,
            access_url: true, active: true,
          },
        },
      },
      orderBy: { priority: "asc" },
      take: 15,
    })
    return assignments.map((a) => ({ ...a.catalog_item, assignment_role: a.assignment_role }))
  }

  return prisma.catalogItem.findMany({
    where: { active: true, deleted_at: null, ...textFilter },
    select: {
      id: true, title: true, slug: true, item_type: true,
      short_description: true, price: true, sale_price: true,
      access_url: true,
    },
    take: 15,
    orderBy: { title: "asc" },
  })
}

function buildTextFilter(q?: string) {
  if (!q) return {}
  const words = q
    .toLowerCase()
    .replace(/[^\w\sáéíóúãõâêîôûàèìòùç]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 6)
  if (words.length === 0) return {}
  return {
    OR: words.flatMap((word) => [
      { title: { contains: word, mode: "insensitive" as const } },
      { short_description: { contains: word, mode: "insensitive" as const } },
    ]),
  }
}
