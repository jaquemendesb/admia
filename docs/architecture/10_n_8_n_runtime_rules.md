# ADMIA V3 B+ — 10_N8N_RUNTIME_RULES

## Purpose
Defines mandatory runtime orchestration rules for n8n.

Claude must respect these boundaries.

n8n remains the runtime orchestrator.

---

# Core Runtime Ownership

n8n owns:

- inbound webhook runtime
- workflow orchestration
- deterministic runtime decisions
- runtime context assembly
- AI invocation sequencing
- outbound delivery orchestration

n8n does NOT become business governance platform.

---

# Runtime Flow

Mandatory high-level runtime sequence:

1. inbound webhook
2. anti-loop validation
3. message eligibility validation
4. policy enforcement
5. test mode enforcement
6. debounce control
7. context loading
8. routing decision
9. AI invocation
10. persistence
11. outbound delivery

This sequence is intentional.

---

# Inbound Source

Primary inbound source:

WAHA webhook

Expected source responsibilities:
- transport event delivery
- inbound payload transport

Business logic begins in n8n.

---

# Step 1 — Inbound Webhook

Purpose:
Receive inbound transport event.

n8n owns runtime entrypoint.

---

# Step 2 — Anti-Loop Validation

Purpose:
Prevent automation loops.

Mandatory checks:

Examples:
- ignore messages from self
- ignore bot-origin events
- ignore transport echoes

Deterministic logic required.

Not AI-driven.

---

# Step 3 — Message Eligibility Validation

Purpose:
Validate whether event should enter runtime.

Examples:

Allowed MVP:
- text messages

Rejected MVP:
- unsupported media
- malformed payloads
- system noise

---

# Step 4 — Policy Enforcement

Purpose:
Apply governance restrictions.

Deterministic before AI.

Checks:

- blacklist
- whitelist if applicable
- contact restrictions

Policy source:
ADMIA governance data.

---

# Step 5 — Test Mode Enforcement

Purpose:
Safe staged rollout.

Behavior:

If test mode enabled:
Only approved test contacts may receive automation.

All others blocked.

Deterministic enforcement required.

---

# Step 6 — Debounce Control

Purpose:
Prevent fragmented message spam handling.

Example:
User sends multiple rapid messages.

Runtime should consolidate interaction.

---

## Redis Ownership

Redis is mandatory for transient runtime state.

Examples:
- debounce locks
- temporary flow coordination

Not permanent persistence.

---

## Example Keys
Conceptual only:

debounce:{phone}
lock:{phone}

Implementation may vary.

---

# Step 7 — Context Loading

Purpose:
Assemble relevant interaction context.

Potential sources:

- contact profile
- policy state
- memory
- recent messages
- business context
- runtime config

Source of truth:
ADMIA governance data.

---

# Step 8 — Routing Decision

Purpose:
Choose runtime handling path.

Examples:
- conversation response
- support handling
- routing branch

Deterministic orchestration may combine AI-assisted reasoning.

n8n owns orchestration.

---

# Step 9 — AI Invocation

Runtime path:

n8n
→ LiteLLM
→ provider

Mandatory:
Use model aliases.

Forbidden:
Provider hardcoded coupling in workflow logic.

---

# AI Request Composition

Runtime should assemble:

- persona context
- agent context
- business context
- knowledge context
- runtime context
- policy constraints

Prompt architecture must remain modular.

---

# Step 10 — Persistence

Purpose:
Persist relevant runtime outcomes.

Examples:

- message logs
- conversation updates
- memory updates
- policy events if applicable

Source of truth:
PostgreSQL / ADMIA domain.

Not Redis.

---

# Step 11 — Outbound Delivery

Purpose:
Send response.

Transport path:

n8n
→ WAHA
→ WhatsApp

n8n orchestrates.
WAHA transports.

---

# LiteLLM Rule

LiteLLM is the AI abstraction gateway.

n8n should not couple directly to providers where architecture assumes LiteLLM.

Benefits:
- model switching
- provider abstraction
- governance consistency

---

# ADMIA Runtime Relationship

ADMIA provides:

- governance config
- business context
- knowledge
- policy state
- AI config

n8n consumes runtime-relevant data.

ADMIA does NOT replace runtime orchestration.

---

# Error Handling Ownership

Transport failure:
WAHA layer concern

Workflow orchestration failure:
n8n concern

AI/provider failure:
LiteLLM/runtime concern

Governance data errors:
ADMIA concern

---

# Retry Philosophy

Retries should be controlled.

Avoid:
- runaway retry loops
- duplicate spam responses

Idempotent behavior preferred.

---

# Message Scope MVP

Supported:
- text inbound
- text outbound

Deferred:
- audio
- media
- documents
- transcription

---

# Contact Governance Rule

Runtime should respect administrative governance.

Examples:

Blocked:
- blacklisted contacts

Allowed test mode:
- explicit test contacts only

This is deterministic.

---

# Runtime Config Governance

Operational settings should be governable.

Examples:
- debounce seconds
- test mode enabled
- retention controls

Source:
ADMIA config.

---

# Observability Rule

Runtime should remain inspectable.

Need visibility into:

- inbound events
- blocked events
- policy decisions
- AI invocations
- sync/runtime failures

Avoid opaque automation black boxes.

---

# Explicit Anti-Patterns

Forbidden:

- business source of truth inside n8n
- permanent state in Redis
- provider hardcoding everywhere
- policy after AI response
- uncontrolled retry loops
- AI deciding governance-critical deterministic rules

---

# Final Rule

Runtime architecture optimizes:

reliability + governance + predictability + modularity
