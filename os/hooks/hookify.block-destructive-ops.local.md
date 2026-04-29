---
name: exmachina-block-destructive-ops
enabled: true
event: bash
action: block
pattern: (rm\s+-rf\s+/|rm\s+-rf\s+\$HOME|rm\s+-rf\s+~|dd\s+if=.*of=/dev/|mkfs\.|format\s+/[a-z]:|>\s*/dev/sd[a-z])
---

🛑 **Blocked: catastrophic command detected.**

Pattern matched a known data-loss vector:

- `rm -rf /` or `rm -rf $HOME` or `rm -rf ~` — wipes filesystem / user data
- `dd if=... of=/dev/...` — raw disk writes
- `mkfs.*` — filesystem reformat
- `format X:` — Windows drive format
- `> /dev/sdX` — redirect to raw block device

If you actually need this command:

1. **Confirm the target path is correct.** Re-read it three times.
2. **Confirm a backup exists.** Don't trust your assumption; verify.
3. Disable this rule temporarily via `/hookify:configure`
4. Run the command
5. Re-enable the rule immediately

This rule blocks rather than warns because the cost of a misfire is non-recoverable. The friction of disabling and re-enabling is the point.
