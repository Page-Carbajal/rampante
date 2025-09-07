# Research and Decisions: Simplify slash command by removing stack selection

## Context

The current orchestrator at `rampante/command/rampante.md` includes a “Phase 1: Stack Selection and Validation” which executes `scripts/select-stack.sh` and subsequent phases (2–3) that depend on the selected stack.
This feature removes the stack-selection dependency and simplifies the command’s phases, while preserving the existing file via a Unix timestamped backup.

## Decisions

1. Remove stack selection and any references to `scripts/select-stack.sh`.
2. Simplify phases by removing stack-dependent phases and keeping planning-focused phases:
   - Remove: Phase 1 (Stack Selection and Validation), Phase 2 (Documentation Context Loading), Phase 3 (Live Documentation Retrieval).
   - Keep and adapt: Phase 4 (Specification Generation), Phase 5 (Implementation Planning), Phase 6 (Task Generation), Phase 7 (Project Overview Generation).
   - Update wording to avoid references to stacks/technologies and context7.
3. Backup strategy for the current command file:
   - Location: Same directory as the source file.
   - Name format: `rampante/command/rampante.<epoch>.md` (UTC epoch seconds).
   - Collision handling: If a timestamped name already exists, append a short suffix `-1`, `-2`, ... until free.
4. Rollback procedure:
   - To restore, copy the desired backup over `rampante/command/rampante.md` and re-run affected steps if needed.
5. CI/Unattended behavior:
   - No interactive prompts are introduced. The orchestrator runs deterministically with simplified phases.
6. Testing approach:
   - Add contract-level checks for: backup file creation, absence of stack selection, and presence of simplified phases.
   - Add integration checks for: invoking the command flow post-change completes without stack selection errors.

## Rationale

- Eliminating stack selection reduces cognitive load and removes a brittle dependency on stack definitions and external documentation retrieval.
- Timestamped backups provide safety and easy rollback without additional infrastructure.

## Alternatives Considered

- Keeping stack selection as an optional path (rejected: adds branching complexity; goal is simplification).
- Moving backups to an archive subfolder (rejected: complicates discovery; co-locating backups is simpler and sufficient).

## Open Questions (Resolved in this plan)

- Which phases remain? → Keep 4–7; remove 1–3; adjust wording.
- Backup naming/placement? → `rampante/command/rampante.<epoch>.md` in same directory, with `-N` suffix on collision.
- Rollback guidance? → Documented above.
- CI behavior? → Deterministic, non-interactive; no stack selection invoked.

**Outcome**: All prior [NEEDS CLARIFICATION] items are resolved; proceed to design.
