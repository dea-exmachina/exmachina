#!/usr/bin/env bash
# install.sh — exmachina top-level installer.
# Chains the phase scripts. Each phase is independent; you can run them directly.

set -euo pipefail

EXMACHINA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat <<'EOF'

  ███████╗██╗  ██╗███╗   ███╗ █████╗  ██████╗██╗  ██╗██╗███╗   ██╗ █████╗
  ██╔════╝╚██╗██╔╝████╗ ████║██╔══██╗██╔════╝██║  ██║██║████╗  ██║██╔══██╗
  █████╗   ╚███╔╝ ██╔████╔██║███████║██║     ███████║██║██╔██╗ ██║███████║
  ██╔══╝   ██╔██╗ ██║╚██╔╝██║██╔══██║██║     ██╔══██║██║██║╚██╗██║██╔══██║
  ███████╗██╔╝ ██╗██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║██║██║ ╚████║██║  ██║
  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝

  An operating system for human + AI collaboration.

EOF

# Phase 1 — Identity. Always runs.
bash "$EXMACHINA_DIR/installer/phase1-identity.sh" "$@"

# Phase 2 — Workspace database. Optional; runs only if user opts in.
# Phase 2 is independent and can be re-run alone via:
#   bash installer/phase2-supabase.sh
echo ""
echo "  Phase 1 complete."
echo ""
echo "  Phase 2 provisions the workspace database (Supabase): per-tenant project,"
echo "  migrations, types, vault-scope MCP. Skip if you don't have a Supabase"
echo "  project yet — you can run it later with: installer/phase2-supabase.sh"
echo ""

read -r -p "  Run Phase 2 now? [y/N]: " RUN_PHASE2
case "${RUN_PHASE2:-n}" in
  y|Y|yes|YES)
    bash "$EXMACHINA_DIR/installer/phase2-supabase.sh"
    ;;
  *)
    echo ""
    echo "  Skipped Phase 2. Run later with:"
    echo "    bash $EXMACHINA_DIR/installer/phase2-supabase.sh"
    ;;
esac

echo ""
echo "  Phase 3 (Control Center deploy) ships in v0.2.2."
echo ""
