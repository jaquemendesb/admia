# ADMIA V3 B+ — 02_DOMAIN_MODEL

## Purpose
This document defines the mandatory business domain model.

Claude must use this as the source of truth for platform entities.

Do not invent parallel domain models.

---

# Core Domain Principles

Rules:
- explicit ownership
- clear boundaries
- normalized data model where appropriate
- auditability
- scalability
- multi-business compatibility

---

# 1. business_channels

## Purpose
Represents a commercial business context.

Examples:
- Loja das Profs
- Clube das Profs
- Mentoria
- Curso Canva
- Curso Conteúdo

A product can belong to multiple channels.

---

## Mandatory Fields
- id
- name
- slug
- description
- active
- priority
- icon
- color
- metadata
- created_at
- updated_at
- deleted_at

---

## Rules
- slug unique
- soft delete
- active flag required
- priority defines display ordering

---

# 2. integrations

## Purpose
Represents external systems connected to ADMIA.

Initial supported type:
- WOOCOMMERCE

Future extensible.

---

## Mandatory Fields
- id
- name
- slug
- integration_type
- base_url
- credentials_encrypted
- active
- sync_enabled
- default_channel_id
- last_sync_at
- metadata
- created_at
- updated_at
- deleted_at

---

## Rules
- encrypted credentials mandatory
- multiple integrations allowed
- integration may map to default business channel

---

# 3. catalog_items

## Purpose
Unified product/content abstraction.

Not limited to Woo products.

---

## Source Types
- WOOCOMMERCE
- MANUAL
- INTERNAL
- BLOG
- URL

---

## Item Types
- PRODUCT
- COURSE
- LESSON
- ARTICLE
- DOWNLOAD
- BONUS
- MEMBERSHIP
- RESOURCE

---

## Mandatory Fields
- id
- title
- slug
- source_type
- item_type
- integration_id
- external_id
- sku
- short_description
- full_description
- price
- sale_price
- currency
- access_url
- thumbnail_url
- active
- metadata
- created_at
- updated_at
- deleted_at

---

## Rules
- slug unique
- Woo items may have external_id
- manual items may have null integration_id
- manual items coexist with synced items

---

# 4. channel_assignments

## Purpose
Maps catalog items into business channels.

Allows one catalog item to exist in multiple contexts.

Example:
Same product available in Loja and Clube.

---

## Assignment Roles
- PRIMARY
- UPSELL
- BONUS
- CONTENT
- SUPPORTING

---

## Mandatory Fields
- id
- business_channel_id
- catalog_item_id
- assignment_role
- priority
- visible
- exclusive
- sales_notes
- metadata
- created_at
- updated_at
- deleted_at

---

## Rules
- many-to-many mapping
- unique composite protection required

---

# 5. offers

## Purpose
Commercial bundles / packages.

Example:
Mentoria + Curso Canva + bônus.

---

## Mandatory Fields
- id
- title
- slug
- description
- active
- base_price
- sale_price
- metadata
- created_at
- updated_at
- deleted_at

---

# 6. offer_items

## Purpose
Offer composition mapping.

---

## Mandatory Fields
- id
- offer_id
- catalog_item_id
- quantity
- role
- metadata

---

# 7. knowledge_base

## Purpose
Structured official business knowledge.

Used by runtime AI.

Examples:
- policies
- FAQs
- sales scripts
- product explanations
- objections

---

## Mandatory Fields
- id
- title
- slug
- content
- knowledge_type
- active
- business_channel_id
- metadata
- created_at
- updated_at
- deleted_at

---

# 8. personas

## Purpose
Communication identity.

NOT technical execution logic.

Separate from AI agents.

---

## Mandatory Fields
- id
- name
- slug
- description
- system_prompt
- tone
- language
- active
- is_default
- metadata
- created_at
- updated_at
- deleted_at

---

## Rules
- one default required
- editable through admin

---

# 9. ai_agents

## Purpose
Technical AI execution roles.

---

## Agent Roles
- ROUTER
- CONVERSATION
- SUPPORT
- MEMORY
- POLICY

---

## Mandatory Fields
- id
- name
- slug
- agent_role
- model_alias
- prompt_template
- active
- metadata
- created_at
- updated_at
- deleted_at

---

# 10. automation_config

## Purpose
Runtime configuration registry.

Editable operational settings.

Examples:
- debounce_seconds
- retention_days
- test_mode_enabled

---

## Mandatory Fields
- id
- config_key
- config_value
- value_type
- metadata
- updated_at

---

# 11. contacts

## Purpose
Administrative contact registry.

NOT CRM pipeline.

---

## Mandatory Fields
- id
- name
- phone
- email
- notes
- active
- metadata
- created_at
- updated_at
- deleted_at

---

# 12. conversations

## Purpose
Conversation containers.

---

## Mandatory Fields
- id
- contact_id
- channel
- started_at
- last_activity_at
- metadata

---

# 13. messages

## Purpose
Message logs.

---

## Mandatory Fields
- id
- conversation_id
- contact_id
- direction
- message_type
- content
- provider_message_id
- metadata
- created_at

---

# 14. contact_memory

## Purpose
Structured memory about contact context.

---

## Mandatory Fields
- id
- contact_id
- memory_key
- memory_value
- confidence
- source
- metadata
- created_at
- updated_at

---

# 15. contact_policies

## Purpose
Administrative governance rules.

---

## Policy Types
- TEST
- WHITELIST
- BLACKLIST

---

## Sources
- MANUAL
- AI
- SYSTEM

---

## Mandatory Fields
- id
- contact_id
- policy_type
- source_type
- active
- notes
- created_at
- updated_at

---

# 16. policy_logs

## Purpose
Audit of policy decisions.

---

## Mandatory Fields
- id
- contact_id
- policy_type
- action
- source
- details
- created_at

---

# 17. sync_logs

## Purpose
Integration execution history.

---

## Mandatory Fields
- id
- integration_id
- sync_type
- status
- started_at
- finished_at
- details

---

# 18. maintenance_jobs

## Purpose
Operational administrative jobs.

Examples:
- purge contacts
- purge messages
- force sync
- lock cleanup

---

## Mandatory Fields
- id
- job_type
- status
- payload
- started_at
- finished_at
- created_by_user_id

---

# 19. users

## Purpose
Admin authentication identities.

---

## Mandatory Fields
- id
- name
- email
- password_hash
- active
- last_login_at
- created_at
- updated_at
- deleted_at

---

# 20. roles

## Purpose
RBAC roles.

---

Values:
- SUPER_ADMIN
- ADMIN
- READONLY

---

# 21. permissions

## Purpose
Permission registry foundation.

Future extensibility.

---

# 22. user_roles

## Purpose
Many-to-many user-role mapping.

---

# 23. role_permissions

## Purpose
Permission mapping foundation.

---

# 24. audit_logs

## Purpose
Administrative audit trail.

Mandatory for sensitive actions.

---

## Mandatory Fields
- id
- actor_user_id
- resource_type
- resource_id
- action
- before_json
- after_json
- ip_address
- user_agent
- created_at
