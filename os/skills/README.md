# Skills

Claude Code skills shipped with exmachina. Currently: **none.**

---

## Philosophy: Skills Earn Their Way In

The v0.1 system shipped a handful of skills (`/good-morning`, `/plan`, `/dispatch-agents`). Looking at v0.2 with fresh eyes, every one of them was **scaffolding around gaps in the OS** — they existed because dea didn't have a coherent identity that prescribed session-start behavior, the framework library wasn't loadable via the cascade, and the agent factory protocol wasn't documented.

v0.2 closes those gaps. dea's identity (`os/identity/dea.template.md` + `dea-wisdom.template.md`) prescribes the session ritual. The framework library is `@`-loadable. The factory protocol is a clean doc the Hirer reads. The skills become ceremony around capability that already exists.

**Rule for v0.2.x and beyond**: a skill is added only when a real, demonstrated gap exists. Not preemptively. Not as documentation. Not "in case the user wants to invoke this explicitly."

---

## When to Add a Skill (the test)

Three honest tests. A new skill must pass all three:

1. **Capability gap**: there's something dea cannot do well from identity + protocol docs alone.
2. **Repeated need**: it would be invoked often enough to justify documentation as a skill rather than an ad-hoc invocation.
3. **Scope clarity**: the skill has clear inputs, clear outputs, and clear boundaries — not just "a helpful workflow."

If any of the three fails, write a better protocol doc instead.

---

## Skills That Might Earn Their Way In Later

These are *speculations*, not commitments. We add them only when the gap is real:

- `/release` — for shipping a new version of exmachina itself (cuts a release tag, updates VERSION, regenerates installer artifacts). Earns its way in if v0.2.x has a real release cadence.
- `/promote-agent` — for the user-driven agent promotion ceremony. Earns its way in once a project actually produces a candidate worth promoting.
- `/council-review` — automatic Council pre-decision or post-epic invocation. Earns its way in once we run two or three of these manually and find dea fumbling the protocol.
- `/qmd-bootstrap` — index a new collection in qmd for a fresh vault. Earns its way in once the second user installs and qmd indexing is the friction point.

---

## How Skills Will Be Installed (when they exist)

Two scopes:

- **User-scope** (`~/.claude/skills/<skill>/`) — available in every session, every project.
- **Vault-scope** (`<vault>/.claude/skills/<skill>/`) — only when CC opens that vault.

The installer (when skills ship) will offer both options; default user-scope.

---

## Light Harness Applies Here

When skills do exist, they follow the same principle as CLAUDE.md: keep `SKILL.md` lean, point at deeper files via `@` references for expertise loaded on demand. A 200-line skill that references three framework docs outperforms a 500-line skill with everything inlined.
