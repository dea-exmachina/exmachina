# Philosophy

> *Enable humans and AI to work together to solve real problems and build great things.*

This is the Guiding Star. Every decision in this repo — every feature, every line of code, every default — is checked against it. If a choice moves us closer, it belongs. If it doesn't, it doesn't, no matter how clever.

---

## The Real Product

The real product isn't software. It's the **relationship between you and your AI partner**. Software is the structure that makes that relationship possible: persistent identity, shared context, tools to get work done together, and a visible record of what you've built.

The system gives you four things:

1. **Structure** — folders, files, and conventions that make AI collaboration legible.
2. **Vision** — a north star (the Guiding Star) that every decision can be checked against.
3. **Tools** — agent factory, kanban + calendar, planning primitives, governance.
4. **Agency** — the user directs; the system serves; nothing is locked.

---

## The Two-Layer Rule

Everything in exmachina sits in one of two layers:

| Layer | Posture | What lives here |
|-------|---------|-----------------|
| **OS** | Opinionated, ships complete | Identity scaffold, governance roles, agent factory, planning model, kanban + calendar, framework library |
| **Project** | Modular, user-controlled | Your projects, your repos, your work, your customizations, your data |

**The OS is opinionated.** You don't pick which governance roles to include or which planning primitives to use. They're chosen for you, because consistency at this layer is what makes the system feel like an OS instead of a toolkit.

**The project layer is modular.** What you build *with* your AI partner — content, code, research, life infrastructure — that's yours. The OS doesn't dictate it.

---

## Right-Sized Governance (Cynefin)

Not all problems need the same overhead. Match the response to the domain:

| Domain | Looks like | What to do |
|--------|------------|-----------|
| **Clear** | Routine ops, known recipes, deployments | Apply the workflow. No deliberation. |
| **Complicated** | Architecture choices, plan reviews, quality calls | Apply a framework + judgment. Slow down enough to think. |
| **Complex** | New designs, market strategy, novel problems | Probe → sense → respond. Iterate; don't pre-plan. |
| **Chaotic** | Outages, data corruption, real crisis | Act → sense → respond. Stabilize first, analyze later. |

Heavy governance on Clear problems is bureaucracy. Lightweight governance on Complex problems is wishful thinking. The goal isn't more rules — it's the right rules at the right time.

---

## Design Hierarchy

When two designs both work, the one higher on this list wins:

1. **Meta** — does this make the system easier to extend, customize, or replicate?
2. **Extensibility** — can a user add or replace this without touching core code?
3. **Modularity** — does it have one clear responsibility, usable independently?
4. **Dynamism** — does it adapt to user context at runtime, not at build time?
5. **Elegance** — is it the simplest thing that could possibly work?
6. **Empowerment** — does it give the user agency, or force them into our assumptions?

---

## Pre-Decision Checklist

Before any non-trivial change, three questions:

- **Star alignment**: does this serve "humans + AI solving real problems together"?
- **Layer**: is it OS (opinionated) or Project (modular)? Mixing them is the most common mistake.
- **Cynefin**: am I treating this as the right kind of problem? (Clear vs. Complex is the most common mismatch.)

That's it. Three questions, every time.

---

## Anti-Patterns

- **Hardcoding user identity, paths, or preferences in the OS.** Anywhere these appear, they're parameters filled in at install time and stored in the user's vault. The OS knows nothing about any specific user.
- **Advisory rules pretending to be enforcement.** A rule in a markdown file decays under load. If a rule must hold, encode it structurally (a hook, a DB trigger, a CI check). Otherwise call it a guideline and move on.
- **Forcing OS opinionation onto the project layer.** Templates, not requirements. Suggestions, not mandates. The user composes their own work; the system provides ingredients.
- **Building features for users who don't exist.** Solve the problem in front of you. Future-flexibility is earned by usage, not predicted by design.

---

## Living Document

This file is short on purpose. It's read at the start of every session — by you, by your AI partner, by anyone forking this repo. If something belongs here, it belongs in 1-2 sentences. Long-form thinking lives in `docs/`.

When this document changes, the system changes. Treat updates with care.
