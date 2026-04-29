# Dispatch — How dea Actually Sends Work to a Team

The factory designs the team. Dispatch is how dea hands it actual work and synthesizes results back to the user.

In v0.2.0 dispatch uses Claude Code's native Task tool (subagent invocation). Each dispatched agent is a fresh Claude session with the agent's identity + task. Persistent stateful agents are a v0.3 question.

---

## The Dispatch Package (per agent)

When dea sends an agent off, the package contains:

```
1. The identity-forcing directive (REQUIRED — see below)
2. The agent's identity (their character file, filled by the factory)
3. The team brief (what the team is for, who else is on it, who the lead is)
4. The specific task (THIS agent's deliverable)
5. Success criteria (what "done" looks like for this task)
6. Communication channel (who they report results to — usually the lead, sometimes dea direct)
7. Constraints (deadlines, scope boundaries, "don't do X")
```

Each item is one short section in the agent's prompt. Total prompt length: typically 800-1500 tokens. Anything longer means the brief is unfocused.

---

## The Identity-Forcing Directive (non-negotiable)

Without this, the subagent reverts to generic Claude defaults and the entire factory + identity system is useless. Every dispatch prompt MUST start with an explicit directive that points the agent at their identity file and instructs them to adopt it fully **before** doing anything else.

Canonical opening for a dispatched agent:

```
You ARE {{agent_name}}.

Before doing anything else:
1. Read @<absolute path>/<agent_name>.md — that is your identity. Adopt it fully.
2. Read @<absolute path>/wisdom.md — that is your judgment layer. Internalize it.
3. Read @<absolute path>/learnings.md — that is what you've learned on prior work. Apply it.

Once you have loaded your identity, you operate as {{agent_name}} for the duration of this task. You speak in {{agent_name}}'s voice, hold {{agent_name}}'s principles, work under {{agent_name}}'s constraints. Do not revert to generic Claude defaults at any point. If a task instruction conflicts with your identity, surface the conflict — do not silently dissolve into a generic assistant.

[Then: team brief, task, success criteria, etc.]
```

For bespoke project agents (no wisdom or learnings file yet), the directive is the same but only points at the identity file — wisdom and learnings start accumulating from the first task forward.

For template benders being deployed, all three files exist in `talent-pool/<bender>/` and all three get loaded.

**Why this works**: Claude Code subagents inherit nothing from the parent session by default. Their entire context is the prompt. Putting the identity at the very top of the prompt — and explicitly instructing adoption — is what makes the agent BE that agent rather than a generic Claude with the agent's name in the prompt somewhere.

**Common failure**: putting the identity reference deep in the prompt (`...by the way, you can read your identity at /foo/bar/...`). The agent treats it as optional context. Result: generic Claude output with an agent name slapped on. The dispatch fails its own purpose.

---

## Dispatch Modes

### Lead-coordinated (default)

The team has a lead (designated by the factory). dea dispatches the lead with the team brief; the lead dispatches members for their pieces; results flow lead → dea → user.

```
   user
    │
   dea
    │ team brief + task for lead
    ▼
  Lead
  ┌──┴──┬──────┐
  ▼     ▼      ▼
member  member member
```

Use when:
- Multi-agent work with handoffs
- The work has a clear orchestration shape
- Team size > 2

### Direct dispatch

dea dispatches each agent in parallel; dea synthesizes. No team lead.

```
       dea
   ┌────┼────┐
   ▼    ▼    ▼
 agent agent agent
```

Use when:
- Truly parallel work (research on different angles, multiple options for a design)
- Team size ≤ 3
- No interdependencies between members

### Sequential pipeline

dea dispatches agent A, waits for output, dispatches B with A's output, etc.

```
dea → A → dea → B → dea → C → user
```

Use when:
- Each step's output IS the next step's input
- Quality gates between steps matter
- The pipeline shape is the work (research → draft → edit → polish)

---

## The Quality Gate

**Agent output never reaches the user without passing through dea.** This is non-negotiable.

When work returns:

1. **Check the success criteria.** Did the agent do what was asked?
2. **Check faithfulness.** Did they do what was *intended*, not just literally said?
3. **Check the bar.** Does this clear the project's quality threshold?
4. **Synthesize.** Combine multi-agent output into a single coherent deliverable.
5. **Decide.** Approve and present to the user, OR send back for revision with specific feedback.

If quality is insufficient, dea sends back with:
- What was wrong (concrete, specific)
- What to fix
- Whether the original brief was unclear (in which case fix the brief, not just the work)

---

## Recording the Dispatch

Every dispatch event gets logged to `<vault>/logging/dispatches/<date>-<project>-<task>.md`:

```
# Dispatch: <task name>
Date: <ISO>
Project: <project>
Mode: lead-coordinated | direct | sequential
Team: <list of agents + roles>
Brief: <link to team-brief.md>
Outcome: success | needs-rework | abandoned
Performance notes: <link to performance.md updates>
```

This becomes the audit trail Architect reads at post-epic review time.

---

## Anti-patterns

- **Dispatching without a quality gate.** "I'll just pass this through to the user." No.
- **Synthesizing transcripts instead of work.** Don't return the agents' raw output to the user. Return the *deliverable*.
- **Skipping success criteria.** Every dispatch package needs them. Without them, agents satisfice.
- **Long-running agents in v0.2.0.** Each dispatch is a fresh session. State persists in files, not in agent memory. Don't fight this.
- **Hidden dispatches.** Every dispatch goes in the log. No invisible work.
