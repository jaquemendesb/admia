# ADMIA V3 B+ — 08_WOOCOMMERCE_RULES

## Purpose
Defines mandatory WooCommerce integration architecture and governance rules.

Claude must use this as the source of truth for WooCommerce integration behavior.

This prevents incorrect catalog ownership modeling.

---

# Core Business Context

The platform supports multiple business channels.

Examples:
- Loja das Profs
- Clube das Profs
- Mentoria
- Curso Canva
- Curso Conteúdo

Some channels are backed by WooCommerce catalogs.

Some channels are NOT.

Some products may exist in multiple channels.

Some content exists only internally.

This is a hybrid catalog architecture.

---

# Multi-Store Requirement

Multiple WooCommerce stores MUST be supported.

Examples:

Store A:
Loja catalog

Store B:
Clube catalog

Architecture must not assume single Woo store.

---

# Integration Ownership

ADMIA owns:

- Woo integration configuration
- credentials governance
- sync governance
- sync execution control
- sync visibility/logs
- normalized catalog persistence

Woo owns:

external product source data.

---

# Integration Type

Initial supported integration:

WOOCOMMERCE

Architecture should remain extensible.

Future examples:
- Shopify
- custom APIs

But MVP implements Woo only.

---

# Woo Authentication

Supported configuration must include:

- store name
- store URL
- consumer key
- consumer secret
- active state
- sync enabled state
- default business channel mapping (optional)

Credentials must be encrypted.

Never plain text storage.

---

# Sync Modes

Mandatory supported sync modes:

## 1. Manual Sync
Triggered by admin.

Examples:
- sync all
- sync integration
- resync selected product

---

## 2. Scheduled Sync
Periodic governance sync.

Examples:
- daily sync
- configurable cron-driven sync

---

## 3. Webhook-Friendly Future
Architecture should remain extensible for webhook-driven sync.

MVP does not require full webhook dependency.

---

# Product Source Ownership

Critical rule.

Woo is source of truth ONLY for Woo-owned fields.

ADMIA owns internal governance fields.

---

## Woo-Owned Fields
Examples:

- external_id
- sku
- title (default source)
- product descriptions
- pricing
- images
- permalink
- categories
- tags
- stock status if relevant
- Woo metadata

These may be refreshed by sync.

---

## ADMIA-Owned Fields
Examples:

- business channel assignments
- internal notes
- offer composition
- governance metadata
- internal categorization
- knowledge relationships
- visibility rules
- AI relevance metadata

Sync must NOT overwrite these.

---

# Conflict Resolution Rule

If field ownership belongs to Woo:
Woo wins.

If field ownership belongs to ADMIA:
ADMIA wins.

No ambiguous overwrite behavior.

---

# Hybrid Catalog Rule

Catalog is NOT Woo-only.

Supported item sources:

- Woo imported products
- manual admin-created products
- internal content entries
- blog/content references
- resource links

Architecture must support coexistence.

---

# Manual Catalog Items

Manual items must be fully supported.

Examples:
- internal lessons
- exclusive club content
- PDFs
- bonus resources
- blog content
- promotional bundles

These may have:

integration_id = null
external_id = null

This is valid.

---

# Channel Mapping Rule

Products are NOT owned by one single business channel.

Use assignment mapping.

Examples:

Same product:
- Loja
- Clube

Same product with different contextual roles:
- primary product
- bonus
- upsell

Mapping must be many-to-many.

---

# Clube Business Rule

Important real-world constraint.

Clube may use Woo as catalog source,
but also contain exclusive non-Woo content.

Examples:
- exclusive downloads
- internal lessons
- content resources
- blog references

Architecture must support mixed channel composition.

---

# Mentoria Business Rule

Mentoria may bundle:

- Woo products
- internal products
- content bundles
- bonus resources

Architecture must support offer composition across mixed sources.

---

# Product Import Mapping

Woo import should normalize at minimum:

- external product id
- sku
- name
- slug
- short description
- full description
- regular price
- sale price
- product url
- product status
- categories
- tags
- images
- metadata

Variation support should remain extensible.

---

# Idempotency Rule

Repeated syncs must not duplicate products.

Matching identity should rely on:

external_id + integration_id

Mandatory.

---

# Soft Delete Sync Rule

If Woo product disappears:

Do NOT immediately hard delete.

Preferred behavior:

mark inactive / soft delete governance path.

Protect admin context.

---

# Sync Logging Rule

All syncs must generate logs.

Track:

- integration
- sync type
- start/end
- status
- counts
- errors

Operational visibility required.

---

# Connection Testing Rule

Admin must be able to test integration connectivity.

Without forcing full sync.

---

# Rate Limit Awareness

Woo sync implementation should be API-respectful.

Avoid aggressive uncontrolled requests.

---

# Failure Handling

Failures must be visible.

Examples:

- auth failure
- timeout
- malformed response
- product normalization failure

No silent failure patterns.

---

# Security Rule

Woo credentials:

- encrypted at rest
- hidden in UI
- auditable on mutation

Never expose secrets casually.

---

# Runtime Consumption Rule

Runtime AI should consume normalized catalog data.

Not raw Woo APIs directly.

ADMIA is governance source.

---

# Final Rule

WooCommerce is an external catalog source.

It is NOT the platform architecture.
