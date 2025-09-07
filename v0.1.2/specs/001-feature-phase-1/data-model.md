# Data Model – Multi-CLI Rampant (Phase 1: Codex)

## Entities

- CLI Target
  - name: string (e.g., "codex")
  - registrationPath: string (e.g., `~/.codex/prompts`)
  - configPath: string (e.g., `~/.codex/config.toml`)
  - supported: boolean (Phase 1: only codex=true)

- Project Type (Derived)
  - name: string (e.g., SIMPLE_WEB_APP)
  - rationale: string (why it matched)

- Stack Definition
  - name: string (e.g., SIMPLE_WEB_APP)
  - definitionDoc: path (`/recommended-stacks/DEFINITIONS.md`)
  - specDoc: path (`/recommended-stacks/<NAME>.md`)

- Selected Stack
  - name: string
  - specDoc: path
  - selectionReason: string (deterministic selection detail)

- Documentation Source
  - provider: string ("context7")
  - command: string ("npx")
  - args: array (["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]) 
  - lastUpdated: datetime

- Install Assets
  - stacksDir: path (`/recommended-stacks`)
  - commandDir: path (`/rampant-command`)
  - overviewFile: path (`specs/PROJECT-OVERVIEW.md`)

## Relationships

- CLI Target 1—n Install Assets (per environment)
- Stack Definition 1—n Selected Stack (one chosen per run)
- Selected Stack 1—1 Documentation Source (latest docs snapshot)
