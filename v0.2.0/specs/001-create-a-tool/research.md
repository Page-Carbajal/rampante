# Research: Rampante CLI-Agnostic Installer

## Decisions

### CLI-Specific Format Requirements (resolving FR-010)

**Decision**: Support four distinct template formats for different AI CLIs

- **Gemini**: TOML format in `.gemini/commands/rampante.toml`
- **Codex**: Markdown format in `~/.codex/prompts/rampante.md`
- **Cursor**: YAML format in `.cursor/commands/rampante.yaml` (assumed)
- **Claude Code**: JSON format in `.claude/commands/rampante.md` (assumed)

**Rationale**: Each AI CLI has established conventions for slash command registration. Supporting native formats ensures seamless integration and reduces adoption friction.

**Alternatives considered**:

- Single universal format: Rejected - would require CLI modifications
- XML-based config: Rejected - not commonly used in modern CLIs
- JavaScript modules: Rejected - security concerns, not all CLIs support

### Template Distribution Strategy

**Decision**: Use embedded templates with JSR distribution

- Templates stored in `/templates/cli-configs/` directory
- Each CLI gets dedicated subdirectory with config files
- Templates contain parameterized logic (dry-run detection, Spec Kit integration)
- JSR distribution includes all templates in single package

**Rationale**: Self-contained distribution ensures reliability, no external dependencies, works offline after initial download.

**Alternatives considered**:

- Remote template repository: Rejected - network dependency
- Git submodules: Rejected - too complex for users
- Package registry separate from code: Rejected - maintenance overhead

### Spec Kit Integration Approach

**Decision**: Templates call Spec Kit slash commands directly via AI CLI context

- Dry-run mode: Generate preview prompts for `/specify`, `/plan`, `/tasks`
- Normal mode: Execute slash commands sequentially within LLM context
- Each template contains logic specific to its AI CLI's command execution model

**Rationale**: Leverages existing Spec Kit functionality without modifications, works within LLM context with access to other slash commands and MCPs.

**Alternatives considered**:

- Fork/modify Spec Kit: Rejected - maintenance burden, breaks compatibility
- External process calls: Rejected - loses LLM context, no access to other slash commands
- API integration: Rejected - Spec Kit doesn't expose APIs

### Cross-Platform File System Handling

**Decision**: Use Deno standard library path utilities with platform detection

- `@std/path` for cross-platform path handling
- `@std/fs` for file operations with proper error handling
- Home directory detection via environment variables (HOME on Unix, USERPROFILE on Windows)
- CLI config directory detection with fallback patterns

**Rationale**: Deno std lib provides robust cross-platform file operations, handles edge cases, well-tested.

**Alternatives considered**:

- Node.js `path` module: Rejected - not available in Deno
- Manual path construction: Rejected - error-prone, platform issues
- Third-party path library: Rejected - adds dependency, against constraints

### Template Logic Implementation

**Decision**: Embed logic directly in template files using CLI-native syntax

- TOML templates: Use string interpolation and conditional sections
- Markdown templates: Use templated prose with conditional blocks
- YAML/JSON templates: Use conditional structures with parameterization
- Logic includes: dry-run flag detection, Spec Kit directory validation, command orchestration

**Rationale**: Keeps templates self-contained, reduces complexity, each CLI handles execution natively.

**Alternatives considered**:

- External template engine: Rejected - adds complexity, runtime dependency
- Shared logic library: Rejected - would require each CLI to support our runtime
- Dynamic template generation: Rejected - harder to debug, maintain

### Error Handling Strategy

**Decision**: Comprehensive error handling with user-friendly messages

- CLI detection failures: Clear guidance on supported CLIs and installation paths
- Spec Kit validation: Specific messages about missing directories/files
- Template installation failures: Detailed file system error context
- Permission issues: Guidance on required permissions and workarounds

**Rationale**: CLI tools need robust error handling for good user experience, debugging.

**Alternatives considered**:

- Silent failures: Rejected - poor user experience
- Generic error messages: Rejected - hard to debug
- Stack trace dumps: Rejected - overwhelming for users

## Open Questions (resolved)

All technical unknowns have been resolved through the above decisions.

## Implementation Notes

- Templates will be developed iteratively, starting with Gemini and Codex (known formats)
- Cursor and Claude Code formats will be researched during implementation
- Template validation will be included to catch format errors early
- Installation will include dry-run mode to preview changes before applying

## References

- Gemini CLI documentation for TOML command format
- Codex documentation for Markdown prompt format
- Deno standard library documentation for file operations
- Spec Kit specification for slash command interfaces
