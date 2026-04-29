---
name: exmachina-warn-force-push-main
enabled: true
event: bash
action: warn
pattern: git\s+push\s+(--force|-f|--force-with-lease)\s+.*\b(main|master|prod|production)\b
---

⚠️ **Force-push to a protected branch detected.**

You're about to force-push to `main`, `master`, `prod`, or `production`. This rewrites history that other people (or future you) may depend on.

**Common scenarios where force-push is wrong:**
- Cleaning up "messy commits" on main that are already pushed (just write better commits going forward)
- Reverting a bad commit (use `git revert` instead — preserves history)
- Recovering from a merge conflict (resolve and merge, don't force-push)

**Scenarios where force-push is genuinely correct:**
- Pre-merge branch you own, pushed only for backup, no one else has pulled
- A solo project where you've explicitly decided history rewrites are fine
- Recovering from a credential leak by stripping a commit (rare; document why)

If you're sure: `--force-with-lease` is safer than `--force` (refuses if anyone else pushed in the meantime).

This warning fires but doesn't block. Pause for two seconds — that's the point.
