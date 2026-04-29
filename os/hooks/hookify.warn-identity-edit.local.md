---
name: exmachina-warn-identity-edit
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: identity/(.*\.md|user\.md|dea.*\.md)$|os/identity/.*\.template\.md$|council/.*\.md$
---

⚠️ **Editing an identity or governance file.**

This file shapes how the system behaves at every session. Edit deliberately:

- **Identity files** (`identity/*.md`, `os/identity/*.template.md`): change character, voice, decision authority, or wisdom for one or more agents
- **Council files** (`council/*.md`): change a Board construct's domain, principles, or triggers

Before saving:

1. Is this change reversible? If not, consider committing the current version first as a snapshot
2. Are you changing a single agent's calibration, or a system-wide rule? System-wide changes deserve a Council pre-decision review
3. Will this break dispatch (e.g., renaming an agent without renaming its files)?

This warning fires once per file per session. Proceeding is fine if you've thought it through.
