# Research: Rampante Complete Spec Kit Automation System

## Decisions

### MD File Generation Strategy for Spec Kit Commands

**Decision**: Template-based MD file generation with embedded execution logic

- **Core MD file**: Generated markdown file that contains both dry-run preview logic and actual execution commands
- **Dual-mode operation**: Same MD file supports --dry-run flag for previews and direct execution for automation
- **Spec Kit command simulation**: Template system that predicts /specify, /plan, /tasks outputs without execution
- **CLI-specific adaptation**: MD file adapts its execution style based on target AI CLI environment

**Rationale**: Single MD file approach simplifies distribution and maintenance while providing both core functionalities (FR-001 dry-run preview, FR-002 automated execution). Template-based simulation ensures consistent preview accuracy without requiring actual Spec Kit execution.

**Alternatives considered**:

- Separate preview and execution files: Rejected - increases complexity, maintenance burden
- Live command execution with rollback: Rejected - complex, potential side effects, slower performance
- AI-based content prediction: Rejected - unpredictable, requires external dependencies

### CLI-Specific Template Architecture

**Decision**: Multi-format template system with native CLI integration

- **Gemini CLI**: TOML format in `.gemini/commands/rampante.toml`
- **Codex**: Markdown format in `~/.codex/prompts/rampante.md`
- **Cursor**: MDC format in `.cursor/commands/rampante.mdc`
- **Claude Code**: JSON format in `.claude/commands/rampante.md`

**Rationale**: Each AI CLI has established conventions for slash command registration. Native formats ensure seamless integration, reduce complexity, and leverage existing CLI capabilities.

**Alternatives considered**:

- Universal config format: Rejected - would require CLI modifications
- JavaScript-based templates: Rejected - security concerns, execution complexity
- External service integration: Rejected - introduces network dependencies

### Release Workflow Architecture

**Decision**: GitHub Actions-based automated release pipeline triggered by PR merge to main

- Triggered by merge to main branch
- Generates CLI-specific packages in parallel
- Uploads to GitHub Releases with checksums
- Creates manifest file with package metadata
- Auto-increments version based on PR labels

**Rationale**: Leverages existing GitHub infrastructure, provides reliable hosting, supports parallel builds, integrates with existing development workflow, eliminates manual version tagging.

**Alternatives considered**:

- Manual git tag triggers: Rejected - additional manual step, less automation
- External CI/CD platform: Rejected - additional complexity, cost
- NPM/JSR-based distribution: Rejected - doesn't support CLI-specific packages

### Preview Generation Strategy for MD Files

**Decision**: Template-based simulation without execution

- Parse user prompt and generate expected command inputs
- Use static templates to show what each Spec Kit command would produce
- Generate MD content that shows both preview and execution paths
- Format output as structured markdown matching actual command output
- No file system modifications during preview

**Rationale**: Provides accurate previews without side effects, fast execution, predictable output format. MD files can contain both preview logic and execution logic in same structure.

**Alternatives considered**:

- Actual command execution with rollback: Rejected - complex, risk of side effects
- AI-based content generation: Rejected - unpredictable, requires external dependencies
- Mock command execution: Rejected - complex setup, maintenance burden

### Installation Distribution Strategy

**Decision**: Direct download from GitHub Releases with integrity verification

- Installer detects user's CLI environment
- Downloads appropriate package for detected CLI
- Verifies package integrity using checksums
- Extracts and installs MD files and templates to correct locations
- MD files become the executable slash commands

**Rationale**: Simple, reliable, leverages GitHub's CDN, supports offline operation after download. MD files serve as both documentation and executable commands.

**Alternatives considered**:

- Package manager distribution: Rejected - different package managers per CLI
- Self-hosted distribution: Rejected - infrastructure costs, maintenance overhead
- Peer-to-peer distribution: Rejected - complexity, reliability concerns

### Workflow Orchestration Design

**Decision**: Sequential execution with state tracking via MD file logic

- Execute /specify → capture output and file paths
- Execute /plan with spec file path → capture plan output
- Execute /tasks with plan file path → capture tasks output
- MD file contains the orchestration logic for both preview and execution
- Provide progress feedback and error recovery

**Rationale**: Mirrors manual workflow, preserves command dependencies, enables recovery from partial failures. MD files can contain conditional logic for both modes.

**Alternatives considered**:

- Parallel execution: Rejected - commands have dependencies
- Single mega-command: Rejected - loses granularity, harder to debug
- Event-driven orchestration: Rejected - unnecessary complexity for linear workflow

## Implementation Notes

- MD files will be the primary executable artifacts, containing both preview and execution logic
- Templates will be developed iteratively, starting with Gemini and Codex (known formats)
- Release workflow will include comprehensive testing of generated packages and MD files
- Installation process will include dry-run mode for preview before actual installation
- Documentation will include troubleshooting guides for common issues
- MD file structure will support both human readability and programmatic execution

## Open Questions (resolved)

All technical unknowns have been resolved through the above decisions, with particular focus on MD file generation as the core deliverable.

## References

- Gemini CLI command format documentation
- Codex prompt format specifications
- GitHub Actions workflow capabilities
- Spec Kit command interface specifications
- Deno standard library file operation APIs
- Markdown template processing patterns
