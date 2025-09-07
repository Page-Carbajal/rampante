# Project Overview Template

Purpose
- Use this template to generate a concise AI-facing overview for any feature.
- Replace placeholders exactly as indicated.

Project Snapshot
- Branch: [FEATURE_BRANCH]
- Feature: [FEATURE_NAME]
- Primary CLI Target: [PRIMARY_CLI]
- Installer Entry Command: [ENTRY_COMMAND]
- Runtime Requirements: [RUNTIME_REQUIREMENTS]

Key Artifacts (absolute paths)
- Spec: [SPEC_PATH]
- Plan: [PLAN_PATH]
- Research: [RESEARCH_PATH]
- Data Model: [DATA_MODEL_PATH]
- Contracts: [CONTRACTS_DIR]
- Quickstart: [QUICKSTART_PATH]
- Tasks (start here): [TASKS_PATH]

Execution Priorities
1) Create `/rampant-command/rampant.md` first (enable contract tests).
2) Create `/recommended-stacks` with `DEFINITIONS.md` + initial stack specs.
3) Implement the Deno installer CLI and wire config/registration/idempotency.

AI Agent Instructions
- Read plan.md and tasks.md; execute tasks in order (TDD: tests before implementation).
- Use absolute paths; prefer repository-root file locations.
- Stack selection: YOLO, deterministic tie-break by order in `DEFINITIONS.md`.
- Context7: configure in `~/.codex/config.toml`; fail hard if unavailable.
- Idempotency: re-run adds missing; `--force` recreates assets.

Parallelization
- [P] tasks can run concurrently when operating on different files.
- Avoid concurrent writes to the same file.

Environment & Assumptions
- [ENV_ASSUMPTIONS] (e.g., Deno v2.4+, network for `npx @upstash/context7-mcp`).

Contact Points
- Feature Owner: [FEATURE_BRANCH]
- Scope: [SCOPE_NOTES]

Filling Instructions
- Replace every placeholder [LIKE_THIS] with concrete values.
- Keep sections and heading order intact for consistency across features.
- Ensure all listed paths are absolute from the repository root.
