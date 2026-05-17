# ADMIA V3 B+ — 11_DEPLOYMENT_RULES

## Purpose
Defines mandatory deployment architecture and infrastructure conventions.

Claude must align implementation with the existing production ecosystem.

This prevents infrastructure drift.

---

# Existing Infrastructure Reality

ADMIA is NOT a greenfield isolated deployment.

It must integrate into an existing Docker Swarm ecosystem.

Existing components include:

- WAHA
- LiteLLM
- n8n
- Chatwoot stack references
- Traefik ingress
- PostgreSQL
- Redis

Claude must respect this reality.

---

# Mandatory Deployment Platform

Required:

Docker Swarm

Forbidden:

- local-only docker-compose assumptions
- Vercel deployment assumptions
- serverless-only architecture
- disconnected deployment models

This is self-hosted infrastructure.

---

# Reverse Proxy Requirement

Mandatory ingress:

Traefik

Responsibilities:

- routing
- TLS termination
- host rules
- service exposure

Claude must align with existing Traefik conventions.

---

# Existing Network Requirement

Mandatory external Docker network:

pjm-network

ADMIA services must integrate into this network.

Do not invent isolated incompatible networking.

---

# Production Domain

Target admin domain:

admia.jaquemendes.com

Expected routing:

HTTPS only production access.

---

# Service Architecture

ADMIA should deploy as production-ready services.

Expected architecture:

Admin application service
+
optional worker/background service if architecture justifies

MVP may remain simpler.

But production discipline required.

---

# Containerization Rules

Mandatory:

- Dockerized deployment
- production Dockerfile
- optimized build strategy
- reproducible builds

Avoid toy containers.

---

# Environment Strategy

Environment variables supported.

Sensitive values must be protected.

Examples:

- DATABASE_URL
- REDIS_URL
- AUTH secrets
- encryption keys
- admin secrets

Never hardcode production secrets.

---

# Secret Handling Rule

Preferred:

secure secret handling patterns.

At minimum:

no secret leakage in source.

Forbidden:

- plain secrets committed in repository
- insecure demo defaults for production

---

# Database Connectivity

ADMIA must connect to existing PostgreSQL ecosystem.

Expected:

production DB connectivity via env configuration.

Do not assume ephemeral local DB only.

---

# Redis Connectivity

ADMIA runtime support should connect to existing Redis infra.

Env-driven configuration required.

---

# Traefik Label Convention

Implementation must follow project conventions.

Expected categories:

- enable flag
- docker network declaration
- router rule
- entrypoints
- TLS config
- cert resolver
- service mapping
- internal port mapping

Consistency with existing YAML artifacts mandatory.

---

# TLS Rule

Production requires TLS.

No HTTP-only production assumptions.

---

# Build Strategy

Expected:

production-optimized Next.js build

Examples:
- standalone build if appropriate
- optimized image layering

Avoid oversized wasteful images where practical.

---

# Volume Strategy

Persistent volumes only where justified.

Examples:

Possible:
- uploads if future needed
- persistent runtime artifacts if required

Avoid unnecessary stateful container assumptions.

Primary persistence belongs in PostgreSQL.

---

# Logging Rule

Containers should emit structured operational logs.

Logs must support production troubleshooting.

Avoid silent failure containers.

---

# Health Strategy

Production services should support health validation.

Examples:

- app readiness
- app liveness
- dependency validation where appropriate

---

# Scaling Philosophy

MVP may deploy as single replica.

Architecture should remain scalable.

Swarm-compatible deployment required.

---

# Auth Deployment Rule

Admin authentication secrets must be production-safe.

No demo auth defaults.

---

# Migration Deployment Rule

Prisma migrations must be production-conscious.

Avoid dangerous auto-destructive runtime behavior.

Migration execution strategy must be deliberate.

---

# File Structure Expectation

Claude should generate deploy artifacts consistent with project patterns.

Expected examples:

- Dockerfile
- docker swarm stack yaml
- env example docs

Consistency with ecosystem conventions required.

---

# Observability Rule

Production deployment should remain diagnosable.

Need visibility into:

- startup failures
- dependency failures
- runtime crashes
- auth failures
- DB connectivity issues

---

# Explicit Anti-Patterns

Forbidden:

- Vercel-only assumptions
- localhost production assumptions
- embedded sqlite production shortcuts
- no TLS production design
- isolated non-Traefik networking
- compose patterns incompatible with swarm conventions

---

# Final Rule

Deployment architecture must optimize:

compatibility + production safety + maintainability

