# ADMIA V3 B+ — 01_PRODUCT_ARCHITECTURE

## Product Definition
ADMIA is the administrative governance platform for the Prof Jaque Mendes automation ecosystem.

It centralizes governance for:
- commerce/catalog administration
- AI behavior and runtime governance
- contact governance
- operational maintenance
- integrations management

This platform is internal administrative software.

---

## What ADMIA IS
ADMIA is:

- a SaaS-style admin panel
- an automation governance platform
- the source of truth for administrative business configuration
- the operational control center for the automation ecosystem

It manages:
- business channels
- catalog items
- offers/bundles
- AI personas
- AI agents
- automation configuration
- contacts governance
- integrations
- maintenance jobs
- audit visibility

---

## What ADMIA IS NOT
ADMIA is NOT:

- a CRM pipeline
- a kanban sales system
- a human inbox support platform
- Chatwoot replacement
- a customer-facing portal
- a landing page
- an affiliate management system
- a media processing platform
- an analytics BI platform

These are explicit non-goals.

---

## Existing Ecosystem Components
ADMIA integrates with an existing ecosystem.

### WAHA
Responsibility:
- WhatsApp transport layer

### n8n
Responsibility:
- automation orchestration
- inbound workflow runtime
- routing orchestration

### LiteLLM
Responsibility:
- model abstraction layer
- provider routing

### PostgreSQL
Existing database:

pjm_automation_ai

Responsibility:
- persistence source of truth

### Redis
Responsibility:
- debounce
- runtime locks
- transient runtime state

### Docker Swarm
Responsibility:
- production deployment orchestration

### Traefik
Responsibility:
- ingress routing
- TLS termination

---

## Product Users
RBAC foundation applies.

### SUPER_ADMIN
Full governance control.

Responsibilities:
- user management
- security settings
- destructive maintenance actions
- integrations management
- AI governance
- platform governance

---

### ADMIN
Operational administrative user.

Responsibilities:
- commerce CRUD
- contact governance
- knowledge management
- AI operational config
- sync operations

Restrictions:
- cannot manage global security
- cannot manage users
- cannot perform destructive global platform actions

---

### READONLY
Read-only observer.

Responsibilities:
- operational visibility
- audit visibility
- reporting visibility

Restrictions:
- no mutations

---

## Core Product Domains
The platform is intentionally separated into bounded contexts.

---

### 1. Commerce Governance
Purpose:
Manage commercial structure.

Includes:
- business channels
- catalog items
- offers
- knowledge base
- integrations
- catalog assignments

Examples:
- Loja das Profs
- Clube das Profs
- Mentoria
- Curso Canva
- Curso Conteúdo

---

### 2. AI Governance
Purpose:
Govern AI behavior.

Includes:
- personas
- AI agents
- routing rules
- prompt templates
- runtime AI config

Important:
Persona is separate from agent capability.

---

### 3. Contact Governance
Purpose:
Administrative governance only.

NOT CRM.

Includes:
- contacts
- memory inspection
- policy governance
- whitelist
- blacklist
- test contacts
- audit visibility

---

### 4. Operations Governance
Purpose:
Operational maintenance.

Includes:
- automation config
- sync logs
- maintenance actions
- retention operations
- health visibility

---

## Deployment Target
Production admin platform target:

admia.jaquemendes.com

---

## Core Design Principles
Mandatory principles:

- clarity over feature clutter
- strong separation of concerns
- admin-first UX
- low cognitive load
- scalable architecture
- production readiness
- explicit governance
- auditability
- safe destructive actions

---

## Product Constraints
Mandatory constraints:

- existing ecosystem integration required
- Docker Swarm deployment required
- Traefik required
- PostgreSQL required
- Redis required
- LiteLLM required
- n8n remains orchestrator
- WAHA remains WhatsApp transport

These constraints are architectural requirements.

---

## Success Criteria
ADMIA is considered successful when:

- commerce configuration is centralized
- AI governance is centralized
- contact governance is administratively manageable
- WooCommerce multi-store sync is manageable
- operational maintenance is administratively manageable
- runtime automation remains decoupled from admin platform

---

## MVP Scope
Initial implementation scope:

INCLUDED:
- full admin foundation
- RBAC foundation
- commerce CRUD
- AI governance foundation
- contact governance
- Woo sync
- runtime integration support
- maintenance governance

EXCLUDED:
See explicit non-goals.
