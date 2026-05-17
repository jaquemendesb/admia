# ADMIA V3 B+ — 07_API_BOUNDARIES

## Purpose
Defines architectural API ownership boundaries.

Claude must respect these boundaries.

This prevents domain leakage and bad coupling.

---

# Core Principle

ADMIA is the administrative source of truth.

n8n is the runtime orchestrator.

LiteLLM is the AI gateway abstraction.

WAHA is the WhatsApp transport.

Responsibilities must remain separated.

---

# Ownership Boundaries

## ADMIA (Next.js Fullstack)
Owns:

- admin UI
- admin authentication
- RBAC authorization
- business CRUD
- contact governance CRUD
- AI governance CRUD
- integrations CRUD
- operational governance CRUD
- maintenance execution endpoints
- admin-facing operational APIs

ADMIA is the governance platform.

---

## n8n
Owns:

- inbound webhook runtime
- workflow orchestration
- runtime routing decisions
- AI invocation workflow sequencing
- debounce workflow usage
- runtime context orchestration

n8n is NOT a business system.

Forbidden for n8n:

- owning business source of truth
- becoming catalog database
- becoming admin configuration system
- replacing governance APIs

---

## LiteLLM
Owns:

- model abstraction
- provider routing
- LLM endpoint standardization

Forbidden:

- business governance
- admin persistence
- operational configuration ownership

---

## WAHA
Owns:

- WhatsApp transport
- inbound message transport
- outbound message delivery

Forbidden:

- business logic ownership
- governance persistence

---

## PostgreSQL
Owns:

persistent source of truth.

---

## Redis
Owns:

transient runtime state only.

Examples:
- debounce
- runtime locks
- temporary session-like automation state

Forbidden:

permanent business data.

---

# Admin API Domain Ownership

ADMIA should expose protected admin APIs.

Base convention:

/api/*

Authenticated only.

RBAC enforced.

---

# Mandatory Admin API Domains

## Channels

/api/channels

Purpose:
Business channel governance.

Capabilities:
- list
- detail
- create
- update
- deactivate

---

## Integrations

/api/integrations

Purpose:
External integration governance.

Capabilities:
- CRUD
- connection testing
- sync trigger

---

## Catalog

/api/catalog

Purpose:
Unified catalog governance.

Capabilities:
- CRUD
- filtering
- source governance

---

## Offers

/api/offers

Purpose:
Bundle governance.

---

## Knowledge

/api/knowledge

Purpose:
Knowledge governance.

---

## Personas

/api/personas

Purpose:
Persona governance.

---

## Agents

/api/agents

Purpose:
AI agent governance.

---

## Contacts

/api/contacts

Purpose:
Administrative contact governance.

---

## Policies

/api/policies

Purpose:
Whitelist / blacklist / test governance.

---

## Memory

/api/memory

Purpose:
Contact memory inspection/governance.

---

## Config

/api/config

Purpose:
Operational runtime configuration.

---

## Maintenance

/api/maintenance

Purpose:
Operational administrative execution.

---

## Users

/api/users

Purpose:
Admin identity governance.

SUPER_ADMIN only.

---

## Audit

/api/audit

Purpose:
Administrative audit visibility.

---

# Runtime Integration Boundary

ADMIA does NOT replace n8n runtime.

ADMIA provides configuration + governance.

n8n consumes governance data.

---

# Runtime Data Access Strategy

Preferred runtime interaction:

n8n reads governance data from ADMIA APIs or DB depending approved architecture.

Claude should not invent duplicated runtime truth stores.

Single source principle required.

---

# AI Invocation Boundary

Runtime AI invocation path:

WAHA
→ n8n
→ LiteLLM
→ provider

ADMIA does NOT directly replace runtime orchestration.

ADMIA governs configuration.

---

# WooCommerce Integration Boundary

Woo sync orchestration may be initiated by ADMIA.

ADMIA owns:
- integration configuration
- sync governance
- sync logs
- source normalization

n8n should not become Woo admin backend.

---

# Authentication Boundary

Admin auth belongs to ADMIA.

Runtime customer identity handling belongs to runtime automation.

Do not merge these concerns.

---

# Webhook Boundary

Runtime inbound webhooks:

owned by n8n.

Admin webhooks:

owned by ADMIA if needed.

Separation required.

---

# Error Ownership Rule

Admin CRUD/API errors:
ADMIA responsibility.

Runtime orchestration failures:
n8n responsibility.

LLM/provider failures:
LiteLLM/runtime handling responsibility.

Transport failures:
WAHA responsibility.

---

# Final Rule

If a feature makes n8n look like the business application:
architecture is wrong.

