# ADMIA V3 B+ — 15_MASTER_CLAUDE_TASK

## Master Execution Directive for Claude Code

You are implementing ADMIA.

ADMIA is the administrative governance platform for the Prof Jaque Mendes automation ecosystem.

This is a production system.

This is NOT a prototype.

---

# Mandatory Reading Order

Before writing any code, you MUST fully read and comply with:

1. 00_EXECUTION_RULES.md
2. 01_PRODUCT_ARCHITECTURE.md
3. 02_DOMAIN_MODEL.md
4. 03_DATABASE_RULES.md
5. 04_RBAC_MATRIX.md
6. 05_UI_INFORMATION_ARCHITECTURE.md
7. 06_DESIGN_SYSTEM_RULES.md
8. 07_API_BOUNDARIES.md
9. 08_WOOCOMMERCE_RULES.md
10. 09_AI_RUNTIME_ARCHITECTURE.md
11. 10_N8N_RUNTIME_RULES.md
12. 11_DEPLOYMENT_RULES.md
13. 12_SECURITY_RULES.md
14. 13_PHASE_PLAN.md
15. 14_ACCEPTANCE_GATES.md
16. 16_PROJECT_STRUCTURE.md

These documents are binding.

Do not reinterpret them casually.

---

# Mandatory Artifact Analysis

Before implementation, analyze existing project artifacts:

- brand.md
- docker_01-chatwoot-admin.yaml
- docker_02-chatwoot-api.yaml
- docker_03-chatwoot-sidekiq.yaml
- docker_litellm.yml
- docker_litellm_config.yaml
- docker_waha.yaml

Purpose:

- understand infrastructure conventions
- understand deployment conventions
- understand ecosystem branding

Do not ignore these references.

---

# Product Summary

ADMIA governs:

- commerce administration
- AI governance
- contact governance
- operational governance
- integrations governance

ADMIA does NOT replace:

- n8n runtime orchestration
- LiteLLM AI gateway
- WAHA transport

ADMIA is the administrative governance platform.

---

# Technical Constraints

Mandatory:

- Next.js fullstack
- TypeScript strict
- App Router
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Redis compatibility
- Docker Swarm deployment
- Traefik compatibility
- Project structure conventions per 16_PROJECT_STRUCTURE.md

Target domain:

admia.jaquemendes.com

External network:

pjm-network

---

# Architecture Constraints

Ownership rules:

ADMIA:
- governance platform
- admin UI
- admin APIs
- CRUD
- auth
- RBAC

n8n:
- runtime orchestration

LiteLLM:
- model abstraction

WAHA:
- WhatsApp transport

Redis:
- transient runtime state

PostgreSQL:
- source of truth

Do not violate these boundaries.

---

# Security Requirements

Mandatory:

- session auth
- RBAC
- protected APIs
- encrypted credentials
- secure password hashing
- audit logging
- destructive action safeguards

No demo auth.
No fake security.

---

# UI Requirements

ADMIA is an admin SaaS UI.

Not marketing UI.

Use brand identity subtly.

Optimize for:

- clarity
- maintainability
- admin usability
- scalable navigation

---

# Execution Strategy

Implementation MUST be phase-based.

Mandatory sequence:

Phase 0 — Foundation
Phase 1 — Design System
Phase 2 — Commerce CRUD
Phase 3 — AI Governance
Phase 4 — Contact Governance
Phase 5 — WooCommerce Sync
Phase 6 — Runtime Integration
Phase 7 — Operations & Maintenance

No phase skipping.

---

# Approval Gate Rule

After EACH phase:

STOP.

Provide:

- implementation summary
- files created
- migrations created
- infra changes
- assumptions
- risks

Then request approval.

Do NOT continue autonomously.

---

# Product-Specific Constraints

WooCommerce:

- multi-store support
- hybrid catalog architecture
- manual catalog coexistence
- Woo source ownership rules
- ADMIA governance ownership rules

AI:

Separate:
- personas
- agents
- policies
- business context
- runtime context

Contacts:

Administrative governance only.

NOT CRM.

---

# Code Quality Rules

Required:

- production-quality code
- strict typing
- modular architecture
- maintainable patterns
- explicit validation
- safe migrations
- operational diagnostics

Forbidden:

- toy code
- fake mocks pretending to be final
- uncontrolled hacks
- spaghetti architecture

---

# Explicit Anti-Patterns

Forbidden:

- making n8n the business backend
- provider hardcoding everywhere
- giant prompt monster architecture
- fake auth
- insecure secret handling
- client-only authorization
- deployment assumptions incompatible with Docker Swarm
- marketing-style admin UI

---

# Initial Task

BEGIN WITH:

Phase 0 — Foundation

Only Phase 0.

Do not begin future phases.

---

# Final Directive

If uncertain:
DO NOT GUESS.
ASK.
