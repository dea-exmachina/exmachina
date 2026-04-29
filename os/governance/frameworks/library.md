# exmachina Framework Library

> **Guiding Star:** Enable humans and AI to work together to solve real problems and build great things.

A library of structured thinking tools. Each framework defines an objective, constraints, success criteria, and Guiding Star alignment. dea, the Board, and dispatched agents can invoke any framework when its shape fits the problem.

**How this loads**: referenced from tier-1 vault CLAUDE.md via `@os/governance/frameworks/library.md` — pulled in on demand, not always. Use `qmd` to search inside it for the right framework if you're unsure which to pick.

**Living document.** Frameworks evolve. Anyone — human, agent, or Board construct — can propose additions or refinements through the kanban + git pipeline. Post-epic Council reviews are a natural moment to upstream patterns that proved themselves.

---

## How to Use This Library

When approaching any piece of work, the agent or human should:

1. **Identify the type of work** — Is this planning? Building? Writing? Analyzing? Collaborating?
2. **Select a framework** — Choose one (or combine several) that fits the problem.
3. **Apply the framework** — Use it to define objective, constraints, success criteria, and approach.
4. **Check Guiding Star alignment** — Does this work serve the north star?
5. **Execute with creative freedom** — The framework shapes the problem. Intelligence fills it.

---

# 1. Planning Frameworks

## 1.1 OGSM (Objectives, Goals, Strategies, Measures)

**Canonical ID:** `ogsm`

**When to use:** Translating a high-level objective into a concrete, measurable plan. Project kickoffs. Quarterly planning. Aligning a team around a shared direction.

**Structure:**
- **Objective:** One qualitative statement of what we want to achieve (aligned to the Guiding Star)
- **Goals:** 2-4 quantitative targets that define success
- **Strategies:** The approaches we will take to reach those goals
- **Measures:** Specific KPIs and milestones that track progress

**Why it works for dea:** It forces clarity at every level. An agent receiving an OGSM knows exactly what success looks like before writing a line of code.

---

## 1.2 Pre-Mortem Analysis

**Canonical ID:** `pre-mortem`

**When to use:** Before starting any significant project or initiative. Especially valuable for high-stakes work.

**Structure:**
- Assume the project has already failed. It's six months from now and it didn't work.
- Each participant (human or agent) independently lists the most likely reasons for failure.
- Group and prioritize the failure modes.
- For each high-priority failure mode, define a mitigation strategy.
- Integrate mitigations into the project plan.

**Why it works for dea:** Agents are naturally optimistic executors. The pre-mortem forces adversarial thinking before commitment, catching risks that would otherwise surface too late.

---

## 1.3 Working Backwards (Amazon-style)

**Canonical ID:** `working-backwards`

**When to use:** New product features, new tools, new capabilities. Anything where the end-user experience matters.

**Structure:**
- Write the press release / announcement first — what will we say when this is done?
- Define the customer (user) and their problem.
- Describe the solution and how it feels to use.
- Write the FAQ — what questions will people ask?
- Work backwards from this vision to define the build plan.

**Why it works for dea:** It prevents building something technically impressive that nobody wants. The vision document becomes the Guiding Star for the project.

---

## 1.4 RICE Prioritization

**Canonical ID:** `rice`

**When to use:** Prioritizing a backlog of tasks, features, or initiatives when resources are constrained.

**Structure:**
- **Reach:** How many users/stakeholders will this affect?
- **Impact:** How much will it move the needle? (Scored 0.25 to 3)
- **Confidence:** How sure are we about these estimates? (Percentage)
- **Effort:** How much work is required? (Person-weeks or agent-hours)
- **Score:** (Reach × Impact × Confidence) / Effort

**Why it works for dea:** Provides a quantitative basis for the Chief of Staff to prioritize work across multiple competing requests.

---

# 2. Development Frameworks

## 2.1 Test-Driven Development (TDD)

**Canonical ID:** `tdd`

**When to use:** Building any code, tool, automation, or system component.

**Structure:**
- Write the test first — define what "working" means before writing any code.
- Run the test (it should fail — the feature doesn't exist yet).
- Write the minimum code to pass the test.
- Refactor for clarity and quality.
- Repeat.

**Why it works for dea:** It aligns perfectly with the Kanban protocol. The test is the success criteria. The card is complete when all tests pass.

---

## 2.2 Separation of Concerns

**Canonical ID:** `separation-of-concerns`

**When to use:** Architectural decisions. Designing any system with multiple components.

**Structure:**
- Each component should do one thing well.
- Components communicate through defined interfaces, not shared state.
- Changes to one component should not require changes to others.
- Data flows through the system in predictable, traceable paths.

**Why it works for dea:** The entire dea architecture is built on this principle (context wrappers, role separation, governance/execution split). Agents should apply the same thinking to everything they build.

---

## 2.3 Integration-First Development

**Canonical ID:** `integration-first`

**When to use:** Before building anything new. Always.

**Structure:**
- Before writing custom code, check: does an existing tool, library, or service already solve this?
- If yes, integrate it. Don't rebuild.
- If partially, extend the existing solution rather than starting from scratch.
- If no, build — but on top of established foundations.
- Document the decision and rationale on the task card.

**Why it works for dea:** Prevents the AI tendency to reinvent solutions. Produces more reliable, maintainable outputs.

---

## 2.4 Progressive Enhancement

**Canonical ID:** `progressive-enhancement`

**When to use:** Building user-facing tools, interfaces, or capabilities.

**Structure:**
- Start with the simplest version that works.
- Ship it. Get feedback.
- Add capabilities incrementally based on actual usage.
- Each enhancement is a separate card through the Kanban pipeline.

**Why it works for dea:** Prevents over-engineering. Gets working tools into users' hands faster. Each increment is reviewable and reversible.

---

# 3. Writing Frameworks

## 3.1 Pyramid Principle (Minto)

**Canonical ID:** `pyramid-principle`

**When to use:** Any written communication — reports, proposals, summaries, documentation, emails.

**Structure:**
- Lead with the answer / conclusion / recommendation.
- Support with key arguments (3-5 maximum).
- Back each argument with evidence and data.
- Every level answers "why?" or "how?" for the level above.

**Why it works for dea:** Agents default to chronological or stream-of-consciousness output. The Pyramid Principle forces conclusion-first communication that respects the reader's time.

---

## 3.2 SCQA (Situation, Complication, Question, Answer)

**Canonical ID:** `scqa`

**When to use:** Framing a problem for stakeholders. Executive communications. Proposals. Any context where you need buy-in.

**Structure:**
- **Situation:** What is the current state? (Establish shared context)
- **Complication:** What has changed or gone wrong? (Create tension)
- **Question:** What do we need to decide or solve? (Focus attention)
- **Answer:** What do we recommend? (Resolve the tension)

**Why it works for dea:** Gives agents a narrative structure for communicating findings, recommendations, and proposals. Prevents the "wall of information" problem.

---

## 3.3 Documentation-as-Code

**Canonical ID:** `documentation-as-code`

**When to use:** All system documentation, technical docs, process documentation.

**Structure:**
- Documentation lives alongside the code it describes, in the same repository.
- Documentation is version-controlled and reviewed through the same PR process.
- Documentation is written in markdown — human-readable, diffable, searchable.
- When code changes, documentation changes in the same PR.
- Stale documentation is treated as a bug.

**Why it works for dea:** Ensures documentation stays current. The Kanban pipeline enforces it — a PR without updated docs is incomplete.

---

# 4. Design Frameworks

## 4.1 Design Thinking (Stanford d.school)

**Canonical ID:** `design-thinking`

**When to use:** Solving problems where the user's needs are central. New features, new tools, UX improvements.

**Structure:**
- **Empathize:** Understand the user. What are their actual needs, frustrations, goals?
- **Define:** Articulate the problem clearly. What specific problem are we solving?
- **Ideate:** Generate multiple possible solutions. Don't converge too early.
- **Prototype:** Build a quick, testable version. Use visualization (Excalidraw).
- **Test:** Get feedback. Iterate. Repeat.

**Why it works for dea:** Forces user-centered thinking. The empathize phase leverages the system's persistent context about users.

---

## 4.2 Visual-First Design

**Canonical ID:** `visual-first`

**When to use:** Any planning, architecture, or design work. Always.

**Structure:**
- Before writing prose, draw it. Use Excalidraw, diagrams, flowcharts, wireframes.
- Architecture decisions are expressed as diagrams before they're expressed as code.
- Plans include visual maps of dependencies, timelines, and relationships.
- Outputs include visual artifacts alongside text.
- Complex systems are understood spatially before they're built linearly.

**Why it works for dea:** This is a core design principle of the system. Visualization is a meta-function, not decoration.

---

## 4.3 Atomic Design

**Canonical ID:** `atomic-design`

**When to use:** Building UI components, design systems, or any modular interface.

**Structure:**
- **Atoms:** Basic building blocks (buttons, inputs, labels)
- **Molecules:** Simple groups of atoms (search bar = input + button)
- **Organisms:** Complex components made of molecules (navigation header)
- **Templates:** Page-level structures with placeholder content
- **Pages:** Specific instances with real content

**Why it works for dea:** Creates reusable, composable components that compound in the framework library. Build once, reuse everywhere.

---

# 5. Thinking / Strategy Frameworks

## 5.1 First Principles Thinking

**Canonical ID:** `first-principles`

**When to use:** When stuck, when facing a novel problem, when conventional approaches aren't working.

**Structure:**
- Identify the fundamental truths about the problem — what do we *know* to be true?
- Strip away assumptions, conventions, and "how it's always been done."
- Rebuild the solution from the ground up based on those fundamentals.
- Test the new approach against the Guiding Star.

**Why it works for dea:** Prevents cargo-cult implementation. Agents should reason from fundamentals, not pattern-match to previous solutions.

---

## 5.2 SWOT Analysis

**Canonical ID:** `swot`

**When to use:** Situational assessment. Understanding where we stand before making a strategic decision.

**Structure:**
- **Strengths:** What do we do well? What advantages do we have?
- **Weaknesses:** Where are we limited? What do we lack?
- **Opportunities:** What external conditions could we leverage?
- **Threats:** What external factors could hurt us?
- Cross-reference: How can strengths address threats? How can opportunities overcome weaknesses?

**Why it works for dea:** Simple, universally understood. Good starting point for any strategic assessment.

---

## 5.3 Inversion (Charlie Munger)

**Canonical ID:** `inversion`

**When to use:** Decision-making. Strategy. Anywhere you need to stress-test a plan.

**Structure:**
- Instead of asking "how do I succeed?", ask "how would I guarantee failure?"
- List everything that would make this fail.
- Invert: make sure you're not doing any of those things.
- The path to success is often clearer when you've mapped the path to failure.

**Why it works for dea:** Pairs naturally with the Pre-Mortem. Agents can use inversion to validate their approach before committing effort.

---

## 5.4 Second-Order Thinking

**Canonical ID:** `second-order-thinking`

**When to use:** Evaluating decisions with long-term consequences. Architecture choices. Governance changes.

**Structure:**
- First-order: What happens immediately if we do this?
- Second-order: What happens *because of* the first-order effects?
- Third-order: And then what? What are the downstream consequences?
- Evaluate the decision based on the full chain, not just the immediate result.

**Why it works for dea:** Prevents short-term optimizations that create long-term debt. Essential for architectural decisions.

---

## 5.5 Jobs to Be Done (JTBD)

**Canonical ID:** `jtbd`

**When to use:** Understanding what users actually need. Feature prioritization. Product decisions.

**Structure:**
- People don't buy products — they "hire" them to do a job.
- What job is the user trying to get done?
- What are they currently "hiring" to do that job? (The competition isn't always obvious)
- What would make our solution better at that job?
- Define success in terms of the job done, not features shipped.

**Why it works for dea:** Keeps the system focused on outcomes, not features. The Guiding Star is ultimately about enabling people to get real work done.

---

# 6. Philosophical Frameworks

## 6.1 Stoic Control Dichotomy

**Canonical ID:** `stoic-control`

**When to use:** Resource allocation. Prioritization. When the team or system is overwhelmed.

**Structure:**
- Divide everything into what you can control and what you cannot.
- Focus all energy on what you can control.
- Accept what you cannot control — don't waste resources fighting it.
- Design systems to be resilient to things outside your control.

**Why it works for dea:** AI model quality, API availability, external service reliability — these are outside our control. The platform's model-agnostic architecture is a structural application of this principle.

---

## 6.2 Occam's Razor

**Canonical ID:** `occams-razor`

**When to use:** Architecture decisions. Choosing between competing approaches. Debugging.

**Structure:**
- The simplest explanation is usually correct.
- The simplest solution that meets the requirements is usually best.
- Complexity must be justified — every added layer must earn its place.
- When in doubt, simplify.

**Why it works for dea:** Prevents over-engineering. Agents have a tendency toward complexity. This framework provides explicit permission to keep things simple.

---

## 6.3 Via Negativa (Nassim Taleb)

**Canonical ID:** `via-negativa`

**When to use:** System improvement. Reducing fragility. Process optimization.

**Structure:**
- Improvement often comes from removing what's bad, not adding what's good.
- Before adding a new feature, ask: what should we remove?
- Subtract unnecessary complexity, redundant processes, outdated patterns.
- A system improves by getting lighter, not heavier.

**Why it works for dea:** Aligns directly with Abathur's pruning mandate. The framework library itself should be regularly pruned.

---

# 7. Team Building Frameworks

## 7.1 RACI Matrix

**Canonical ID:** `raci`

**When to use:** Any project with multiple contributors (human or AI). Clarifying who does what.

**Structure:**
- **Responsible:** Who does the work?
- **Accountable:** Who owns the outcome? (One person/role only)
- **Consulted:** Who provides input before the work is done?
- **Informed:** Who needs to know after the work is done?
- Every deliverable has exactly one Accountable.

**Why it works for dea:** Essential for the Chief of Staff when assembling agent teams. Prevents the "everyone is responsible so nobody is responsible" problem.

---

## 7.2 Capability Mapping

**Canonical ID:** `capability-mapping`

**When to use:** Team formation. Identifying gaps. Deciding which agents/roles to assign.

**Structure:**
- List the capabilities required for the project.
- Map available agents/roles against those capabilities (using EWMA scores).
- Identify gaps — capabilities needed but not covered.
- Fill gaps by either upskilling existing roles or creating new ones.
- Form the team based on capability coverage, not availability.

**Why it works for dea:** The Chief of Staff uses this implicitly when assembling teams. Making it explicit improves team composition and surfaces capability gaps.

---

## 7.3 Tuckman's Stages (Adapted for AI Teams)

**Canonical ID:** `tuckman`

**When to use:** Understanding team dynamics. Especially relevant when combining human and AI collaborators.

**Structure:**
- **Forming:** Team assembled. Roles defined. Context shared. Guiding Star aligned.
- **Storming:** Approaches debated. Disagreements on the card. Healthy friction.
- **Norming:** Standards established. Communication patterns stabilized. Framework selected.
- **Performing:** High-output execution. Minimal coordination overhead. Flow state.
- **Adjourning:** Project complete. Retrospective. Learnings captured. Knowledge compounded.

**Why it works for dea:** Even AI teams go through these stages. Acknowledging it helps the Chief of Staff manage expectations and provide appropriate support at each phase.

---

# 8. Collaborative Frameworks

## 8.1 RFC (Request for Comments)

**Canonical ID:** `rfc`

**When to use:** Proposing significant changes. Architecture decisions. New frameworks. Anything that affects multiple stakeholders.

**Structure:**
- Write a proposal document: problem, proposed solution, alternatives considered, trade-offs.
- Share on a task card for feedback.
- Solicit comments from all affected parties (human and AI).
- Set a review deadline.
- Incorporate feedback, document decisions, and proceed or revise.

**Why it works for dea:** Gives agents and humans a structured way to propose changes. The task card is the RFC thread. All discussion is captured.

---

## 8.2 Retrospective (Agile)

**Canonical ID:** `retrospective`

**When to use:** After every significant project or sprint. Regularly (weekly/biweekly).

**Structure:**
- **What went well?** — Identify and reinforce positive patterns.
- **What didn't go well?** — Identify failures and friction points. No blame.
- **What should we change?** — Specific, actionable improvements.
- Each improvement becomes a card in the backlog.
- Track whether previous retrospective items were addressed.

**Why it works for dea:** Closes the feedback loop. Learnings are captured structurally, not lost in conversation. Feeds into EWMA scoring and framework refinement.

---

## 8.3 Decision Log

**Canonical ID:** `decision-log`

**When to use:** Continuously. Every project should maintain one.

**Structure:**
- For every significant decision, record: the decision, the date, who made it, the alternatives considered, the rationale, and the Guiding Star alignment.
- The decision log lives on the task card (or a linked document).
- Decisions can be revisited but not silently reversed — a reversal is a new decision with its own entry.

**Why it works for dea:** Makes the reasoning behind decisions visible and searchable. When a new agent picks up a project, the decision log is instant context.

---

# 9. Problem-Solving Frameworks

## 9.1 Five Whys

**Canonical ID:** `five-whys`

**When to use:** Root cause analysis. Debugging. Understanding why something failed or isn't working.

**Structure:**
- State the problem.
- Ask "Why?" — and answer it.
- Ask "Why?" again about that answer.
- Repeat five times (or until you reach the root cause).
- Address the root cause, not the symptom.

**Why it works for dea:** Prevents superficial fixes. Agents tend to address the immediate symptom. Five Whys forces them to dig to the structural cause.

---

## 9.2 Issue Trees (MECE)

**Canonical ID:** `issue-trees`

**When to use:** Breaking down complex problems. Ensuring completeness of analysis.

**Structure:**
- State the problem as a question.
- Decompose into sub-questions that are **Mutually Exclusive** (no overlap) and **Collectively Exhaustive** (nothing missing).
- Continue decomposing until each branch is answerable.
- Solve from the leaves up.
- Visualize as a tree diagram (Excalidraw).

**Why it works for dea:** The gold standard for structured problem decomposition. MECE thinking prevents both gaps and redundancy in analysis.

---

## 9.3 Constraint Analysis (Theory of Constraints)

**Canonical ID:** `constraint-analysis`

**When to use:** Improving system throughput. Identifying bottlenecks. Process optimization.

**Structure:**
- **Identify** the constraint — what is the single biggest bottleneck?
- **Exploit** the constraint — maximize its efficiency without additional resources.
- **Subordinate** everything else — align all other processes to support the constraint.
- **Elevate** the constraint — if exploitation isn't enough, invest to increase capacity.
- **Repeat** — once this constraint is resolved, find the next one.

**Why it works for dea:** The system always has a bottleneck somewhere. This framework finds it and addresses it systematically.

---

## 9.4 Cynefin Framework (Dave Snowden)

**Canonical ID:** `cynefin`

**When to use:** Categorizing problems before choosing an approach. Avoiding applying the wrong type of solution.

**Structure:**
- **Clear (Simple):** Cause and effect obvious. Apply best practice. (Use a workflow)
- **Complicated:** Cause and effect discoverable with analysis. Apply good practice with expert input. (Use a framework + specialist agents)
- **Complex:** Cause and effect only visible in retrospect. Probe, sense, respond. Experiment. (Use sandbox + progressive enhancement)
- **Chaotic:** No clear cause and effect. Act immediately, then sense and respond. (Stabilize first, then analyze)
- **Confused:** Don't know which domain you're in. Break the problem down until you can categorize each part.

**Why it works for dea:** Critical meta-framework. Prevents applying rigid workflows to complex problems, or over-analyzing simple ones. The system should categorize problems before selecting an approach.

---

# 10. Team Assembly Frameworks (dea-specific)

## 10.1 HIVE Team Construction (Architect)

**Canonical ID:** `hive-team-construction`

**When to use:** Assembling a multi-agent team for a project that requires multiple capability domains, parallel workstreams, or a delivery chain with handoffs between roles.

**Structure:**
- Phase 1 — Analyze Goal: read manifesto, map delivery chain, decompose required capabilities
- Phase 2 — Select/Create Identities: query capability registry, fill gaps, validate chain [GATE: dea approves roster]
- Phase 3 — Assemble Manifest: assign platforms, define sequencing [GATE: dea approves manifest]
- Phase 4 — Generate Task Breakdown: create tasks, tag [BENDER]/[DEA], build context packages
- Phase 5 — Provision: create agent projections, update registry, commit

**Constraints:**
- Max 2 expertise domains per identity (talent density)
- Max 5 skills per identity (focus)
- Max 3 benders per team + dea oversight (coordination cost)
- Every delivery chain must have a QA/review role consuming the output

**Success criteria:** Every capability required by the goal is covered by a named identity. Delivery chain is complete (producer → consumer → end user). No orphaned outputs.

**Why it works for dea:** HIVE is the canonical team construction pattern. It prevents ad-hoc team assembly, ensures delivery chains are complete, and produces teams that are designed rather than assembled. The capability registry cross-reference ensures team composition reflects actual system capability.

**Cross-reference:** Capability registry at `benders/context/shared/capability-registry.md`. Full workflow at `workflows/public/hive-construct.md`. Named bender roster at `benders/context/shared/bender-roster.md`.

---

# How to Add New Frameworks

Anyone can propose a new framework. The process:

1. **Open a card** in the backlog describing the framework and its use case.
2. **Draft the framework** following the standard structure: when to use, structure, why it works for dea.
3. **Submit a PR** with the framework added to this library.
4. **Review** — the Council or relevant stakeholders evaluate fit, completeness, and Guiding Star alignment.
5. **Merge** — the framework is added to the library and available for use.

Frameworks can also be refined through the same process. If an agent or human finds a framework doesn't quite fit their use case, they can propose a modification or a specialized variant.

---

*Every framework in this library exists for one reason: to help humans and AI work together to solve real problems and build great things. If a framework doesn't serve that purpose, it doesn't belong here.*

*Every step closer to the star.*
