# ADMIA V3 B+ — 12_SECURITY_RULES

## Purpose
Defines mandatory security architecture rules.

Claude must treat these as foundational requirements.

Security is not a future enhancement.

---

# Security Philosophy

ADMIA is an administrative governance platform.

It controls:

- business governance
- AI governance
- contact governance
- integrations
- credentials
- maintenance actions

Therefore:

Security posture must be serious from foundation.

---

# Authentication Requirement

Mandatory:

session-based authenticated admin access.

No anonymous admin access.

No public mutation endpoints.

---

# Auth Architecture

Required architectural direction:

NextAuth / Auth.js compatible architecture

Or equivalent production-grade session auth.

Requirements:

- credential login
- session management
- server validation
- protected routes
- protected APIs

---

# Password Rules

Passwords must NEVER be stored in plain text.

Mandatory:

secure password hashing

Examples:
- bcrypt
- argon2

Production-safe only.

---

# Session Rules

Sessions must be securely managed.

Required:

- authenticated sessions
- server validation
- expiration handling
- invalidation support

Forbidden:

- fake client-only auth
- localStorage-only pseudo-auth

---

# RBAC Enforcement

RBAC is mandatory.

Reference:
04_RBAC_MATRIX.md

Authorization must be enforced server-side.

Client UI hiding is NOT authorization.

Required layers:

- route guards
- API guards
- server authorization checks

---

# User Identity Rules

Admin identities are explicit users.

Required:

- unique email identity
- active state
- password hash
- role assignment
- audit traceability

---

# Credential Security

Sensitive integration credentials must be protected.

Examples:

- Woo consumer keys
- Woo secrets
- encryption secrets
- auth secrets

Mandatory:

encrypted at rest where stored.

Forbidden:

plain credential persistence.

---

# Secret Management Rule

Secrets must never be hardcoded in source.

Forbidden:

- committed production secrets
- demo secrets in implementation

Environment-driven secret handling required.

---

# Encryption Requirement

Sensitive stored credentials require encryption.

Use production-grade symmetric encryption patterns.

Key management via environment secrets.

---

# Audit Logging Requirement

Sensitive actions must be auditable.

Mandatory audit coverage:

- login events (recommended)
- user changes
- role changes
- integration changes
- credential updates
- policy changes
- AI config changes
- automation config changes
- maintenance actions
- destructive actions

---

# Audit Integrity Rule

Audit logs should be append-focused.

Not casually editable business records.

Integrity matters.

---

# Route Protection Rule

Admin routes must require authentication.

Examples:

Protected:
- dashboard
- commerce
- AI
- contacts
- operations
- administration

No public admin navigation.

---

# API Protection Rule

All mutation APIs require:

- authentication
- authorization

Read APIs should also require auth unless explicitly approved.

---

# Destructive Action Safety

Dangerous actions require additional safety.

Examples:

- purge all contacts
- purge messages
- destructive maintenance
- user removal
- credential replacement

Required protections:

- confirmation dialogs
- RBAC validation
- audit logging

Optional stronger controls future:
- re-auth confirmation

---

# CSRF / Session Safety

Production-safe session protection required.

No naive insecure session implementation.

---

# Rate Limiting

Auth-sensitive endpoints should support rate protection.

Examples:

- login attempts
- sensitive auth actions

Avoid brute-force friendly behavior.

---

# Account State Rules

Users should support:

- active/inactive state

Future extensibility:

- temporary lockout
- suspension

No overengineering required in MVP.

---

# Error Disclosure Rule

UI/API errors must avoid leaking sensitive internals.

Avoid:

- stack traces to UI
- credential leaks
- internal infrastructure details in public responses

---

# Dependency Security Rule

Use maintained production libraries.

Avoid abandoned auth/security packages.

---

# Input Validation Rule

Mutation endpoints require validation.

Examples:

- malformed payload rejection
- required fields validation
- enum validation

Never trust raw client input.

---

# SQL Injection Rule

ORM usage should preserve query safety.

Avoid unsafe raw query shortcuts unless justified.

---

# Prompt Injection Rule

## Threat

End users communicating via WhatsApp can embed instructions in messages attempting to override AI system prompts.

## Mandatory Controls

Three defense layers are required (see `09_ai_runtime_architecture.md`):

1. **Deterministic filter** — n8n regex pattern check before any LLM call. Blocks on match without invoking AI.
2. **XML delimiter wrapping** — All user messages wrapped in `<mensagem_usuario>` tags in prompt assembly. Signals data boundary to the model.
3. **Security framing in system prompt** — Each agent `prompt_template` stored in ADMIA must include explicit instruction rejecting user-sourced commands.

## Scope

- Filter and XML wrapping: n8n responsibility
- System prompt security framing: ADMIA governance (admin-editable via UI)

## Forbidden

- Injecting raw WhatsApp message text directly into LLM `content` fields without XML wrapping
- Relying solely on LLM interpretation to reject injection attempts
- Prompt templates without explicit security boundary statements

---

# XSS / UI Safety

Admin UI should avoid obvious XSS vulnerabilities.

Especially in:

- notes
- rich content
- knowledge entries

---

# Secrets in UI Rule

Never casually expose sensitive secrets.

Examples:

Forbidden:
full integration secrets displayed openly

Preferred:
masked secret presentation

---

# Runtime Governance Security Boundary

ADMIA admin auth != customer runtime identity.

Do not mix these domains.

---

# Logging Safety

Operational logs should not casually leak secrets.

Mask sensitive values.

---

# Final Rule

Security decisions must optimize:

confidentiality + integrity + controlled governance

