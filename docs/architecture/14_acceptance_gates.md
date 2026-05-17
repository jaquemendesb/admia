# ADMIA V3 B+ — 14_ACCEPTANCE_GATES

## Purpose
Defines mandatory acceptance criteria for each implementation phase.

Claude must use these gates before considering a phase complete.

A phase is NOT complete merely because code exists.

---

# Acceptance Philosophy

Completion requires:

- functional correctness
- architectural correctness
- production readiness
- security compliance
- deployment compatibility

No fake completion.

---

# Global Mandatory Gates

Every phase must satisfy ALL applicable gates.

---

## Gate 1 — Architecture Compliance

Phase implementation must comply with:

- 00_EXECUTION_RULES.md
- 01_PRODUCT_ARCHITECTURE.md
- 02_DOMAIN_MODEL.md
- 03_DATABASE_RULES.md
- 04_RBAC_MATRIX.md
- 05_UI_INFORMATION_ARCHITECTURE.md
- 06_DESIGN_SYSTEM_RULES.md
- 07_API_BOUNDARIES.md
- 08_WOOCOMMERCE_RULES.md
- 09_AI_RUNTIME_ARCHITECTURE.md
- 10_N8N_RUNTIME_RULES.md
- 11_DEPLOYMENT_RULES.md
- 12_SECURITY_RULES.md
- 13_PHASE_PLAN.md

No architectural drift.

---

## Gate 2 — Production Readiness

Implementation must be production-suitable.

Forbidden:

- toy code
- fake auth
- mock persistence pretending to be final
- debug-only implementation

Required:

- production patterns
- maintainable structure
- explicit error handling

---

## Gate 3 — Security Compliance

Applicable security requirements must be enforced.

Examples:

- auth protection
- RBAC enforcement
- protected mutations
- secret safety
- audit where required

No security hand-waving.

---

## Gate 4 — Deployment Compatibility

Implementation must align with real infrastructure.

Required:

- Docker Swarm compatibility
- Traefik compatibility
- env-driven config
- PostgreSQL compatibility
- Redis compatibility where applicable

No incompatible deployment assumptions.

---

## Gate 5 — Type Safety

TypeScript implementation must be disciplined.

Required:

- strict typing
- avoid careless any abuse
- maintainable types

---

## Gate 6 — Data Integrity

Applicable persistence layers must preserve integrity.

Required:

- schema correctness
- constraints
- FK discipline
- migration correctness

---

## Gate 7 — UX Quality

Applicable UI work must be admin-grade.

Required:

- clarity
- predictable navigation
- usable forms
- readable tables
- actionable states

Forbidden:

- chaotic UX
- broken flows
- dead-end screens

---

## Gate 8 — Observability

Operationally relevant behavior must remain diagnosable.

Examples:

- actionable errors
- visible operational outcomes
- meaningful logs where relevant

---

## Gate 9 — No Scope Leakage

Phase must not contain unauthorized future implementation.

Forbidden examples:

Phase 0 implementing Woo sync
Phase 1 implementing runtime AI orchestration

Discipline required.

---

## Gate 10 — Documentation Transparency

Claude must summarize:

- what was implemented
- files created
- migrations created
- infra changes
- assumptions made
- risks / next dependencies

---

# Phase-Specific Gates

---

# Phase 0 Acceptance

Required:

- app boots
- login works
- protected admin shell exists
- Prisma configured
- DB connectivity working
- migrations working
- Docker deployment artifact exists
- Traefik-compatible deployment exists
- RBAC foundation exists

Reject if:

- auth fake
- DB mocked
- infra ignored

---

# Phase 1 Acceptance

Required:

- navigation implemented
- layout consistent
- design system primitives reusable
- tables/forms/dialog patterns implemented
- visual consistency maintained

Reject if:

- inconsistent UI chaos
- marketing-style admin UI

---

# Phase 2 Acceptance

Required:

- channels CRUD functional
- catalog CRUD functional
- offers CRUD functional
- knowledge CRUD functional
- integration CRUD functional
- secure credential handling

Reject if:

- partial fake CRUD
- insecure credential persistence

---

# Phase 3 Acceptance

Required:

- personas governance functional
- agents governance functional
- prompt governance functional
- routing governance functional

Reject if:

- persona/agent confusion
- hardcoded AI config only

---

# Phase 4 Acceptance

Required:

- contact governance functional
- test contacts functional
- whitelist functional
- blacklist functional
- memory inspection functional
- policy visibility functional

Reject if:

- CRM drift

---

# Phase 5 Acceptance

Required:

- Woo integration works
- connection testing works
- sync works
- sync idempotent
- logs visible
- normalization correct

Reject if:

- duplicated imports
- fragile sync ownership

---

# Phase 6 Acceptance

Required:

- governance/runtime integration functional
- boundaries preserved
- runtime consumption strategy clear

Reject if:

- ADMIA replacing n8n runtime

---

# Phase 7 Acceptance

Required:

- maintenance governance functional
- retention governance functional
- operational tooling usable

Reject if:

- destructive unsafe tooling

---

# Approval Gate Rule

Even if acceptance passes:

Claude MUST stop.

Human approval required.

---

# Final Rule

Done means deployable + governed + correct.
