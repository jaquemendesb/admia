# ADMIA V3 B+ — 06_DESIGN_SYSTEM_RULES

## Purpose
Defines mandatory UI design system rules for ADMIA.

Claude must use these constraints when implementing the admin interface.

This document prevents visual inconsistency and brand drift.

---

# Mandatory Visual Reference

Claude MUST analyze:

brand.md

This is the official ecosystem visual identity reference.

However:

ADMIA is an administrative SaaS platform.

Therefore:
Brand identity must be interpreted for admin software.

NOT copied as marketing design.

---

# Design Interpretation Rule

Forbidden interpretations:

- landing page aesthetic
- promotional course sales layout
- oversized marketing hero sections
- conversion-focused public site patterns
- visually noisy educational funnel design

Required interpretation:

professional SaaS admin UI
with subtle ecosystem branding

---

# Core UX Visual Principles

Mandatory:

- clarity first
- consistency first
- low cognitive load
- strong hierarchy
- readable density
- accessible interaction states
- predictable component behavior
- modern admin UX

---

# Visual Personality

Target personality:

- professional
- trustworthy
- clean
- premium
- calm
- operationally efficient

Avoid:

- childish
- flashy
- cluttered
- noisy
- hyper-promotional

---

# Brand Color Interpretation

Use brand palette as reference.

Recommended admin interpretation:

## Primary
Deep brand navy

Purpose:
- navigation
- headers
- primary emphasis

---

## Secondary
Soft sky / supporting neutral accents

Purpose:
- supportive UI accents
- secondary highlighting

---

## Surface
Cream / neutral interpretation

Purpose:
- soft surfaces
- cards
- background hierarchy

---

## Accent Usage
Pink / yellow only as restrained accent.

Examples:
- badges
- subtle indicators
- highlights

Forbidden:
Using accent colors everywhere.

---

# Color Rule

Admin readability > brand expressiveness.

Brand must support usability.

Never reduce contrast for aesthetics.

---

# Component Stack

Mandatory UI stack:

- Next.js
- Tailwind CSS
- shadcn/ui

Preferred extensions:
- lucide-react icons
- reusable typed UI primitives

Do not invent inconsistent custom component systems.

---

# Layout Rules

Mandatory layout characteristics:

- left navigation or equivalent admin pattern
- strong page title hierarchy
- clean section separation
- predictable card layouts
- responsive desktop-first behavior

Avoid:
- floating chaotic controls
- inconsistent alignment
- overly compressed dense screens

---

# Typography Rules

Typography should communicate:

clarity + operational trust

Mandatory characteristics:

- strong heading hierarchy
- readable body sizes
- consistent spacing
- admin-appropriate density

Avoid decorative typography.

---

# Spacing Rules

Mandatory:

consistent spacing scale

Examples:
- predictable paddings
- consistent vertical rhythm
- adequate click targets

Avoid cramped enterprise anti-patterns.

---

# Table Design Rules

Admin-heavy areas require strong table UX.

Tables should support:

- sorting
- filtering
- search
- pagination
- row actions
- bulk actions where safe

Visual rules:

- readable density
- clear hover states
- clear action affordances

---

# Form Design Rules

Forms must be admin-grade.

Mandatory:

- clear labels
- helper text when ambiguity exists
- validation feedback
- disabled states
- loading states
- confirmation states

Avoid mystery forms.

---

# Dialog Rules

Dialogs must be used for:

- confirmations
- destructive actions
- focused edits

Destructive dialogs must visually communicate risk.

---

# Status System

Platform needs consistent status semantics.

Examples:

States:
- active
- inactive
- pending
- success
- warning
- error
- syncing
- disabled

Status representation must be consistent.

---

# Empty States

Empty states must be intentional.

Should include:

- explanatory text
- next action guidance

Avoid dead blank screens.

---

# Loading States

Mandatory loading feedback.

Examples:

- skeletons
- spinners where appropriate
- disabled submit states

Avoid uncertain interaction.

---

# Error States

Errors must be human-readable.

Not raw technical dumps in UI.

Admin-facing messages should be actionable.

---

# Responsive Rules

Desktop-first.

Minimum expectations:

- laptop usability
- desktop usability
- acceptable tablet behavior

Mobile admin optimization is not MVP priority.

---

# Accessibility Baseline

Mandatory:

- adequate contrast
- focus states
- keyboard navigability baseline
- semantic components

---

# Navigation UX Rule

Navigation must feel scalable.

As modules grow:

UX must remain organized.

No navigation entropy.

---

# Branding Rule

Brand presence should feel:

subtle + premium + coherent

not promotional.

---

# Final Rule

Design decisions must optimize:

usability > decoration
