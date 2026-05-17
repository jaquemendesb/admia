# ADMIA V3 B+ — 04_RBAC_MATRIX

## Purpose
Defines the mandatory RBAC (Role-Based Access Control) model.

Claude must implement authorization architecture based on this document.

This is foundation-level security, not optional future enhancement.

---

# Core RBAC Roles

Mandatory roles:

- SUPER_ADMIN
- ADMIN
- READONLY

No additional roles in MVP unless explicitly approved.

---

# Role Philosophy

## SUPER_ADMIN
Platform governance authority.

Responsible for:
- infrastructure governance
- security governance
- administrative governance
- integrations governance
- destructive operational actions

This is the highest privilege level.

---

## ADMIN
Operational business administrator.

Responsible for day-to-day platform operations.

Can manage business operations.
Cannot govern platform security.

---

## READONLY
Observation role.

Used for visibility without mutation rights.

---

# Resource Access Matrix

Legend:

VIEW
CREATE
UPDATE
DELETE
EXECUTE
DENY

---

# Dashboard

SUPER_ADMIN:
VIEW

ADMIN:
VIEW

READONLY:
VIEW

---

# Business Channels

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

---

# Integrations

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE EXECUTE

ADMIN:
VIEW CREATE UPDATE EXECUTE

READONLY:
VIEW

Notes:
EXECUTE includes:
- test connection
- manual sync trigger

Credential mutation must be audited.

---

# Catalog Items

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

---

# Channel Assignments

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

---

# Offers

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

---

# Knowledge Base

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

---

# Personas

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE

READONLY:
VIEW

Notes:
Deleting default persona requires guardrails.

---

# AI Agents

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE

READONLY:
VIEW

Notes:
AI runtime configuration changes must be audited.

---

# Automation Config

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW UPDATE

READONLY:
VIEW

Notes:
Dangerous config changes require audit.

---

# Contacts

SUPER_ADMIN:
VIEW UPDATE DELETE

ADMIN:
VIEW UPDATE DELETE

READONLY:
VIEW

Notes:
This is governance, not CRM.

---

# Contact Memory

SUPER_ADMIN:
VIEW UPDATE DELETE

ADMIN:
VIEW UPDATE

READONLY:
VIEW

---

# Contact Policies

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
VIEW CREATE UPDATE DELETE

READONLY:
VIEW

Includes:
- TEST
- WHITELIST
- BLACKLIST

---

# Policy Logs

SUPER_ADMIN:
VIEW

ADMIN:
VIEW

READONLY:
VIEW

Immutable visibility.

---

# Sync Logs

SUPER_ADMIN:
VIEW

ADMIN:
VIEW

READONLY:
VIEW

Immutable visibility.

---

# Maintenance Jobs

SUPER_ADMIN:
VIEW EXECUTE

ADMIN:
VIEW EXECUTE (restricted)

READONLY:
VIEW

---

## Restricted ADMIN Maintenance Actions

ADMIN may execute only approved safe jobs.

Allowed examples:
- manual sync
- lock cleanup
- cache cleanup

Forbidden examples:
- global destructive purge
- user/security destructive jobs

---

# Audit Logs

SUPER_ADMIN:
VIEW

ADMIN:
VIEW

READONLY:
VIEW (optional policy)

Audit data immutable.

---

# User Management

SUPER_ADMIN:
VIEW CREATE UPDATE DELETE

ADMIN:
DENY

READONLY:
DENY

Includes:
- create users
- deactivate users
- assign roles

---

# Roles / Permissions Management

SUPER_ADMIN:
VIEW UPDATE

ADMIN:
DENY

READONLY:
DENY

Foundation governance only.

---

# Security Settings

SUPER_ADMIN:
VIEW UPDATE

ADMIN:
DENY

READONLY:
DENY

Includes:
- auth policy
- password policy
- security governance config

---

# Destructive Global Actions

Examples:
- purge all contacts
- purge all messages
- purge all conversations
- destructive reset jobs

SUPER_ADMIN:
EXECUTE

ADMIN:
DENY

READONLY:
DENY

Mandatory confirmations required.

---

# Authorization Enforcement Rules

Mandatory enforcement layers:

- route-level protection
- API authorization checks
- UI visibility guards
- server-side authorization validation

UI hiding alone is NOT authorization.

---

# Audit Enforcement

The following actions MUST generate audit logs:

- integration credential changes
- RBAC changes
- user changes
- automation config changes
- policy changes
- persona changes
- AI agent changes
- destructive maintenance actions

---

# Session Enforcement

Session auth required.

Anonymous access forbidden.

No public admin access.

---

# Final Rule

Authorization is server-enforced.

Never trust client-side permission assumptions.

