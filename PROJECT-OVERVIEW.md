# Project Overview – Rampant (Phase 1: Codex)

## Purpose

- Brief AI-facing guide to this project with links to specs and tasks.
- Optimized for quick ingestion and high‑signal execution context.

Project Snapshot

- Branch: 001-feature-phase-1
- Feature: Multi-CLI Rampante Slash Command (Phase 1: Codex)
- Primary CLI Target: Codex (Phase 2 priorities: Claude Code, Gemini)
- Installer Entry Command: `deno run npm:run-rampante install codex`
- Runtime Requirements: Deno v2.4+, network for context7 MCP

Key Artifacts (absolute paths)

- Spec: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/spec.md
- Plan: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/plan.md
- Research: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/research.md
- Data Model: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/data-model.md
- Contracts: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/contracts/
- Quickstart: /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/quickstart.md
- Tasks (start here): /Users/dubois/Source/repos/ai/rampantee/specs/001-feature-phase-1/tasks.md

---

## Execution Priorities (from plan)

1. Create `/rampantee/command/rampante.md` first to enable contract tests.
2. Create `/recommended-stacks` with `DEFINITIONS.md` + initial stack specs.
3. Implement the Deno installer CLI and wire config/registration/idempotency.

### AI Agent Instructions

- Read plan.md and tasks.md; execute tasks in order. Tests first (TDD).
- Use absolute paths as listed. Prefer creating files under the repository root.
- For stack selection: YOLO approach; deterministic tie‑break (order in DEFINITIONS.md).
- Context7: configure in `~/.codex/config.toml`; fail hard if unavailable.
- Idempotency: re‑runs add only missing files; `--force` flag recreates assets.
- Generate `specs/PROJECT-OVERVIEW.md` (this file) as the single source of orientation.

### Parallelization

- Tasks marked [P] can run together (different files, no dependency).
- Avoid concurrent writes to the same file.

---

## Environment & Assumptions

- Deno v2.4+ installed; network available for `npx @upstash/context7-mcp`.
- Home config path writable (simulate home in temp for tests when needed).

### Contact Points

- Feature Owner: 001-feature-phase-1
- Scope: Phase 1 limited to Codex; Phase 2 adds Claude Code and Gemini.

### Change Log Notes

- Keep commits small, one task per commit where possible (if using VCS).
