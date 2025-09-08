# Tasks: Rampante Complete Spec Kit Automation System

**Input**: Design documents from `/Users/dubois/Source/repos/ai/rampante/specs/001-feature-rampante-slash/`
**Prerequisites**: plan.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

## Execution Flow Summary

1. Load plan.md from feature directory ✅
   - Tech stack: Deno + TypeScript, Deno stdlib (@std/path, @std/fs, @std/flags)
   - Project type: single (integrated CLI system with MD file generation focus)
   - Structure: src/, tests/ at repository root
2. Load design documents ✅:
   - data-model.md: 8 entities (CLIConfiguration, SlashCommandTemplate, DistributionPackage, InstallationContext, WorkflowExecutionContext, PreviewResult, ExecutableMDFile, ReleaseManifest)
   - contracts/: 4 files (installer-cli, slash-command, release-workflow, md-file-generation)
   - research.md: 6 key decisions resolved with MD file generation focus
   - quickstart.md: Integration test scenarios
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish ✅
4. Apply task rules: TDD order, parallel marking for different files, MD file generation priority ✅
5. Number tasks sequentially (T001-T045) ✅
6. Validate completeness: All contracts have tests, all entities have models, MD file generation fully covered ✅

## Phase 3.1: Setup

- [ ] T001 Create project structure with src/ and tests/ directories
- [ ] T002 Initialize Deno project with TypeScript configuration and import map in deno.json
- [ ] T003 [P] Configure deno.json with linting, formatting, and test settings
- [ ] T004 [P] Create GitHub Actions workflow file .github/workflows/release.yml

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests

- [ ] T005 [P] Contract test installer CLI commands in tests/contract/test_installer_cli.ts
- [ ] T006 [P] Contract test slash command behavior in tests/contract/test_slash_command.ts
- [ ] T007 [P] Contract test release workflow API in tests/contract/test_release_workflow.ts
- [ ] T008 [P] Contract test MD file generation behavior in tests/contract/test_md_file_generation.ts

### Integration Tests

- [ ] T009 [P] Integration test CLI installation flow in tests/integration/test_cli_installation.ts
- [ ] T010 [P] Integration test workflow execution in tests/integration/test_workflow_execution.ts
- [ ] T011 [P] Integration test MD file generation and dual-mode operation in tests/integration/test_md_file_dual_mode.ts
- [ ] T012 [P] Integration test template generation in tests/integration/test_template_generation.ts
- [ ] T013 [P] Integration test package distribution in tests/integration/test_package_distribution.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Models (Data Entities)

- [ ] T014 [P] CLIConfiguration model in src/models/cli_configuration.ts
- [ ] T015 [P] SlashCommandTemplate model in src/models/slash_command_template.ts
- [ ] T016 [P] DistributionPackage model in src/models/distribution_package.ts
- [ ] T017 [P] InstallationContext model in src/models/installation_context.ts
- [ ] T018 [P] WorkflowExecutionContext model in src/models/workflow_execution_context.ts
- [ ] T019 [P] PreviewResult model in src/models/preview_result.ts
- [ ] T020 [P] ExecutableMDFile model in src/models/executable_md_file.ts
- [ ] T021 [P] ReleaseManifest model in src/models/release_manifest.ts

### Services (Business Logic) - MD File Generation Priority

- [ ] T022 MD file generation service in src/services/md_file_service.ts
- [ ] T023 Template processing service in src/services/template_service.ts
- [ ] T024 CLI detection service in src/services/cli_detection_service.ts
- [ ] T025 Preview generation service in src/services/preview_service.ts
- [ ] T026 Package download service in src/services/download_service.ts
- [ ] T027 Installation service in src/services/installation_service.ts
- [ ] T028 Workflow orchestration service in src/services/workflow_service.ts

### CLI Interface

- [ ] T029 [P] Main CLI entry point in src/cli/main.ts
- [ ] T030 [P] Install command handler in src/cli/commands/install.ts
- [ ] T031 [P] List command handler in src/cli/commands/list.ts
- [ ] T032 [P] Preview command handler in src/cli/commands/preview.ts
- [ ] T033 [P] Execute command handler in src/cli/commands/execute.ts

## Phase 3.4: Integration

- [ ] T034 File system operations with permission validation
- [ ] T035 GitHub API integration for release manifest and packages
- [ ] T036 MD file template processing with CLI-specific formatting
- [ ] T037 Error handling and structured logging throughout
- [ ] T038 Dual-mode MD file execution logic (preview vs. execution)

## Phase 3.5: Polish

- [ ] T039 [P] Unit tests for MD file validation logic in tests/unit/test_md_validation.ts
- [ ] T040 [P] Unit tests for template processing in tests/unit/test_templates.ts
- [ ] T041 Performance tests (<5s installation, <2s preview, <1s MD generation) in tests/performance/
- [ ] T042 [P] CLI templates for Gemini (.toml format) in templates/gemini/
- [ ] T043 [P] CLI templates for Codex (.md format) in templates/codex/
- [ ] T044 [P] CLI templates for Cursor (.mdc format) in templates/cursor/
- [ ] T045 [P] CLI templates for Claude Code (.json format) in templates/claude-code/
- [ ] T046 Manual testing with quickstart scenarios including MD file generation
- [ ] T047 Code review and refactoring for maintainability

## Dependencies

**Critical Path**:

- Setup (T001-T004) → Tests (T005-T013) → Models (T014-T021) → Services (T022-T028) → CLI (T029-T033) → Integration (T034-T038) → Polish (T039-T047)

**Blocking Relationships**:

- T002 blocks T003, T004 (need project structure)
- T014-T021 block T022-T028 (services need models)
- T020 (ExecutableMDFile) blocks T022 (MD file service) - critical path
- T022-T028 block T029-T033 (CLI needs services)
- T022 (MD file service) blocks T036 (MD file processing)
- T029-T033 block T034-T038 (integration needs CLI handlers)
- All core implementation blocks polish tasks

## Parallel Execution Groups

### Group 1: Setup Phase

```
T003 [P] Configure deno.json
T004 [P] Create GitHub Actions workflow
```

### Group 2: Contract Tests

```
T005 [P] Contract test installer CLI
T006 [P] Contract test slash command
T007 [P] Contract test release workflow
T008 [P] Contract test MD file generation
```

### Group 3: Integration Tests

```
T009 [P] Integration test CLI installation
T010 [P] Integration test workflow execution
T011 [P] Integration test MD file dual-mode operation
T012 [P] Integration test template generation
T013 [P] Integration test package distribution
```

### Group 4: Models

```
T014 [P] CLIConfiguration model
T015 [P] SlashCommandTemplate model
T016 [P] DistributionPackage model
T017 [P] InstallationContext model
T018 [P] WorkflowExecutionContext model
T019 [P] PreviewResult model
T020 [P] ExecutableMDFile model
T021 [P] ReleaseManifest model
```

### Group 5: CLI Commands

```
T029 [P] Main CLI entry point
T030 [P] Install command handler
T031 [P] List command handler
T032 [P] Preview command handler
T033 [P] Execute command handler
```

### Group 6: Templates

```
T042 [P] Gemini CLI templates (.toml)
T043 [P] Codex CLI templates (.md)
T044 [P] Cursor CLI templates (.mdc)
T045 [P] Claude Code CLI templates (.json)
```

### Group 7: Polish

```
T039 [P] Unit tests for MD file validation
T040 [P] Unit tests for templates
```

## Task Generation Validation ✅

**Contracts Coverage**:

- ✅ installer-cli-contract.md → T005 contract test
- ✅ slash-command-contract.md → T006 contract test
- ✅ release-workflow-contract.md → T007 contract test
- ✅ md-file-generation-contract.md → T008 contract test (NEW)

**Data Model Coverage**:

- ✅ CLIConfiguration → T014 model
- ✅ SlashCommandTemplate → T015 model
- ✅ DistributionPackage → T016 model
- ✅ InstallationContext → T017 model
- ✅ WorkflowExecutionContext → T018 model
- ✅ PreviewResult → T019 model
- ✅ ExecutableMDFile → T020 model (NEW - critical for MD file generation)
- ✅ ReleaseManifest → T021 model

**User Stories Coverage**:

- ✅ Installation scenarios → T009 integration test
- ✅ Workflow automation → T010 integration test
- ✅ MD file dual-mode operation → T011 integration test (NEW)
- ✅ Template generation → T012 integration test
- ✅ Package distribution → T013 integration test

**TDD Compliance**:

- ✅ All tests (T005-T013) come before implementation (T014+)
- ✅ Contract tests cover all endpoint behaviors including MD file generation
- ✅ Integration tests validate user workflows with MD file focus

**MD File Generation Priority**:

- ✅ T008: Contract test for MD file generation behavior
- ✅ T011: Integration test for dual-mode MD file operation
- ✅ T020: ExecutableMDFile model (critical entity)
- ✅ T022: MD file generation service (priority service)
- ✅ T036: MD file template processing integration
- ✅ T038: Dual-mode execution logic implementation

**Parallel Task Validation**:

- ✅ All [P] tasks operate on different files
- ✅ No shared state between parallel tasks
- ✅ Dependencies properly block parallel execution
- ✅ MD file generation tasks properly sequenced

## Notes

- Tests MUST fail before writing implementation (RED-GREEN-Refactor)
- Commit after each completed task for clean git history
- Each [P] task can run simultaneously with others in same group
- Service layer tasks are sequential (T022-T028) due to shared dependencies
- **MD file generation (T022) is critical path** - depends on ExecutableMDFile model (T020)
- Template tasks (T042-T045) generate CLI-specific configurations with MD file support
- Performance requirements: <5s installation, <2s preview, <1s MD generation, <1s template generation

## Success Criteria

Final implementation provides:

1. `deno run -A jsr:@page-carbajal/rampante install gemini` functionality
2. Generated MD files that support `/rampante --dry-run "feature"` slash command in AI CLIs
3. **Dual-mode MD file operation**: same file handles both preview and execution modes
4. Automated GitHub release workflow with CLI-specific packages containing MD files
5. **MD file generation with embedded Spec Kit logic** for /specify, /plan, /tasks commands
6. Preview generation without side effects via MD file template logic
7. Complete Spec Kit workflow automation (/specify → /plan → /tasks) orchestrated by MD file logic
