# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

This repository implements **ADMIA** — the administrative governance platform for the Prof Jaque Mendes automation ecosystem. Target domain: `admia.jaquemendes.com`.

ADMIA is **not** a prototype. All code is production-grade from Phase 0 onward.

---

## Mandatory Reading Before Any Implementation

All architecture documents in `docs/architecture/` are binding. Read them in this order before touching code:

1. `00_execution_rules.md` — binding constraints, scope control, approval gates
2. `01_product_architecture.md` — product domains and ecosystem map
3. `02_domain_model.md` — 24 core database entities
4. `03_database_rules.md` — PostgreSQL + Prisma rules
5. `04_rbac_matrix.md` — SUPER_ADMIN / ADMIN / READONLY matrix
6. `05_ui_information_architecture.md` — mandatory 6-section navigation hierarchy
7. `06_design_system_rules.md` — Tailwind + shadcn/ui, brand tokens
8. `07_api_boundaries.md` — ownership boundaries between ADMIA / n8n / LiteLLM / WAHA
9. `08_woocommerce_rules.md` — multi-store, hybrid catalog, field ownership
10. `09_ai_runtime_architecture.md` — 7 mandatory AI governance layers
11. `10_n8n_runtime_rules.md` — runtime orchestration rules (n8n owns this, not ADMIA)
12. `11_deployment_rules.md` — Docker Swarm + Traefik conventions
13. `12_security_rules.md` — auth, RBAC, encryption, audit requirements
14. `13_phase_plan.md` — 8-phase roadmap with approval gates
15. `14_acceptance_gates.md` — per-phase completion criteria
16. `16_project_structure.md` — **mandatory** directory layout and naming conventions

Also analyze `brand.md` and all `docker_*.yaml` / `docker_*.yml` files for infrastructure and visual identity conventions before writing any UI or Docker artifacts.

**When uncertain: DO NOT GUESS. ASK.**

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js (App Router, fullstack) |
| Language | TypeScript strict |
| ORM | Prisma |
| Database | PostgreSQL — existing DB `pjm_automation_ai` |
| Cache/State | Redis (transient state only) |
| UI components | shadcn/ui |
| Styling | Tailwind CSS |
| Auth | Auth.js / NextAuth-compatible session auth |
| Validation | Zod (all mutation endpoints) |
| Containerization | Docker Swarm |
| Ingress | Traefik with Let's Encrypt TLS |

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Prisma: create migration after schema change
npx prisma migrate dev --name <migration-name>

# Prisma: apply migrations (CI / production)
npx prisma migrate deploy

# Prisma: regenerate client after schema edit
npx prisma generate

# Prisma: open DB browser
npx prisma studio

# Seed database
npx prisma db seed
```

---

## Mandatory Project Structure

Do not invent or restructure. Follow `16_project_structure.md` exactly:

```
admia/
├── app/
│   ├── (auth)/login/          # Login route (unauthenticated)
│   ├── (dashboard)/           # All protected admin routes
│   │   ├── dashboard/
│   │   ├── commerce/
│   │   ├── ai/
│   │   ├── contacts/
│   │   ├── operations/
│   │   └── administration/
│   └── api/                   # API routes grouped by domain
│       ├── auth/
│       ├── channels/
│       ├── catalog/
│       ├── offers/
│       ├── knowledge/
│       ├── integrations/
│       ├── personas/
│       ├── agents/
│       ├── contacts/
│       ├── policies/
│       ├── memory/
│       ├── config/
│       ├── maintenance/
│       ├── audit/
│       └── users/
├── components/
│   ├── ui/                    # shadcn/ui primitives ONLY — no business components here
│   ├── layout/                # sidebar, topbar, breadcrumbs, shell wrappers
│   ├── tables/
│   ├── forms/
│   ├── dialogs/
│   ├── status/
│   ├── commerce/
│   ├── ai/
│   ├── contacts/
│   ├── operations/
│   └── administration/
├── lib/
│   ├── auth/                  # session helpers
│   ├── db/                    # Prisma access patterns
│   ├── rbac/                  # authorization helpers
│   ├── crypto/                # encryption / hashing
│   ├── audit/                 # audit log creation
│   ├── validation/            # Zod schemas
│   ├── integrations/woo/      # WooCommerce integration logic
│   ├── services/              # business service orchestration
│   └── utils/                 # pure generic helpers only
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── config/
│   ├── navigation.ts
│   ├── permissions.ts
│   ├── statuses.ts
│   └── constants.ts
├── hooks/                     # React hooks only (no business services)
├── types/                     # DTOs, API contracts, domain types
├── scripts/                   # seed / migration helpers / maintenance scripts
├── docker/                    # Dockerfile + docker-stack.yml
└── docs/architecture/         # All V3 B+ architecture documents
```

**Naming conventions (enforced):**
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Variables/functions: `camelCase`
- Database fields: `snake_case`

**API route handlers must be thin.** All business logic belongs in `lib/services/`.

---

## Architecture Boundaries

These boundaries are non-negotiable:

| System | Owns | Forbidden from |
|---|---|---|
| **ADMIA** | admin UI, admin APIs, CRUD, auth, RBAC, governance | runtime orchestration, n8n flows, AI invocation |
| **n8n** | workflow orchestration, runtime routing, AI sequencing | owning business source of truth, becoming catalog DB |
| **LiteLLM** | model abstraction, provider routing | business governance, admin persistence |
| **WAHA** | WhatsApp transport | business logic, governance persistence |
| **PostgreSQL** | source of truth | — |
| **Redis** | transient state (debounce, locks, automation state) | permanent business data |

Runtime AI invocation path: `WAHA → n8n → LiteLLM → provider`. ADMIA governs configuration; it does NOT sit in this path.

---

## RBAC Summary

Three roles with server-side enforcement at route, API, and service layers. Client-side UI hiding alone is not authorization.

| Role | Authority |
|---|---|
| `SUPER_ADMIN` | Full platform governance including user management, security settings, destructive actions |
| `ADMIN` | Day-to-day operations; cannot manage users, roles, security settings, or run destructive purges |
| `READONLY` | View-only across all domains |

Key restriction: only `SUPER_ADMIN` can create/delete users, modify roles, change security settings, or execute destructive global actions.

---

## Database Rules

- All PKs: UUID
- All entities: `created_at`, `updated_at`; soft-delete via `deleted_at` for business entities (see `03_database_rules.md` for the full list)
- All relationships: explicit FK constraints — no string pseudo-relations or JSON fake-relational modeling
- Passwords: hashed (bcrypt or argon2) — never plain text
- Integration credentials: encrypted at rest — never plain text
- Migrations: deterministic, versioned, production-safe — do not use `prisma db push` in production
- Database: `pjm_automation_ai` on existing PostgreSQL in the Docker Swarm

---

## Security Rules

- All admin routes require session authentication
- All mutations require Zod validation — never trust raw client input
- All sensitive mutations (integrations, RBAC, users, AI config, destructive actions) require audit log entries
- Secrets only via environment variables — never hardcoded
- Sensitive secrets in UI must be masked, not displayed in full

---

## Docker / Deployment Conventions

Study the existing `docker_*.yaml` files before creating any deployment artifact. Key patterns:

- Network: `pjm-network` (external) — all services must join it
- Ingress: Traefik labels (see below pattern)
- TLS: Let's Encrypt via `letsencryptresolver`
- Entry point: `websecure`
- Production domain: `admia.jaquemendes.com`
- ADMIA app port: 3000 (Next.js default)

Standard Traefik label set for ADMIA:
```yaml
labels:
  - traefik.enable=true
  - traefik.docker.network=pjm-network
  - traefik.http.routers.admia.rule=Host(`admia.jaquemendes.com`)
  - traefik.http.routers.admia.entrypoints=websecure
  - traefik.http.routers.admia.tls.certresolver=letsencryptresolver
  - traefik.http.routers.admia.service=admia
  - traefik.http.services.admia.loadbalancer.server.port=3000
  - traefik.http.services.admia.loadbalancer.passHostHeader=true
```

Deployment target is Docker Swarm — do not assume Vercel, serverless, or plain compose semantics.

---

## Brand / Visual Identity

ADMIA is an **admin SaaS UI** — not a marketing site. Use `brand.md` for color tokens interpreted for admin software context.

Primary brand tokens for ADMIA UI (Prof Jaque Mendes palette):

| Token | HEX | Role in admin UI |
|---|---|---|
| `brand-navy` | `#24224C` | Primary text, sidebar background, CTA buttons |
| `brand-sky` | `#C0E3EB` | Subtle accents, secondary backgrounds |
| `brand-cream` | `#F9F3ED` | Page background |
| `brand-pink` | `#DD60A0` | Decorative only — never for functional text |
| `brand-yellow` | `#FFD055` | Badges, short highlights only — validated contrast required |

Never use the TudodeProf (green) or DGD (red/dark blue) palettes inside ADMIA.

---

## Phase Discipline

Implementation is strictly phased. Never implement future phases early:

| Phase | Scope |
|---|---|
| **0 — Foundation** | Project skeleton, auth, RBAC, Prisma, admin shell, Docker/Traefik |
| **1 — Design System** | Navigation, layout, reusable UI primitives, table/form/dialog patterns |
| **2 — Commerce CRUD** | Channels, catalog, offers, knowledge base, integrations governance |
| **3 — AI Governance** | Personas, agents, prompt templates, routing rules, model alias governance |
| **4 — Contact Governance** | Contacts, memory inspection, whitelist/blacklist, policy logs |
| **5 — WooCommerce Sync** | Woo connection, sync, idempotent import, sync logs |
| **6 — Runtime Integration** | Governance/runtime integration, n8n + LiteLLM config compatibility |
| **7 — Operations** | Maintenance jobs, retention controls, purge governance, health visibility |

**After each phase: STOP. Provide implementation summary, files created, migrations, infra changes, assumptions, risks, and acceptance checklist from `14_acceptance_gates.md`. Wait for approval.**

---

## Existing Ecosystem Infrastructure

| Service | Domain | Purpose |
|---|---|---|
| Chatwoot UI | `chat.jaquemendes.com` | Customer messaging admin |
| Chatwoot API | `chatapi.jaquemendes.com` | Chatwoot API endpoint |
| LiteLLM | `routerllm.jaquemendes.com` | AI model gateway |
| WAHA | `waha.jaquemendes.com` | WhatsApp transport |
| ADMIA (target) | `admia.jaquemendes.com` | Governance platform (this app) |

All services share the `pjm-network` Docker overlay network.
