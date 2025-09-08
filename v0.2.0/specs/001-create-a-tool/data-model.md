# Data Model: Rampante CLI-Agnostic Installer

## Entities

### CLIConfig

- **Description**: Represents a target AI CLI and its configuration requirements
- **Fields**:
  - name: string (e.g., "gemini", "codex", "cursor", "claude-code")
  - displayName: string (e.g., "Gemini CLI", "Codex")
  - configPath: string (path pattern, e.g., ".gemini/commands/")
  - configFile: string (filename pattern, e.g., "rampante.toml")
  - format: string (template format: "toml", "md", "yaml", "json")
  - homeRelative: boolean (true for ~/.codex, false for ./.gemini)
- **Validation Rules**:
  - name must be unique and lowercase
  - configPath must be valid directory pattern
  - format must be supported template type

### InstallationContext

- **Description**: Runtime context for installation operation
- **Fields**:
  - targetCLI: CLIConfig
  - targetPath: string (resolved absolute path)
  - templateContent: string (processed template content)
  - dryRun: boolean (preview mode flag)
  - timestamp: string (ISO-8601)
- **Validation Rules**:
  - targetPath must be writable (if not dry run)
  - templateContent must be valid for target format

### TemplateDefinition

- **Description**: Template for generating CLI-specific slash command configs
- **Fields**:
  - cliName: string (matches CLIConfig.name)
  - templatePath: string (path to template file)
  - parameters: Record<string, string> (template variables)
  - requiredPermissions: string[] (file system permissions needed)
- **Validation Rules**:
  - templatePath must exist in embedded templates
  - parameters must include all required template variables

### InstallationResult

- **Description**: Outcome of installation operation
- **Fields**:
  - success: boolean
  - cliName: string
  - installedPath: string (where config was installed)
  - message: string (success/error message)
  - dryRunPreview?: string (preview content if dry run)
  - errors: string[] (any warnings or issues)

## Relationships

- CLIConfig 1 — 1 TemplateDefinition (each CLI has one template)
- InstallationContext N — 1 CLIConfig (multiple installs per CLI)
- InstallationContext 1 — 1 InstallationResult (each install has one result)

## State Transitions

### Installation Process

1. **Discovery**: Detect available CLIs and validate configuration paths
2. **Template Loading**: Load and process template for target CLI
3. **Validation**: Verify permissions and target directory accessibility
4. **Installation**: Write config file (or preview if dry run)
5. **Verification**: Confirm successful installation

### Error States

- **CLI Not Found**: Target CLI not detected in system
- **Permission Denied**: Cannot write to target directory
- **Template Error**: Template processing failed
- **Validation Failed**: Generated config invalid for target CLI

## Data Persistence

**Note**: This tool primarily operates on file system state, not persistent data storage.

- **Runtime only**: InstallationContext, InstallationResult
- **Embedded**: CLIConfig definitions, TemplateDefinitions
- **File system**: Generated CLI configuration files

## Validation Rules Summary

1. **CLI Detection**: Must validate CLI presence before installation
2. **Path Resolution**: All paths must be absolute and accessible
3. **Template Integrity**: Templates must generate valid CLI configs
4. **Permission Checking**: Must verify write permissions before file operations
5. **Format Validation**: Generated configs must match target CLI expectations
