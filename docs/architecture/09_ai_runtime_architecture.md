# ADMIA V3 B+ — 09_AI_RUNTIME_ARCHITECTURE

## Purpose
Defines mandatory AI runtime architecture and governance boundaries.

Claude must use this as the source of truth for AI architecture.

This prevents prompt spaghetti and architectural confusion.

---

# Core AI Philosophy

AI behavior must be governed, modular, and inspectable.

The platform must NOT rely on one giant uncontrolled prompt.

Separate concerns explicitly.

---

# Mandatory AI Layers

Architecture must separate:

1. Persona Layer
2. Agent Layer
3. Business Context Layer
4. Knowledge Layer
5. Policy Layer
6. Runtime Context Layer
7. Model Routing Layer

These are distinct responsibilities.

---

# 1. Persona Layer

## Purpose
Defines communication identity.

Persona is HOW the system communicates.

Not HOW routing works.

---

## Responsibilities
Persona controls:

- tone of voice
- communication style
- friendliness
- persuasive framing boundaries
- language conventions
- communication personality

Examples:
- welcoming
- consultative
- premium
- warm
- direct

---

## Explicit Non-Responsibilities
Persona does NOT control:

- routing logic
- policy decisions
- model selection
- memory persistence logic
- technical execution flow

---

## MVP Rule
Initial implementation may use:

placeholder default persona

Admin-editable later.

---

# 2. Agent Layer

## Purpose
Technical execution responsibilities.

Agents are operational roles.

Not brand personalities.

---

## Mandatory Agent Roles

### ROUTER
Purpose:
intent / path decision support

---

### CONVERSATION
Purpose:
primary response generation

---

### SUPPORT
Purpose:
structured support reasoning

---

### MEMORY
Purpose:
memory interpretation / summarization support

---

### POLICY
Purpose:
governance decision support

---

## Agent Configuration
Each agent should support:

- name
- role
- active state
- model alias
- prompt template
- metadata

---

# 3. Business Context Layer

## Purpose
Inject business reality into runtime decisions.

This prevents generic AI behavior.

---

## Business Context Sources
Examples:

- business channel
- product catalog
- offers
- channel-specific rules
- availability context

---

## Example
Loja context ≠ Clube context ≠ Mentoria context

AI must understand contextual differences.

---

# 4. Knowledge Layer

## Purpose
Inject official business knowledge.

Source:
knowledge_base

---

## Examples
- FAQs
- objections
- policies
- product explanations
- scripts
- process explanations

---

## Rule
Runtime should consume normalized knowledge.

Not giant hardcoded prompt blobs.

---

# 5. Policy Layer

## Purpose
Govern allowed behavior.

Policy is control logic.

Not communication identity.

---

## Responsibilities
Examples:

- blacklist enforcement
- whitelist behavior
- test mode restrictions
- allowed escalation behavior
- automation guardrails

---

## Rule
Policy decisions should be deterministic where possible.

Avoid pure LLM unpredictability for governance-critical rules.

---

# 6. Runtime Context Layer

## Purpose
Assemble dynamic interaction context.

---

## Runtime Sources
Examples:

- contact profile
- memory
- recent messages
- conversation history window
- channel context
- runtime config

---

## Rule
Context must be intentionally assembled.

No uncontrolled history dumping.

---

# 7. Model Routing Layer

## Purpose
Abstract provider/model decisions.

Owned by LiteLLM.

---

## Runtime Path
n8n
→ LiteLLM
→ provider

---

## Rule
Runtime references model aliases.

Not provider-specific hardcoding.

Examples:
- router-fast
- support-main
- convo-premium

---

# Prompt Composition Architecture

Prompt construction should be modular.

Recommended composition model:

persona
+
agent behavior
+
business context
+
knowledge context
+
runtime context
+
policy constraints

Not one monolithic uncontrolled prompt.

---

# Memory Architecture

Memory is structured governance data.

Not uncontrolled transcript stuffing.

---

## Memory Examples
- preferences
- purchase signals
- support history summaries
- relevant context flags

---

## Rule
Memory persistence should be selective.

Not everything becomes memory.

---

# AI Safety Rule

Governance-critical behaviors should not depend solely on LLM judgment.

Examples:

Deterministic:
- blacklist enforcement
- test mode gating
- authorization-like checks

LLM may assist reasoning.

But deterministic rules win.

---

# Channel Specialization Rule

Persona may remain global.

Business context creates specialization.

This avoids persona explosion.

Examples:

same communication identity
but different business context:

- Loja
- Clube
- Mentoria

---

# Runtime Decision Ownership

Deterministic workflow logic belongs primarily to runtime orchestration.

Examples:

n8n should own:
- message gating
- anti-loop
- policy checks
- debounce
- routing orchestration

AI supports content generation / reasoning.

---

# Observability Rule

AI behavior should remain governable.

Need inspectability of:

- active persona
- active agent
- model alias used
- routing path

Avoid opaque black-box architecture.

---

# Future Extensibility Rule

Architecture should support:

future specialized agents
without redesign.

But MVP must stay disciplined.

---

# Explicit Anti-Patterns

Forbidden:

- one giant prompt monster
- hardcoded provider coupling
- policy entirely delegated to LLM
- business context embedded manually everywhere
- uncontrolled transcript dumping
- persona == agent confusion

---

# Final Rule

AI architecture must optimize:

control + modularity + predictability + business relevance
