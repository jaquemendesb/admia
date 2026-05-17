# ADMIA V3 B+ — 05_UI_INFORMATION_ARCHITECTURE

## Purpose
Defines the mandatory information architecture and navigation structure for the admin platform.

Claude must use this as the navigation source of truth.

The objective is to prevent confusing admin UX.

---

# UX Principles

Mandatory principles:

- clarity over density
- low cognitive load
- predictable navigation
- SaaS admin usability
- explicit separation of domains
- minimal ambiguity
- fast discoverability
- scalable navigation architecture

Forbidden:

- dashboard chaos
- mixed unrelated actions
- deeply confusing navigation
- landing-page-like UX

---

# Top-Level Navigation

Mandatory primary navigation:

1. Dashboard
2. Commerce
3. AI
4. Contacts
5. Operations
6. Administration

This structure is mandatory.

---

# 1. Dashboard

## Purpose
Operational overview.

Read-first landing area.

Not a control dump.

---

## MVP Modules

Suggested cards/widgets:

- recent sync status
- recent policy events
- contact governance summary
- AI runtime status summary
- maintenance alerts
- integration health summary

---

## Forbidden

Dashboard must NOT become:

- CRUD dumping ground
- giant settings page
- noisy analytics wall

---

# 2. Commerce

## Purpose
Commercial structure governance.

Owns all commercial entities.

---

## Navigation

Mandatory submenu:

- Channels
- Catalog
- Offers
- Knowledge Base
- Integrations

---

## 2.1 Channels

Purpose:
Manage business contexts.

Examples:
- Loja das Profs
- Clube das Profs
- Mentoria
- Curso Canva

Capabilities:
- list
- create
- edit
- deactivate
- view relationships

Detail relationships:
- assigned catalog items
- linked offers
- linked knowledge
- linked integrations

---

## 2.2 Catalog

Purpose:
Unified catalog governance.

Includes:
- Woo imported items
- manual items
- internal resources
- content entries

Capabilities:
- list
- search
- filter
- create
- edit
- deactivate

Filters:
- source
- item type
- channel
- active state

Detail relationships:
- channels
- offers
- source integration

---

## 2.3 Offers

Purpose:
Bundle governance.

Capabilities:
- create offers
- compose bundles
- edit pricing context
- activate/deactivate

Relationships:
- offer items
- business channels

---

## 2.4 Knowledge Base

Purpose:
Structured AI-accessible business knowledge.

Capabilities:
- CRUD knowledge entries
- assign channel relevance
- activate/deactivate

Knowledge categories examples:
- FAQ
- policy
- objection handling
- product explanation
- scripts

---

## 2.5 Integrations

Purpose:
External system governance.

Initial focus:
WooCommerce.

Capabilities:
- add integration
- test integration
- edit config
- manual sync
- view sync history
- activate/deactivate

---

# 3. AI

## Purpose
AI governance.

Separated from commerce.

---

## Navigation

Mandatory submenu:

- Personas
- Agents
- Routing Rules
- Prompt Templates

---

## 3.1 Personas

Purpose:
Communication identity management.

Capabilities:
- create
- edit
- activate
- set default

Forbidden confusion:
Persona is NOT technical agent logic.

---

## 3.2 Agents

Purpose:
Technical runtime AI roles.

Examples:
- router
- conversation
- support
- memory
- policy

Capabilities:
- configure model alias
- prompt behavior
- activation state

---

## 3.3 Routing Rules

Purpose:
Runtime decision governance.

Examples:
- channel routing
- intent routing
- fallback rules

---

## 3.4 Prompt Templates

Purpose:
Structured prompt governance.

Reusable prompt building blocks.

---

# 4. Contacts

## Purpose
Administrative governance only.

NOT CRM.

---

## Navigation

Mandatory submenu:

- Contacts
- Test Contacts
- Whitelist
- Blacklist
- Policy Logs
- Memory

---

## 4.1 Contacts

Purpose:
Administrative contact registry.

Capabilities:
- search
- inspect
- edit governance metadata
- delete (policy controlled)

Detail view relationships:
- conversations
- messages
- policies
- memory

---

## 4.2 Test Contacts

Purpose:
Safe runtime testing governance.

Capabilities:
- add test numbers
- remove test numbers
- inspect runtime eligibility

---

## 4.3 Whitelist

Purpose:
Explicit allow governance.

---

## 4.4 Blacklist

Purpose:
Explicit deny governance.

---

## 4.5 Policy Logs

Purpose:
Governance visibility.

Read-first audit experience.

---

## 4.6 Memory

Purpose:
Structured AI memory inspection.

Capabilities:
- inspect
- edit (privileged)
- purge targeted memory

---

# 5. Operations

## Purpose
Operational runtime governance.

---

## Navigation

Mandatory submenu:

- Automation Config
- Sync Logs
- Maintenance
- System Health

---

## 5.1 Automation Config

Purpose:
Operational runtime settings.

Examples:
- debounce seconds
- retention settings
- test mode

---

## 5.2 Sync Logs

Purpose:
Integration execution visibility.

Read-first operational troubleshooting.

---

## 5.3 Maintenance

Purpose:
Controlled maintenance execution.

Examples:
- cache cleanup
- lock cleanup
- safe purge

Dangerous actions gated.

---

## 5.4 System Health

Purpose:
Operational health visibility.

Examples:
- integration health
- runtime health indicators

---

# 6. Administration

## Purpose
Platform governance.

Restricted by RBAC.

---

## Navigation

Mandatory submenu:

- Users
- Roles
- Security
- Audit Logs

---

# Cross-Link UX Rule

Entities must be navigationally linked.

Examples:

Catalog item detail links to:
- assigned channels
- offers
- source integration

Channel detail links to:
- catalog items
- offers
- knowledge entries

Contact detail links to:
- conversations
- policies
- memory

This reduces navigation friction.

---

# Table UX Rules

List-heavy admin areas should support:

- search
- filters
- pagination
- sorting
- bulk actions where safe

---

# Destructive UX Rule

Destructive actions require:

- explicit confirmation
- warning states
- audit logging

No silent destructive UX.

---

# Final Rule

Information architecture must optimize:

clarity > feature density

