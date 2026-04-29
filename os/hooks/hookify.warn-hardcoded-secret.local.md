---
name: exmachina-warn-hardcoded-secret
enabled: true
event: file
action: warn
conditions:
  - field: new_text
    operator: regex_match
    pattern: (sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|sbp_[a-zA-Z0-9]{40}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|xox[bpa]-[0-9]+-[0-9]+-[0-9a-zA-Z]{24}|-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----)
---

⚠️ **Possible hardcoded secret in content being written.**

The content matches a pattern that looks like a real credential:

- `sk-...` — OpenAI / Anthropic API key shape
- `ghp_...` / `gho_...` — GitHub personal access token / OAuth token
- `sbp_...` — Supabase service role key
- `AKIA...` — AWS access key
- `AIza...` — Google API key
- `xoxb-...` / `xoxp-...` — Slack token
- `-----BEGIN PRIVATE KEY-----` — Raw private key block

Even if it's an example, dummy, or expired key — write it as `<your-key-here>` or `process.env.X` instead. Real-shaped keys in code get scraped by bots within hours of being pushed.

If this is intentional (e.g., documenting a key format with a clearly-fake value): proceed, but **double-check the value is not real** before committing.

This is a heuristic — false positives happen. Proceed if you're confident.
