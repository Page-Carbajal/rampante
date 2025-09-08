# MD File Generation Contract: Rampante Executable Markdown

## Overview

This contract defines the structure and behavior of generated markdown files that serve as executable slash commands in AI CLI environments, supporting both dry-run preview and full workflow execution modes.

## MD File Structure

### File Format

```markdown
# /rampante - Spec Kit Automation

## Usage

/rampante [--dry-run] "<feature description>"

## Preview Mode (--dry-run)

[PREVIEW_LOGIC_SECTION]

- Shows what /specify, /plan, /tasks would generate
- No file system modifications
- Structured output format

## Execution Mode

[EXECUTION_LOGIC_SECTION]

- Runs complete Spec Kit workflow
- Creates actual files
- Progress reporting

## Spec Kit Command Mappings

### /specify Simulation

[SPECIFY_LOGIC]

### /plan Simulation

[PLAN_LOGIC]

### /tasks Simulation

[TASKS_LOGIC]
```

## Dual-Mode Operation

### Preview Mode (`--dry-run`)

**Input**: User prompt + --dry-run flag
**Processing**:

1. Parse user input for feature requirements
2. Generate simulated /specify output structure
3. Predict /plan file structure and content outline
4. Estimate /tasks count and types
5. Format as structured markdown preview

**Output Format**:

```markdown
# DRY RUN: /rampante

## Summary

- Input: "{user prompt}"
- Commands: [/specify, /plan, /tasks]
- Estimated Duration: ~X-Y minutes
- Files to Generate: N-M files

## /specify Command Preview

Expected Output: Feature specification with requirements, user stories
File: specs/XXX-feature-name/spec.md

## /plan Command Preview

Expected Output: Implementation plan with architecture, phases
Files: specs/XXX-feature-name/plan.md, research.md, data-model.md, contracts/

## /tasks Command Preview

Expected Output: Task breakdown with dependencies
File: specs/XXX-feature-name/tasks.md

## Estimated File Structure

specs/XXX-feature-name/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
└── contracts/
```

### Execution Mode (no flags)

**Input**: User prompt
**Processing**:

1. Validate Spec Kit installation in current directory
2. Execute /specify with user prompt → capture spec file path
3. Execute /plan with spec file → capture generated files
4. Execute /tasks with plan file → generate task breakdown
5. Report completion and file locations

**Output Format**:

```markdown
🚀 Starting Rampante workflow for: "{user prompt}"

📋 Phase 1: Specification Generation
└─ Executing /specify...
└─ ✅ Generated: specs/XXX-feature-name/spec.md (X.Xs)

🔧 Phase 2: Implementation Planning
└─ Executing /plan...
└─ ✅ Generated: specs/XXX-feature-name/plan.md (X.Xs)
└─ ✅ Generated: specs/XXX-feature-name/research.md
└─ ✅ Generated: specs/XXX-feature-name/data-model.md

📝 Phase 3: Task Breakdown
└─ Executing /tasks...
└─ ✅ Generated: specs/XXX-feature-name/tasks.md (X.Xs)

🎉 Workflow completed successfully! (X.Xs total)

📂 Generated Files:
├── specs/XXX-feature-name/spec.md
├── specs/XXX-feature-name/plan.md
├── specs/XXX-feature-name/tasks.md
└── specs/XXX-feature-name/[other files]

🚀 Next Steps:

1.  Review specification: specs/XXX-feature-name/spec.md
2.  Execute tasks: Follow specs/XXX-feature-name/tasks.md
```

## CLI-Specific Adaptations

### Gemini CLI Integration

```toml
[command.rampante]
description = "Spec Kit workflow automation with preview"
file = "rampante.md"
execution_mode = "markdown_processor"
```

### Codex Integration

```markdown
# /rampante

Execute the markdown file logic with appropriate environment context
Support for --dry-run flag detection
```

### Cursor Integration

```yaml
commands:
  rampante:
    description: "Spec Kit automation"
    file: "rampante.md"
    supports_flags: ["--dry-run"]
```

### Claude Code Integration

```json
{
  "commands": {
    "rampante": {
      "description": "Spec Kit workflow automation",
      "file": "rampante.md",
      "modes": ["preview", "execute"]
    }
  }
}
```

## Error Handling

### Missing Spec Kit

```markdown
❌ Error: Spec Kit not detected in current directory

Required files missing:

- scripts/
- templates/
- memory/

Install Spec Kit:
uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>
```

### Invalid Arguments

```markdown
❌ Error: Invalid usage

Usage: /rampante [--dry-run] "<feature description>"

Examples:
/rampante --dry-run "Add user authentication"
/rampante "Build REST API with CRUD operations"
```

### Command Execution Failures

```markdown
❌ Error: /specify command failed

Details: [specific error message]

Recovery options:

1. Check feature description clarity
2. Verify Spec Kit installation
3. Try manual /specify execution
```

## Validation Requirements

### Content Validation

- MD file must be valid markdown syntax
- All template sections must be populated
- Preview logic must not modify file system
- Execution logic must handle all error cases

### Functionality Validation

- Preview mode produces accurate simulations
- Execution mode successfully orchestrates Spec Kit commands
- Error handling provides actionable guidance
- CLI integration works in target environments

### Performance Requirements

- Preview generation: < 2 seconds
- Execution mode setup: < 5 seconds
- Total workflow time: depends on Spec Kit commands
- MD file parsing: < 100ms

## Security Considerations

### Safe Preview Mode

- No file system writes during preview
- No external network calls
- No execution of arbitrary commands
- Safe parsing of user input

### Controlled Execution

- Only execute known Spec Kit commands
- Validate all file paths and operations
- Proper error handling and cleanup
- No privilege escalation

## Testing Requirements

### Preview Mode Tests

- Verify no side effects during preview
- Validate output format consistency
- Test with various user input types
- Confirm simulation accuracy

### Execution Mode Tests

- Test complete workflow orchestration
- Verify file generation and paths
- Test error recovery scenarios
- Validate progress reporting

### CLI Integration Tests

- Test in each supported AI CLI environment
- Verify flag parsing and mode detection
- Test slash command registration
- Validate help text and documentation
