# ADMIA V3 B+ — 03_DATABASE_RULES

## Purpose
Defines mandatory database implementation rules.

Claude must use these constraints when implementing Prisma + PostgreSQL.

These rules prevent fragile schema design.

---

# Database Platform

Mandatory database:

PostgreSQL

Existing database target:

pjm_automation_ai

Mandatory ORM:

Prisma

No alternative ORM.

---

# Core Schema Principles

Mandatory principles:

- deterministic schema design
- normalized structure where appropriate
- explicit foreign keys
- production-safe migrations
- auditability
- retention awareness
- extensibility without redesign

---

# Primary Key Rule

All domain entities MUST use:

UUID primary keys

Examples:
- uuid
- cuid acceptable only if explicitly justified

Default rule:
UUID.

---

# Timestamp Rule

Entities should include timestamps consistently.

Standard fields:

- created_at
- updated_at

Where lifecycle matters:

- deleted_at

Where runtime matters:

- started_at
- finished_at
- last_activity_at

---

# Soft Delete Rule

Soft delete mandatory where business recovery matters.

Apply to:

- business_channels
- integrations
- catalog_items
- channel_assignments
- offers
- knowledge_base
- personas
- ai_agents
- contacts
- users

Hard delete only for:

- ephemeral technical records
- retention cleanup targets
- explicit maintenance actions

---

# Foreign Key Discipline

All relationships MUST use explicit FK constraints.

Forbidden:

- orphan references
- string pseudo-relations
- JSON fake relational modeling

Examples:

Allowed:
contact_id -> contacts.id
integration_id -> integrations.id
actor_user_id -> users.id

---

# Unique Constraint Rules

Mandatory uniques:

business_channels.slug
integrations.slug
catalog_items.slug
offers.slug
knowledge_base.slug
personas.slug
ai_agents.slug
users.email
automation_config.config_key

Composite uniques required:

catalog_items(external_id, integration_id)
channel_assignments(business_channel_id, catalog_item_id)
user_roles(user_id, role_id)
role_permissions(role_id, permission_id)

---

# Index Rules

Mandatory indexes:

## Contacts
contacts(phone)
contacts(email)

## Conversations
conversations(contact_id)
conversations(last_activity_at)

## Messages
messages(contact_id)
messages(conversation_id)
messages(created_at)
messages(contact_id, created_at)

## Catalog
catalog_items(slug)
catalog_items(sku)
catalog_items(external_id, integration_id)

## Knowledge
knowledge_base(slug)
knowledge_base(business_channel_id)

## Policies
contact_policies(contact_id)
contact_policies(policy_type)
contact_policies(contact_id, policy_type)

## Runtime Config
automation_config(config_key)

## Audit
audit_logs(actor_user_id)
audit_logs(resource_type)
audit_logs(created_at)

## Sync
sync_logs(integration_id)
sync_logs(status)

---

# Enum Strategy

Mandatory enums for stable business domains.

Examples:

integration_type
source_type
item_type
assignment_role
policy_type
agent_role
sync_status
job_status
role_name
message_direction
message_type

Do not overuse free-form strings for constrained domains.

---

# JSON Usage Rule

JSON fields allowed only for flexible metadata.

Examples:

metadata
payload
before_json
after_json
integration provider extras

Forbidden:

Core business structure hidden inside JSON blobs.

---

# Audit Rule

Sensitive operations must be auditable.

Mandatory audit targets:

- user management
- RBAC changes
- integration changes
- credential updates
- contact policy changes
- destructive maintenance actions
- automation config changes
- persona changes
- AI agent changes

Audit fields required:

- actor_user_id
- resource_type
- resource_id
- action
- before_json
- after_json
- ip_address
- user_agent
- created_at

---

# Retention Rules

Default retention:

Messages:
90 days

Conversations:
180 days

Transient runtime locks:
24 hours

Sync logs:
90 days

Audit logs:
configurable (recommended 365+ days)

Contacts:
configurable policy-based

Memory:
configurable

---

# Purge Strategy

Purge must be explicit maintenance jobs.

No silent automatic destructive cleanup without governance.

Supported purge categories:

- messages
- conversations
- expired runtime locks
- sync logs
- orphan technical records

Protected by confirmation + audit.

---

# Migration Rules

Mandatory:

- deterministic migrations
- versioned migrations
- production-safe migration ordering

Forbidden:

- destructive unreviewed migration generation
- schema drift hacks

---

# Security Data Rules

Sensitive fields must never be plain text.

Examples:

Encrypted:
- integration credentials

Hashed:
- passwords

Never store:
- raw admin passwords

---

# Multi-Tenancy Position

Current architecture is single organization.

Do NOT overengineer tenant architecture now.

But keep schema evolvable.

---

# Naming Convention

Database naming standard:

snake_case

Examples:

created_at
updated_at
business_channel_id
contact_policy_id

Consistency mandatory.

---

# Final Rule

Database design must optimize:

- correctness
- maintainability
- performance
- auditability
- safe future evolution

Not short-term convenience.
