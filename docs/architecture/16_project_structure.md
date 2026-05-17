# ADMIA V3 B+ — 16_PROJECT_STRUCTURE

## Purpose
Defines the mandatory project structure and code organization conventions.

Claude must follow this structure unless a clearly justified implementation detail requires a minimal variation.

This prevents arbitrary architecture drift.

---

# Core Stack

Mandatory implementation stack:

- Next.js fullstack
- App Router
- TypeScript (strict)
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- shadcn/ui
- Auth.js / NextAuth compatible auth architecture
- Zod validation

---

# Architecture Philosophy

ADMIA is a single fullstack administrative application.

It is NOT:

- a microservices platform
- a monorepo with fragmented apps
- a separated frontend/backend product unless explicitly approved

Preferred architecture:

Next.js fullstack admin application
with modular domain organization.

---

# Root Structure

Mandatory baseline structure:

```text
admia/
├── app/
├── components/
├── lib/
├── prisma/
├── docs/
├── public/
├── hooks/
├── types/
├── config/
├── scripts/
├── docker/
├── .env.example
├── package.json
├── Dockerfile
├── docker-stack.yml
```

This is the preferred baseline.

---

# App Router Structure

Mandatory routing architecture:

```text
app/
├── (auth)/
│   └── login/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── commerce/
│   ├── ai/
│   ├── contacts/
│   ├── operations/
│   └── administration/
│
├── api/
│   ├── auth/
│   ├── channels/
│   ├── catalog/
│   ├── offers/
│   ├── knowledge/
│   ├── integrations/
│   ├── personas/
│   ├── agents/
│   ├── contacts/
│   ├── policies/
│   ├── memory/
│   ├── config/
│   ├── maintenance/
│   ├── audit/
│   └── users/
```

---

# Routing Principles

Rules:

- auth routes separated
- dashboard routes grouped
- API routes grouped by domain
- predictable navigation mapping

No chaotic route scattering.

---

# Components Structure

Mandatory modular UI organization:

```text
components/
├── ui/
├── layout/
├── tables/
├── forms/
├── dialogs/
├── status/
├── commerce/
├── ai/
├── contacts/
├── operations/
├── administration/
```

---

## Rules

### ui/
Reserved for shadcn/ui primitives.

Do not pollute with business components.

---

### layout/
Examples:

- sidebar
- topbar
- breadcrumbs
- shell wrappers

---

### domain folders
Domain-specific reusable components only.

Examples:

commerce/product tables
contacts/policy badges
ai/agent forms

---

# lib Structure

Mandatory service architecture:

```text
lib/
├── auth/
├── db/
├── rbac/
├── crypto/
├── audit/
├── validation/
├── integrations/
│   └── woo/
├── services/
├── utils/
```

---

## lib Rules

### auth/
Authentication/session helpers.

---

### db/
Prisma access patterns.

---

### rbac/
Authorization helpers.

---

### crypto/
Encryption / hashing helpers.

---

### audit/
Audit creation logic.

---

### validation/
Zod schemas.

---

### integrations/
External integration logic.

Initial:
WooCommerce.

---

### services/
Business service orchestration.

---

### utils/
Generic pure helpers.

Avoid dumping business logic here.

---

# Prisma Structure

Mandatory:

```text
prisma/
├── schema.prisma
├── migrations/
├── seeds/
```

---

# Docs Structure

Architecture docs should live in:

```text
docs/architecture/
```

Place all V3 B+ documents here.

---

# Config Structure

Mandatory application config organization:

```text
config/
├── navigation.ts
├── permissions.ts
├── statuses.ts
├── constants.ts
```

Optional additions allowed if justified.

---

# Hooks Structure

Reusable React hooks only.

Examples:

- auth hooks
- table state hooks
- UI state hooks

No dumping business services here.

---

# Types Structure

Shared TypeScript types.

Examples:

- DTOs
- API contracts
- domain types

---

# Scripts Structure

Operational scripts.

Examples:

- seed
- migrations helpers
- maintenance scripts

---

# Docker Structure

Preferred:

```text
docker/
├── Dockerfile
├── docker-stack.yml
```

If root placement better fits existing conventions, acceptable.

But consistency required.

---

# Naming Conventions

Mandatory:

## Files
kebab-case

Examples:

- product-table.tsx
- policy-badge.tsx

---

## Components
PascalCase

Examples:

ProductTable
PolicyBadge

---

## Variables/functions
camelCase

---

## DB naming
snake_case

---

# API Design Rule

Thin route handlers.

Business logic belongs in services/lib.

Avoid giant route handlers.

---

# Validation Rule

Mutation endpoints must validate with Zod.

No raw payload trust.

---

# Runtime Separation Rule

Critical architectural boundary.

ADMIA project must NOT include runtime automation systems.

Forbidden examples:

```text
/n8n/
/flows/
/waha-runtime/
/litellm-runtime/
```

Runtime remains external ecosystem.

---

# Testing Position

MVP may be pragmatic.

But architecture should remain testable.

Do not create untestable spaghetti.

---

# Final Rule

Project structure must optimize:

clarity + modularity + maintainability + architectural discipline
