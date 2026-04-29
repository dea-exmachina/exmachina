# Talent Pool

Promoted agents — named identities the user has chosen to keep around for reuse across projects.

In v0.2.0 this folder ships **empty** (or with a small seed set inherited from v0.1). The pool grows from two paths:

1. **User promotion**: when a project agent excels, the user promotes them. Architect surfaces the recommendation at post-epic Council review. The user decides. On promotion, the agent's identity, accumulated wisdom, and learnings move from `<vault>/projects/<project>/team/` into `talent-pool/<bender-name>/`.

2. **Seed benders** (optional, v0.1 inherited): a few proven generic specialists for recurring infrastructure work. The seed set is intentionally minimal — you don't pre-populate a talent pool you haven't earned yet. Defaults that may ship with the system:
   - **Forge** — infrastructure engineer (bash, systemd, deploy automation)
   - **Piper** — data pipeline engineer (Python, ETL, scheduled jobs)

Whether these seed automatically into a new vault is a v0.2.0 install-time choice (probably default-yes for power users, default-no for non-technical first-time users).

---

## Structure (per promoted agent)

```
talent-pool/
└── <bender-name>/
    ├── <bender-name>.md        # Identity (canonical character file)
    ├── wisdom.md               # Accumulated judgment across projects
    ├── learnings.md            # Specific lessons from completed work
    └── track-record.md         # Project history, performance notes, EWMA score (v0.2.1+)
```

---

## Dispatch (using a pool bender)

When the Hirer chooses Mode A (template bender) or dea directly dispatches a routine task, the bender's identity files become the dispatch package. The dispatch prompt MUST start with the canonical identity-forcing directive (see `os/agents/dispatch.md`):

```
You ARE <bender_name>.

Before doing anything else:
1. Read @<vault>/agents/talent-pool/<bender>/<bender>.md — that is your identity. Adopt it fully.
2. Read @<vault>/agents/talent-pool/<bender>/wisdom.md — judgment layer.
3. Read @<vault>/agents/talent-pool/<bender>/learnings.md — prior lessons.
...
```

Without that forcing directive, the subagent reverts to generic Claude. Always include it.

---

## Promotion Mechanics (user-driven)

Promotion is triggered by the user, surfaced by Architect, supported by performance evidence:

1. **Project epic closes.** dea writes performance notes per agent in `<vault>/projects/<project>/team/performance.md`.
2. **Post-epic Council review.** Architect reads the notes, identifies excelling agents, presents a recommendation: "Mira (researcher on this project) was strong on regulatory analysis — promote?"
3. **User decides.** Yes → move identity files to `talent-pool/<mira>/`, give them a permanent name, optionally add a git identity. No → archive the project agent in the project's logging folder; nothing moves to the pool.
4. **Future projects.** The Hirer's Mode A search now includes Mira. If a future project needs a researcher with regulatory chops, Mira is a candidate before anything bespoke gets drafted.

This is how the talent system gets institutional memory. The pool grows because of demonstrated performance, not upfront design.
