# Tasks: Rampante Complete Spec Kit Automation System

**Input**: Design documents from `/Users/dubois/Source/repos/ai/rampante/specs/001-feature-rampante-slash/`
**Prerequisites**: plan.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

## Execution Flow Summary

1. Load plan.md from feature directory ✅
   - Tech stack: Deno + TypeScript, Deno stdlib (@std/path, @std/fs, @std/flags)
   - Project type: single (integrated CLI system)
   - Structure: src/, tests/ at repository root
2. Load design documents ✅:
   - data-model.md: 7 entities (CLIConfiguration, SlashCommandTemplate, DistributionPackage, InstallationContext, WorkflowExecutionContext, PreviewResult, ReleaseManifest)
   - contracts/: 3 files (installer-cli, slash-command, release-workflow)
   - research.md: 6 key decisions resolved
   - quickstart.md: Integration test scenarios
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish ✅
4. Apply task rules: TDD order, parallel marking for different files ✅
5. Number tasks sequentially (T001-T042) ✅
6. Validate completeness: All contracts have tests, all entities have models ✅

## Phase 3.1: Setup

- [ ] T001 Create project structure with src/ and tests/ directories
- [ ] T002 Initialize Deno project with TypeScript configuration and import map
- [ ] T003 [P] Configure deno.json with linting, formatting, and test settings
- [ ] T004 [P] Create GitHub Actions workflow file .github/workflows/release.yml

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests

- [ ] T005 [P] Contract test installer CLI commands in tests/contract/test_installer_cli.ts
- [ ] T006 [P] Contract test slash command behavior in tests/contract/test_slash_command.ts
- [ ] T007 [P] Contract test release workflow API in tests/contract/test_release_workflow.ts

### Integration Tests

- [ ] T008 [P] Integration test CLI installation flow in tests/integration/test_cli_installation.ts
- [ ] T009 [P] Integration test workflow execution in tests/integration/test_workflow_execution.ts
- [ ] T010 [P] Integration test template generation in tests/integration/test_template_generation.ts
- [ ] T011 [P] Integration test package distribution in tests/integration/test_package_distribution.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Models (Data Entities)

- [ ] T012 [P] CLIConfiguration model in src/models/cli_configuration.ts
- [ ] T013 [P] SlashCommandTemplate model in src/models/slash_command_template.ts
- [ ] T014 [P] DistributionPackage model in src/models/distribution_package.ts
- [ ] T015 [P] InstallationContext model in src/models/installation_context.ts
- [ ] T016 [P] WorkflowExecutionContext model in src/models/workflow_execution_context.ts
- [ ] T017 [P] PreviewResult model in src/models/preview_result.ts
- [ ] T018 [P] ReleaseManifest model in src/models/release_manifest.ts

### Services (Business Logic)

- [ ] T019 CLI detection service in src/services/cli_detection_service.ts
- [ ] T020 Template generation service in src/services/template_service.ts
- [ ] T021 Package download service in src/services/download_service.ts
- [ ] T022 Installation service in src/services/installation_service.ts
- [ ] T023 Preview generation service in src/services/preview_service.ts
- [ ] T024 Workflow orchestration service in src/services/workflow_service.ts

### CLI Interface

- [ ] T025 [P] Main CLI entry point in src/cli/main.ts
- [ ] T026 [P] Install command handler in src/cli/commands/install.ts
- [ ] T027 [P] List command handler in src/cli/commands/list.ts
- [ ] T028 [P] Preview command handler in src/cli/commands/preview.ts
- [ ] T029 [P] Execute command handler in src/cli/commands/execute.ts

## Phase 3.4: Integration

- [ ] T030 File system operations with permission validation
- [ ] T031 GitHub API integration for release manifest and packages
- [ ] T032 Template processing with CLI-specific formatting
- [ ] T033 Error handling and structured logging throughout

## Phase 3.5: Polish

- [ ] T034 [P] Unit tests for validation logic in tests/unit/test_validation.ts
- [ ] T035 [P] Unit tests for template processing in tests/unit/test_templates.ts
- [ ] T036 Performance tests (<5s installation, <2s preview) in tests/performance/
- [ ] T037 [P] CLI templates for Gemini (.toml format) in templates/gemini/
- [ ] T038 [P] CLI templates for Codex (.md format) in templates/codex/
- [ ] T039 [P] CLI templates for Cursor (.yaml format) in templates/cursor/
- [ ] T040 [P] CLI templates for Claude Code (.json format) in templates/claude-code/
- [ ] T041 Manual testing with quickstart scenarios
- [ ] T042 Code review and refactoring for maintainability

## Dependencies

**Critical Path**:

- Setup (T001-T004) → Tests (T005-T011) → Models (T012-T018) → Services (T019-T024) → CLI (T025-T029) → Integration (T030-T033) → Polish (T034-T042)

**Blocking Relationships**:

- T002 blocks T003, T004 (need project structure)
- T012-T018 block T019-T024 (services need models)
- T019-T024 block T025-T029 (CLI needs services)
- T025-T029 block T030-T033 (integration needs CLI handlers)
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
```

### Group 3: Integration Tests

```
T008 [P] Integration test CLI installation
T009 [P] Integration test workflow execution
T010 [P] Integration test template generation
T011 [P] Integration test package distribution
```

### Group 4: Models

```
T012 [P] CLIConfiguration model
T013 [P] SlashCommandTemplate model
T014 [P] DistributionPackage model
T015 [P] InstallationContext model
T016 [P] WorkflowExecutionContext model
T017 [P] PreviewResult model
T018 [P] ReleaseManifest model
```

### Group 5: CLI Commands

```
T025 [P] Main CLI entry point
T026 [P] Install command handler
T027 [P] List command handler
T028 [P] Preview command handler
T029 [P] Execute command handler
```

### Group 6: Templates

```
T037 [P] Gemini CLI templates (.toml)
T038 [P] Codex CLI templates (.md)
T039 [P] Cursor CLI templates (.yaml)
T040 [P] Claude Code CLI templates (.json)
```

### Group 7: Polish

```
T034 [P] Unit tests for validation
T035 [P] Unit tests for templates
```

## Task Generation Validation ✅

**Contracts Coverage**:

- ✅ installer-cli-contract.md → T005 contract test
- ✅ slash-command-contract.md → T006 contract test
- ✅ release-workflow-contract.md → T007 contract test

**Data Model Coverage**:

- ✅ CLIConfiguration → T012 model
- ✅ SlashCommandTemplate → T013 model
- ✅ DistributionPackage → T014 model
- ✅ InstallationContext → T015 model
- ✅ WorkflowExecutionContext → T016 model
- ✅ PreviewResult → T017 model
- ✅ ReleaseManifest → T018 model

**User Stories Coverage**:

- ✅ Installation scenarios → T008 integration test
- ✅ Workflow automation → T009 integration test
- ✅ Preview generation → T010 integration test
- ✅ Package distribution → T011 integration test

**TDD Compliance**:

- ✅ All tests (T005-T011) come before implementation (T012+)
- ✅ Contract tests cover all endpoint behaviors
- ✅ Integration tests validate user workflows

**Parallel Task Validation**:

- ✅ All [P] tasks operate on different files
- ✅ No shared state between parallel tasks
- ✅ Dependencies properly block parallel execution

## Notes

- Tests MUST fail before writing implementation (RED-GREEN-Refactor)
- Commit after each completed task for clean git history
- Each [P] task can run simultaneously with others in same group
- Service layer tasks are sequential (T019-T024) due to shared dependencies
- Template tasks (T037-T040) generate CLI-specific configurations
- Performance requirements: <5s installation, <2s preview, <1s template generation

## Success Criteria

Final implementation provides:

1. `deno run -A jsr:@page-carbajal/rampante install gemini` functionality
2. `/rampante --dry-run "feature"` slash command in AI CLIs
3. Automated GitHub release workflow with CLI-specific packages
4. Preview generation without side effects
5. Complete Spec Kit workflow automation (/specify → /plan → /tasks)
