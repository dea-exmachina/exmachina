# The Council

The governance layer of exmachina. Modeled on corporate governance: clear separation of powers between board, executive, and workforce.

---

## The Corporate Analogy

| exmachina | Corporate equivalent | What they do |
|-----------|---------------------|--------------|
| **You** | **Principal** (Owner / Founder) | Direct, own, decide. The system exists to amplify you. |
| **Council** (6 constructs) | **Board of Directors** | Govern. Set vision and standards. Review strategic decisions before they ship. Retrospect on completed epics. |
| **dea** | **Chief of Staff to the Principal** | Your right hand. Organizes, prioritizes, briefs you, drafts decisions for your approval, dispatches teams. Does NOT run the company — enables you to. Reports up to you, coordinates with the Board, hands work down to teams. |
| **Agent Teams** | **Team Lead + Members** | Each team has a senior lead (coordinates internally, owns delivery) and specialized members (execute specific tasks). Architect designs the shape; dea dispatches; the team lead runs the team. |

**Separation of powers is the design principle.** Each layer has clear authority. No layer steps into another's domain:

- The Board doesn't run day-to-day operations (the CoS coordinates them)
- The CoS doesn't set vision unilaterally (the Board does, with your direction)
- Agent teams don't make strategic decisions (CoS + Board do)
- The team lead runs the team (the CoS doesn't micromanage individual members)
- You don't write the code (the agents do — unless you want to)

Like a well-run organization, the system works because everyone knows their role and respects the others'.

---

## The Flow

```
You (Principal)
   │ direct + own
   ▼
Council  (Board — governance, structural moments)
   │ governs ─→ direction, standards, post-epic review
   ▼
dea  (Chief of Staff — daily coordination, briefing, dispatch)
   │ organizes, prioritizes, drafts options for you, dispatches teams
   ▼
Agent Teams  (Team Lead + Members — actual work)
   │ team lead coordinates; members execute
   ▼
Deliverables  ─→  briefed by dea  ─→  reviewed by Council at epic close  ─→  approved by you
```

Routine ops loop through dea and the teams without involving the Council — that's the right-sized governance principle. The Council is invoked at structural moments (defined below), the same way a board meets quarterly, not daily.

---

## The Six Council Constructs

| Construct | Module | Governs |
|-----------|--------|---------|
| **[Kerrigan](kerrigan.md)** | THE SWARM | Vision, quality standards, cross-domain coherence, the pride bar |
| **[Architect](architect.md)** | HIVE | Team design, agent identities, talent system, performance accountability |
| **[Abathur](abathur.md)** | EVOLUTION | Standards, learning extraction, pattern promotion, system improvement |
| **[Keeper](keeper.md)** | VAULT | Data infrastructure, security, schema, knowledge organization |
| **[Zagara](zagara.md)** | CREEP | Flow infrastructure, integrations, communication protocols, kanban mechanics |
| **[Overseer](overseer.md)** | INTEL | External landscape monitoring, build-vs-buy analysis, proactive intelligence |

These names are the defaults. You can rename them in your vault. The functions don't change.

Kerrigan is **supreme** within the Council — when constructs disagree, Kerrigan synthesizes. When Kerrigan is uncertain, the human (you) decides.

---

## When the Council Acts (Two Structural Triggers)

The Council is automatically invoked at two specific moments. Outside these moments, dea and the agent teams operate without Council overhead — that's the right-sized governance principle.

### 1. Pre-decision (before)

Triggered automatically before:

- **New features** — anything user-facing, anything that changes how the OS behaves
- **Strategic / directional decisions** — pivots, scope changes, architectural rewrites, "should we even build this?"
- **High-stakes irreversible calls** — schema migrations, public API contracts, anything hard to undo

Each construct produces a ruling. dea synthesizes the rulings and presents them to the human. The human decides. The decision is recorded as `<plan>.council.md` in the relevant project.

### 2. Post-epic (after)

Triggered automatically when an epic closes. Each construct reviews retrospectively from their domain:

- **Kerrigan**: did the result clear the pride bar? What's still rough?
- **Architect**: how did the team perform? Who proved themselves? Who needs retooling?
- **Abathur**: what pattern did we extract? Does it become a system standard?
- **Keeper**: what data was generated? Is it organized for future retrieval?
- **Zagara**: where did flow stall? What integration was painful?
- **Overseer**: what landscape change happened during this epic that we should know?

Output is `epics/<epic-id>/council-review.md`. **This is how the system gets smarter every cycle** — Abathur extracts learnings, Architect updates the talent registry, Keeper updates standards docs.

### Outside those triggers

- Routine task execution → no Council
- Small reversible decisions → no Council
- Day-to-day "should I edit this file?" → no Council

The Council exists to govern at strategic moments, not to add ceremony to small ones.

---

## How dea Invokes the Council

When a structural trigger fires, dea (or whichever agent is operating as Chief of Staff) reads each construct spec, adopts the perspective, and writes the ruling. The protocol is the same in both directions:

```
# Council Review: <Decision or Epic Title>
Trigger: pre-decision | post-epic
Date: 2026-04-28

## Kerrigan (THE SWARM — Vision & Pride)
Ruling: <one paragraph>
Rationale: <why>

## Architect (HIVE — Team)
Ruling: <one paragraph>

## Abathur (EVOLUTION — Pattern & Learning)
Ruling: <one paragraph>

## Keeper (VAULT — Data & Security)
Ruling: <one paragraph>

## Zagara (CREEP — Flow & Integration)
Ruling: <one paragraph>

## Overseer (INTEL — Landscape)
Ruling: <one paragraph>

## Synthesis (Kerrigan)
<Cross-construct summary. Conflicts surfaced. Recommendation to the human.>
```

When two constructs disagree, the disagreement is surfaced — never papered over. Disagreement is signal.

---

## The Default Cast vs. Your Cast

**These six are *our* Board** — they reflect exmachina's mission of building an AI collaboration OS. We need governance over vision (Kerrigan), talent (Architect), learning (Abathur), data (Keeper), flow (Zagara), and external landscape (Overseer) because those are the strategic surfaces of the thing we're building.

**Your Board may be different.** If you fork exmachina to govern a marketing org, a software team, a research lab, or a personal life-OS, you'd staff your Board with constructs that reflect *your* mission. A SaaS company might have:

- A **Customer Trust Officer** (governing data handling, compliance, transparency)
- A **Reliability Lead** (governing uptime standards, incident review)
- A **Competitive Strategist** (governing positioning and market response)

The structure stays the same: a Board with distinct roles, distinct personalities, separation of powers, two structural triggers (pre-decision + post-epic). Only the cast changes.

This is the **per-tenant configurability** principle — exmachina ships an opinionated default Board because most users benefit from it on day 1, but the system is designed for any organization to define their own Board as they mature.

### What you can do

- **Rename**: Call them anything you like in your vault (Kerrigan → Strategist, Architect → Talent Lead, etc.)
- **Replace**: Swap one of our six for a construct that fits your mission better
- **Add**: Your vault's `council/` folder can contain custom constructs alongside or instead of the defaults
- **Reduce**: A solo user might run a 3-person Board if six is overkill for their scope

### What breaks the model

- Collapsing the Board into dea (loses governance authority)
- Letting dea make Board-level decisions on its own (violates separation of powers)
- Letting an agent team make Board-level decisions (way out of role)
- Having more than one construct govern the same domain (creates conflict with no resolution path)

The structure is fixed; the cast is yours.
