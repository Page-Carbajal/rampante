# Contract: Rampante Orchestrator Slash Command (Simplified)

## Purpose
Define expected behavior for the orchestrator command after removing stack selection.

## Inputs
- Argument string: the main user prompt to drive the workflow.

## Preconditions
- Repository contains `/scripts` directory.
- Repository contains `/rampante/command/rampante.md` prior to update (or a new file will be created).

## Behavior
- Creates a timestamped backup of the existing `rampante/command/rampante.md` as `rampante/command/rampante.<epoch>.md` (or `-N` suffix on collision) before modification.
- Writes a new orchestrator definition that does NOT call `scripts/select-stack.sh` and excludes stack-dependent phases.
- The orchestrator’s phases focus on:
  1) Specification Generation
  2) Implementation Planning
  3) Task Generation (delegated to /tasks)
  4) Project Overview Generation

## Outputs
- Updated `rampante/command/rampante.md` with simplified phases and no stack selection references.
- Timestamped backup file alongside the updated file.

## Error Cases
- If backup cannot be created → ERROR and do not modify the original file.
- If original file missing → Create fresh simplified file; log notice that no backup was created.
- Any reference to `scripts/select-stack.sh` in new definition → CONTRACT VIOLATION.

## Verification Steps
- Assert backup file exists when original existed prior to update.
- Assert the updated command file contains no references to `select-stack.sh`.
- Assert the updated command file contains the simplified phases only.
