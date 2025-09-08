# Data Model: Rampante Complete Spec Kit Automation System

## Entities

### CLIConfiguration

- **Description**: Defines configuration requirements and capabilities for a supported AI CLI
- **Fields**:
  - name: string (e.g., "gemini", "codex", "cursor", "claude-code")
  - displayName: string (e.g., "Gemini CLI", "Codex")
  - configPath: string (directory path pattern, e.g., ".gemini/commands/")
  - configFileName: string (e.g., "rampante.toml")
  - format: string ("toml", "md", "yaml", "json")
  - homeRelative: boolean (true for ~/.codex, false for ./.gemini)
  - detectionPaths: string[] (paths to check for CLI presence)
- **Validation Rules**:
  - name must be unique and lowercase
  - format must be supported template type
  - configPath must be valid directory pattern

### SlashCommandTemplate

- **Description**: CLI-specific template that defines /rampante slash command behavior with MD file generation
- **Fields**:
  - cliName: string (matches CLIConfiguration.name)
  - templateContent: string (processed template with CLI-specific syntax)
  - mdFileTemplate: string (template for generating executable MD files)
  - version: string (template version for compatibility)
  - metadata: TemplateMetadata (creation date, compatibility info)
  - dryRunLogic: string (MD file logic for preview mode)
  - executionLogic: string (MD file logic for workflow execution)
  - specKitCommandMappings: Map<string, string> (maps /specify, /plan, /tasks to MD logic)
- **Validation Rules**:
  - templateContent must be valid for target CLI format
  - mdFileTemplate must contain both preview and execution logic
  - version must follow semantic versioning
  - dryRunLogic and executionLogic must be non-empty
  - specKitCommandMappings must cover all three Spec Kit commands

### DistributionPackage

- **Description**: Versioned zip file containing CLI-specific templates and installation instructions
- **Fields**:
  - cliName: string
  - version: string (package version)
  - downloadUrl: string (GitHub release URL)
  - checksum: string (SHA256 hash)
  - size: number (file size in bytes)
  - contents: PackageContents (list of included files)
  - releaseNotes: string
- **Validation Rules**:
  - downloadUrl must be accessible
  - checksum must match actual file hash
  - contents must list all included files

### InstallationContext

- **Description**: Runtime information for installation or execution operations
- **Fields**:
  - targetCLI: CLIConfiguration
  - operation: string ("install", "uninstall", "dry-run", "execute")
  - targetPath: string (resolved installation path)
  - dryRun: boolean
  - timestamp: string (ISO-8601)
  - specKitDetected: boolean
  - specKitVersion: string?
- **Validation Rules**:
  - targetPath must be writable (if not dry-run)
  - specKitDetected must be true for execute operations

### WorkflowExecutionContext

- **Description**: Tracks state during automated Spec Kit workflow execution
- **Fields**:
  - requestId: string (unique execution identifier)
  - userPrompt: string (original user input)
  - currentStep: string ("specify", "plan", "tasks", "complete")
  - stepResults: ExecutionStep[] (results from each step)
  - errors: ExecutionError[] (any errors encountered)
  - outputFiles: string[] (generated file paths)
- **Validation Rules**:
  - userPrompt must be non-empty for execute operations
  - currentStep must be valid workflow step
  - stepResults must be ordered by execution sequence

### PreviewResult

- **Description**: Generated preview content for dry-run operations
- **Fields**:
  - specifyPreview: string (what /specify would generate)
  - planPreview: string (what /plan would generate)
  - tasksPreview: string (what /tasks would generate)
  - estimatedFiles: string[] (files that would be created)
  - warnings: string[] (potential issues or conflicts)
- **Validation Rules**:
  - at least one preview must be non-empty
  - estimatedFiles must be valid file paths

### ExecutableMDFile

- **Description**: Generated markdown file that serves as executable slash command with dual-mode operation
- **Fields**:
  - fileName: string (e.g., "rampante.md")
  - content: string (markdown content with embedded execution logic)
  - previewLogic: string (logic for dry-run mode)
  - executionLogic: string (logic for full workflow automation)
  - specKitMappings: Map<string, MDSection> (sections for /specify, /plan, /tasks)
  - cliAdaptations: Map<string, string> (CLI-specific execution variations)
  - metadata: MDFileMetadata (creation date, version, compatibility)
- **Validation Rules**:
  - content must be valid markdown
  - previewLogic must simulate Spec Kit commands without side effects
  - executionLogic must handle full workflow orchestration
  - specKitMappings must be complete and accurate
  - file must be executable in target CLI environments

### ReleaseManifest

- **Description**: Index of all available distribution packages
- **Fields**:
  - version: string (manifest version)
  - generatedAt: string (ISO-8601 timestamp)
  - packages: DistributionPackage[] (available packages)
  - latestVersion: string (latest rampante version)
  - compatibilityMatrix: CompatibilityInfo[] (version compatibility)
  - mdFileTemplates: ExecutableMDFile[] (available MD file variants)
- **Validation Rules**:
  - packages must contain at least one entry per supported CLI
  - latestVersion must match highest package version
  - mdFileTemplates must include variants for each CLI

## Relationships

- CLIConfiguration 1 — 1 SlashCommandTemplate (each CLI has one template)
- SlashCommandTemplate 1 — 1 ExecutableMDFile (each template generates one MD file)
- CLIConfiguration 1 — N DistributionPackage (multiple versions per CLI)
- DistributionPackage 1 — 1 ExecutableMDFile (each package contains one MD file)
- InstallationContext N — 1 CLIConfiguration (many installs per CLI)
- WorkflowExecutionContext 1 — 1 PreviewResult (each execution has preview)
- WorkflowExecutionContext 1 — 1 ExecutableMDFile (execution uses MD file logic)
- ReleaseManifest 1 — N DistributionPackage (manifest references packages)
- ReleaseManifest 1 — N ExecutableMDFile (manifest tracks MD file variants)

## State Transitions

### Installation Workflow

1. **Detection**: Identify available CLIs and validate environment
2. **Package Resolution**: Select appropriate package version
3. **Download**: Retrieve package and verify integrity
4. **Extraction**: Unpack templates and configuration files
5. **Installation**: Deploy to CLI-specific directories
6. **Verification**: Confirm successful installation

### Execution Workflow

1. **Initialization**: Validate Spec Kit presence and parse user input
2. **Preview Generation**: Generate dry-run output if requested
3. **Workflow Execution**: Execute /specify → /plan → /tasks sequence
4. **Progress Tracking**: Monitor each step and capture results
5. **Completion**: Report final results and generated files

### Release Workflow

1. **Trigger**: Version tag detected in repository
2. **Template Processing**: Generate CLI-specific templates
3. **Package Creation**: Create zip files for each CLI
4. **Validation**: Verify package integrity and contents
5. **Publication**: Upload to GitHub Releases with manifest update

## Data Persistence

**File System State**:

- CLI configuration files (installed templates)
- Distribution packages (downloaded zip files)
- Generated Spec Kit files (specs, plans, tasks)

**Runtime Only**:

- InstallationContext, WorkflowExecutionContext
- PreviewResult (generated dynamically)

**Remote State**:

- ReleaseManifest (GitHub Releases)
- DistributionPackage files (GitHub Assets)

## Validation Rules Summary

1. **CLI Compatibility**: All operations must validate CLI presence and compatibility
2. **Template Integrity**: Templates must generate valid configurations for target CLIs
3. **Version Consistency**: Package versions must be consistent across components
4. **Path Safety**: All file operations must validate paths and permissions
5. **Content Validation**: Generated content must pass format-specific validation
