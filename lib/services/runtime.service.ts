import { prisma } from "@/lib/db/client"
import { Prisma } from "@prisma/client"

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

type CatalogRow = {
  id: string
  title: string
  slug: string
  item_type: string
  short_description: string | null
  price: string | null
  sale_price: string | null
  access_url: string | null
}

export async function getRuntimeCatalog(channelSlug?: string, q?: string) {
  let channelId: string | undefined
  if (channelSlug) {
    const channel = await prisma.businessChannel.findFirst({
      where: { slug: channelSlug, active: true, deleted_at: null },
      select: { id: true },
    })
    channelId = channel?.id
  }

  const searchTerms = buildSearchTerms(q)

  if (searchTerms.length > 0) {
    // unaccent() normalizes both sides → accent-insensitive search
    const termConditions = searchTerms.map(
      (t) => Prisma.sql`(unaccent(ci.title) ILIKE unaccent(${"%" + t + "%"}) OR unaccent(ci.short_description) ILIKE unaccent(${"%" + t + "%"}))`
    )
    const whereTerms = Prisma.join(termConditions, " OR ")

    if (channelId) {
      return prisma.$queryRaw<(CatalogRow & { assignment_role: string | null })[]>`
        SELECT ci.id, ci.title, ci.slug, ci.item_type,
               ci.short_description, ci.price, ci.sale_price, ci.access_url,
               ca.assignment_role
        FROM channel_assignments ca
        JOIN catalog_items ci ON ci.id = ca.catalog_item_id
        WHERE ca.business_channel_id = ${channelId}
          AND ca.deleted_at IS NULL AND ca.visible = true
          AND ci.active = true AND ci.deleted_at IS NULL
          AND (${whereTerms})
        ORDER BY ca.priority ASC
        LIMIT 15
      `
    }

    return prisma.$queryRaw<CatalogRow[]>`
      SELECT id, title, slug, item_type,
             short_description, price, sale_price, access_url
      FROM catalog_items
      WHERE active = true AND deleted_at IS NULL AND (${whereTerms})
      ORDER BY title ASC
      LIMIT 15
    `
  }

  if (channelId) {
    const assignments = await prisma.channelAssignment.findMany({
      where: {
        business_channel_id: channelId,
        deleted_at: null,
        visible: true,
        catalog_item: { active: true, deleted_at: null },
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
    where: { active: true, deleted_at: null },
    select: {
      id: true, title: true, slug: true, item_type: true,
      short_description: true, price: true, sale_price: true,
      access_url: true,
    },
    take: 15,
    orderBy: { title: "asc" },
  })
}

// Words that appear in almost every product title — useless as search terms
const STOP_WORDS = new Set([
  "atividade", "atividades", "para", "com", "uma", "uns", "umas", "que", "tem",
  "qual", "quais", "como", "sobre", "nos", "nas", "dos", "das", "por", "pelo",
  "pela", "este", "essa", "isso", "ele", "ela", "seu", "sua", "ter", "ser",
  "vai", "vou", "nao", "sim", "mas", "mais", "menos", "muito", "pouco",
  "aqui", "ali", "quando", "onde", "varios", "varias", "algumas", "alguns",
  "outro", "outra", "todo", "toda", "todos", "todas",
])

function buildSearchTerms(q?: string): string[] {
  if (!q) return []

  const normalized = q
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")

  const words = normalized
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 5)

  return [...new Set(words)]
}
