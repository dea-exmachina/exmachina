# Identity Layer

The four-tier hierarchy that binds a user to their dea, defines dea's authority context, and layers project-specific mode without losing identity.

This folder contains the canonical templates. The installer renders them into the user's vault at install time, filling `{{handlebars}}` with answers.

---

## Files

| Template | Renders to | Tier |
|----------|-----------|------|
| `tier-0.global.template.md` | `~/.claude/CLAUDE.md` (fenced exmachina block) | 0 |
| `tier-1.vault.template.md` | `<vault>/CLAUDE.md` | 1 |
| `tier-2.project.template.md` | `<vault>/projects/<project>/CLAUDE.md` (one per project) | 2 |
| `tier-3.work.template.md` | `<vault>/projects/<project>/<work>/CLAUDE.md` (when work has substructure) | 3 |
| `dea.template.md` | `<vault>/identity/dea.md` (canonical character — referenced by tier-1 via `@`) | — |
| `user.template.md` | `<vault>/identity/user.md` (referenced by tier-1 via `@`) | — |
| `dea-wisdom.template.md` | `<vault>/identity/dea-wisdom.md` (loaded on demand, not in cascade) | — |

---

## Design Principles

1. **Light harness, heavy skills.** CLAUDE.md files are navigation, not content. They use `@` references to point at deeper files. CC pulls the targets only when relevant.
2. **Progressive context.** Vault structure has indexes and signs. Removes guesswork.
3. **qmd is the discovery primitive.** When dea doesn't know something, dea searches the vault with qmd before re-asking the user.
4. **Wisdom loads on demand.** Heavy judgment patterns sit in `dea-wisdom.md`, referenced via `@`. Never inline.
5. **One responsibility per tier.** Tier 0 = identity binding. Tier 1 = vault office. Tier 2 = project mode. Tier 3 = active work.
6. **No duplication across tiers.** Lower tiers refine higher ones via reference — they never restate.

See [`exmachina.wiki/hierarchy-design.md`](https://github.com/dea-exmachina/exmachina) (internal planning doc) for the full spec.
