# Phase 0 Research – Multi-CLI Rampant (Phase 1: Codex)

Decision: Use Deno v2.4 to deliver `deno run npm:run-rampant install <cli>`
- Rationale: Cross-platform, simple distribution via npm specifier; Deno v2+ offers stable permissions and tooling.
- Alternatives: Node-only installer (adds dependency management overhead); Bash (portability, quoting/perm issues).

Decision: Configure context7 MCP via `~/.codex/config.toml` for Codex
- Rationale: Provided spec block is authoritative; ensures docs retrieval via MCP.
- Alternatives: Skip MCP or use cached docs (violates spec: fail hard when unavailable).

Decision: Install `/recommended-stacks` in current working directory
- Rationale: Matches user flow (cd into created folder, then install); keeps project-local assets.
- Alternatives: Home-directory install (pollutes user space; harder to version with project).

Decision: Install `/rampant-command/` in current working directory
- Rationale: The rampant command is contained in the repository

Decision: Register `/rampant` by copying `/rampant-command/rampant.md` to `~/.codex/prompts`
- Rationale: Codex CLI path defined in spec; simple registration mechanism.
- Alternatives: Dynamic command loader (out of scope; varies per CLI).

Decision: YOLO stack selection with deterministic tie-break
- Rationale: No prompting; ensure reproducible choice by score then definition order.
- Alternatives: Interactive selection (contradicts spec’s YOLO approach).

Decision: Overwrite policy and idempotency
- Rationale: Always overwrite `specs/PROJECT-OVERVIEW.md`; re-runs add missing assets; `--force` to reset.
- Alternatives: Prompt on conflicts (contradicts YOLO/no-prompt), keep both (adds clutter).

Unknowns resolved: None remaining for Phase 1 (Codex). Phase 2 will specify registration paths for Claude Code and Gemini.
