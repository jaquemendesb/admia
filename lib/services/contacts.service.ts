import { prisma } from "@/lib/db/client"
import type {
  UpdateContactInput,
  CreateContactPolicyInput,
  UpdateContactPolicyInput,
  UpdateContactMemoryInput,
} from "@/lib/validation/contacts"

// ── Contacts ─────────────────────────────────────────────────────────────────

export interface ContactListOptions {
  search?: string
  active?: boolean
  page?: number
  pageSize?: number
}

export async function listContacts(opts: ContactListOptions = {}) {
  const { search, active, page = 1, pageSize = 50 } = opts
  const where = {
    deleted_at: null,
    ...(active !== undefined && { active }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  }
  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contact_policies: { where: { active: true }, orderBy: { created_at: "desc" } },
        _count: { select: { conversations: true, contact_memory: true } },
      },
    }),
    prisma.contact.count({ where }),
  ])
  return { contacts, total, page, pageSize }
}

export async function getContact(id: string) {
  return prisma.contact.findFirst({
    where: { id, deleted_at: null },
    include: {
      contact_policies: { orderBy: { created_at: "desc" } },
      contact_memory: { orderBy: { memory_key: "asc" } },
      _count: { select: { conversations: true, messages: true } },
    },
  })
}

export async function updateContact(id: string, data: UpdateContactInput) {
  return prisma.contact.update({ where: { id }, data })
}

export async function deleteContact(id: string) {
  return prisma.contact.update({ where: { id }, data: { deleted_at: new Date() } })
}

// ── Contact Policies ──────────────────────────────────────────────────────────

export async function listContactPolicies(contactId: string) {
  return prisma.contactPolicy.findMany({
    where: { contact_id: contactId },
    orderBy: { created_at: "desc" },
  })
}

export async function createContactPolicy(contactId: string, data: CreateContactPolicyInput) {
  return prisma.contactPolicy.create({
    data: { ...data, contact_id: contactId },
  })
}

export async function updateContactPolicy(id: string, data: UpdateContactPolicyInput) {
  return prisma.contactPolicy.update({ where: { id }, data })
}

export async function deleteContactPolicy(id: string) {
  return prisma.contactPolicy.delete({ where: { id } })
}

// ── Contact Memory ────────────────────────────────────────────────────────────

export async function listContactMemory(contactId: string) {
  return prisma.contactMemory.findMany({
    where: { contact_id: contactId },
    orderBy: { memory_key: "asc" },
  })
}

export async function updateContactMemory(id: string, data: UpdateContactMemoryInput) {
  return prisma.contactMemory.update({ where: { id }, data })
}

export async function deleteContactMemory(id: string) {
  return prisma.contactMemory.delete({ where: { id } })
}

// ── Policy Logs ───────────────────────────────────────────────────────────────

export async function listPolicyLogs(contactId: string) {
  return prisma.policyLog.findMany({
    where: { contact_id: contactId },
    orderBy: { created_at: "desc" },
    take: 100,
  })
}

export async function listAllActivePolicies() {
  return prisma.contactPolicy.findMany({
    where: { active: true },
    orderBy: { created_at: "desc" },
    include: { contact: { select: { id: true, name: true, phone: true } } },
  })
}
