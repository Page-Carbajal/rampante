# Quickstart: Simplified Orchestrator (No Stack Selection)

This guide outlines how to apply and verify the simplified slash command that removes stack selection.

## Steps

1. Confirm feature branch
   - Current branch should be `feature/002-feature-simplify-rampant`.

2. Backup existing orchestrator file
   - Copy `rampante/command/rampante.md` → `rampante/command/rampante.<epoch>.md` (UTC seconds). If a file with that name exists, append `-1`, `-2`, ... until free.

3. Generate new orchestrator definition
   - Create a new `rampante/command/rampante.md` that:
     - Does NOT reference `scripts/select-stack.sh`.
     - Excludes stack-dependent phases.
     - Retains planning-focused phases: Specification → Plan → Tasks (delegated) → Project Overview.

4. Verify contract
   - Ensure a timestamped backup exists (when original existed).
   - Verify the updated file contains no `select-stack.sh` reference.
   - Verify only the simplified phases are present.

5. Run planning commands (if desired)
   - `scripts/setup-plan.sh --json` → ensure it succeeds on this branch and that `plan.md` is present.

## Rollback

- To restore a backup, copy `rampante/command/rampante.<epoch>[ -N].md` over `rampante/command/rampante.md` and re-run the necessary steps.
