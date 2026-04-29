---
name: exmachina-block-secrets-edit
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env(\.|$)|\.key$|\.pem$|credentials\..*|service-account.*\.json$|secrets?/.*\.json$
---

🛑 **Blocked: edit to a likely-secrets file.**

Path matches a known secret pattern: `.env*`, `*.key`, `*.pem`, `credentials*`, `service-account*.json`, `secrets/*.json`.

Secrets in git are catastrophically non-reversible. If you genuinely need to edit this file:

1. Confirm the file is in `.gitignore`
2. Confirm no example/sample is checked in with real values
3. Disable this rule temporarily (`/hookify:configure`) for the single edit
4. Re-enable immediately after

If you're hardcoding a secret into code: stop. Use environment variables, a secret manager, or a `.env.example` template instead.
