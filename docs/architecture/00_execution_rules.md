# ADMIA V3 B+ — 00_EXECUTION_RULES

## Purpose
This document defines mandatory execution rules for Claude during implementation of the ADMIA platform.

These rules are binding architectural constraints.
Claude must not reinterpret them.

---

## Project Context
ADMIA is the administrative governance platform for the Prof Jaque Mendes automation ecosystem.

Existing ecosystem components:
- WAHA (WhatsApp gateway)
- n8n (automation orchestrator)
- LiteLLM (AI gateway)
- PostgreSQL database (existing: pjm_automation_ai)
- Redis infrastructure
- Docker Swarm environment
- Traefik reverse proxy

Target admin domain:
admia.jaquemendes.com

---

## Mandatory Artifact Analysis
Before writing code, Claude MUST analyze the following project artifacts:

- brand.md
- docker_01-chatwoot-admin.yaml
- docker_02-chatwoot-api.yaml
- docker_03-chatwoot-sidekiq.yaml
- docker_litellm.yml
- docker_litellm_config.yaml
- docker_waha.yaml

Rules:
- brand.md is mandatory visual identity reference
- Docker YAMLs are infrastructure convention references
- naming conventions must be respected
- deployment conventions must be respected
- do not invent disconnected infrastructure patterns

---

## Execution Strategy
Implementation MUST happen phase by phase.

Required sequence:
1. Phase 0 — Foundation
2. Phase 1 — Design System
3. Phase 2 — Commerce CRUD
4. Phase 3 — AI Governance
5. Phase 4 — Contact Governance
6. Phase 5 — WooCommerce Sync
7. Phase 6 — Runtime Integration
8. Phase 7 — Operations & Maintenance

Never implement the full platform in one step.

---

## Approval Gate Rule
After each phase:
- stop implementation
- summarize what was implemented
- request approval before continuing

No autonomous continuation.

---

## Scope Control Rule
Claude MUST NOT:
- invent features outside approved scope
- expand roadmap proactively
- implement future-phase features early
- redesign approved architecture
- replace existing infrastructure assumptions

If uncertainty exists: ASK.

---

## Production Readiness Rule
All generated code MUST be production-grade.

Forbidden:
- toy implementations
- fake placeholders
- demo-only auth
- temporary in-memory persistence as production behavior

Required:
- strict typing
- real persistence
- deterministic migrations
- structured error handling
- modular architecture
- maintainable code

---

## Architecture Boundary Rule
Ownership boundaries are mandatory.

### Next.js fullstack owns
- admin UI
- admin APIs
- RBAC
- auth
- CRUD domain logic
- integrations management
- operational administration

### n8n owns
- runtime automation orchestration
- inbound message workflow
- AI runtime flow control

### LiteLLM owns
- model abstraction
- provider routing

### WAHA owns
- WhatsApp transport

### Redis owns
- debounce
- runtime locks
- transient automation state

### PostgreSQL owns
- source of truth persistence

These boundaries are not negotiable.

---

## UI Rule
This is an ADMIN platform.

It is NOT:
- a landing page
- a marketing site
- a course sales frontend

UI principles:
- SaaS admin UX
- clean hierarchy
- low confusion
- strong information architecture
- subtle ecosystem branding

Use brand.md as reference, interpreted for admin software.

---

## Security Rule
Security is mandatory from foundation.

Required baseline:
- RBAC foundation
- session auth architecture
- secure password hashing
- encrypted integration credentials
- route guards
- audit logging architecture
- destructive action confirmations

---

## Database Rule
Required:
- PostgreSQL
- Prisma ORM
- UUID PKs
- FK discipline
- proper indexes
- timestamps
- soft delete where applicable
- retention-aware design

No sloppy schema generation.

---

## Documentation Rule
Each phase output should include:
- files created
- migrations created
- architectural decisions taken
- deployment changes
- next phase prerequisites

---

## Project Structure Binding Rule

16_PROJECT_STRUCTURE.md is a binding architecture reference.
Claude must follow the mandated project organization conventions unless a narrowly justified implementation detail requires a minimal deviation.
Do not invent arbitrary project structures.

---

## Final Instruction
When uncertain:
DO NOT GUESS.
ASK.
