# ADMIA V3 B+ — 13_PHASE_PLAN

## Purpose
Defines the mandatory phased implementation roadmap for Claude.

Claude must follow this execution order.

No scope skipping.
No autonomous roadmap expansion.

---

# Execution Philosophy

ADMIA must be implemented incrementally.

Each phase must produce deployable progress.

Avoid big-bang implementation.

Rules:

- phase discipline
- approval gates
- production readiness
- architectural consistency

---

# Phase 0 — Foundation

## Objective
Establish the technical platform foundation.

This phase creates the implementation base.

No business feature sprawl.

---

## Mandatory Scope

### Project Foundation
- Next.js fullstack project foundation
- TypeScript strict setup
- App Router architecture
- project structure implementation strictly following 16_PROJECT_STRUCTURE.md
- environment config strategy

---

### UI Foundation
- Tailwind setup
- shadcn/ui foundation
- design token baseline
- layout foundation
- navigation shell foundation

---

### Database Foundation
- Prisma setup
- PostgreSQL connectivity
- initial schema foundation
- migration discipline

---

### Auth Foundation
- session auth architecture
- login flow foundation
- protected routes foundation

---

### RBAC Foundation
- role model implementation
- authorization middleware foundation
- protected API pattern

---

### Infra Foundation
- Dockerfile
- swarm deployment artifact
- Traefik-compatible deployment config
- env example strategy

---

### Audit Foundation
- audit architecture baseline

---

## Explicit Exclusions
Do NOT fully implement:

- commerce CRUD
- AI governance CRUD
- contacts CRUD
- integrations UI
- Woo sync runtime

Foundation only.

---

## Phase Deliverables
Expected:

- working login
- protected admin shell
- DB connected
- migrations working
- deployable stack artifact

---

# Approval Gate
STOP.
Request approval.

---

# Phase 1 — Design System

## Objective
Implement admin-grade UI system.

---

## Scope

- layout shell completion
- navigation implementation
- reusable UI primitives
- table patterns
- form patterns
- dialog patterns
- status badge system
- loading states
- empty states
- error state patterns

---

## Deliverables
Visual admin framework usable for future modules.

---

# Approval Gate
STOP.

---

# Phase 2 — Commerce CRUD

## Objective
Implement commercial governance domain.

---

## Scope

### Channels
- CRUD
- relationships

### Catalog
- CRUD
- filters
- search
- assignments

### Offers
- CRUD
- composition

### Knowledge Base
- CRUD

### Integrations Foundation
- integration CRUD UI
- secure credential storage

---

## Exclusions
No Woo sync runtime yet.

---

## Deliverables
Commerce governance operational.

---

# Approval Gate
STOP.

---

# Phase 3 — AI Governance

## Objective
Implement AI governance domain.

---

## Scope

- personas CRUD
- agents CRUD
- prompt templates
- routing rules governance
- model alias governance

---

## Deliverables
AI governance operational.

---

# Approval Gate
STOP.

---

# Phase 4 — Contact Governance

## Objective
Implement administrative contact governance.

---

## Scope

- contacts governance UI
- memory inspection
- test contacts
- whitelist
- blacklist
- policy logs

---

## Explicit Rule
NOT CRM.

---

## Deliverables
Contact governance operational.

---

# Approval Gate
STOP.

---

# Phase 5 — WooCommerce Sync

## Objective
Implement Woo integration runtime.

---

## Scope

- Woo connection test
- manual sync
- scheduled sync governance
- normalized import
- sync logs
- idempotent sync

---

## Deliverables
Woo integration operational.

---

# Approval Gate
STOP.

---

# Phase 6 — Runtime Integration

## Objective
Connect governance platform with runtime ecosystem.

---

## Scope

- runtime config integration
- governance consumption interfaces
- n8n integration boundaries
- LiteLLM config compatibility

---

## Rule
ADMIA does NOT replace runtime orchestration.

---

## Deliverables
Governance/runtime integration functional.

---

# Approval Gate
STOP.

---

# Phase 7 — Operations & Maintenance

## Objective
Operational governance completion.

---

## Scope

- maintenance jobs
- retention controls
- purge governance
- system health visibility
- operational tooling
- audit visibility improvements

---

## Deliverables
Operational administration complete.

---

# Final Approval Gate
STOP.

---

# Phase Discipline Rules

Claude MUST NOT:

- pull future work into earlier phases
- shortcut security
- skip infra discipline
- implement hidden parallel architectures

---

# Final Rule

Implementation order is mandatory.
