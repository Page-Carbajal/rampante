# Slash Command Contract: /rampante

## Command Signature

```
/rampante [--dry-run] <prompt>
```

## Behavior Modes

### Dry-Run Mode

**Trigger**: Command starts with `--dry-run` flag

**Input Examples**:

```
/rampante --dry-run "Build user authentication system"
/rampante --dry-run "Add payment processing to e-commerce app"
```

**Output Format** (Markdown):

````markdown
# DRY RUN: /rampante

## Summary

- Input: "Build user authentication system"
- Commands: [/specify, /plan, /tasks]
- Estimated Duration: ~3-5 minutes
- Files to Generate: 6-8 files

## /specify Command Preview

```text
Build user authentication system
```
````

**Expected Output**: Feature specification with requirements, user stories, and acceptance criteria

## /plan Command Preview

```text
/specs/004-auth-system/spec.md
```

**Expected Output**: Implementation plan with technical architecture, phases, and design decisions

## /tasks Command Preview

```text
/specs/004-auth-system/plan.md
```

**Expected Output**: Ordered task list with dependencies, test requirements, and implementation steps

## Estimated File Structure

```
specs/004-auth-system/
├── spec.md           # Feature specification
├── plan.md           # Implementation plan
├── tasks.md          # Task breakdown
├── research.md       # Technical decisions
├── data-model.md     # Entity definitions
├── quickstart.md     # Testing scenarios
└── contracts/        # API contracts
```

## Prerequisites Check

✅ Spec Kit detected in current directory
✅ Required commands available: /specify, /plan, /tasks
⚠️ No conflicts with existing features detected

```

### Execution Mode
**Trigger**: No `--dry-run` flag present

**Input Examples**:
```

/rampante "Build user authentication system"
/rampante "Implement real-time notifications"

```

**Execution Flow**:
1. **Validation Phase**
   - Verify Spec Kit installation
   - Check for existing feature conflicts
   - Validate user input

2. **Specification Phase**
   - Execute: `/specify "Build user authentication system"`
   - Monitor progress and capture output
   - Validate generated specification

3. **Planning Phase**
   - Execute: `/plan /specs/004-auth-system/spec.md`
   - Capture implementation plan
   - Validate design artifacts

4. **Task Generation Phase**
   - Execute: `/tasks /specs/004-auth-system/plan.md`
   - Generate task breakdown
   - Validate task dependencies

**Progress Output**:
```

🚀 Starting Rampante workflow for: "Build user authentication system"

📋 Phase 1: Specification Generation
└─ Executing /specify...
└─ ✅ Generated: /specs/004-auth-system/spec.md (2.3s)

🔧 Phase 2: Implementation Planning
└─ Executing /plan...
└─ ✅ Generated: /specs/004-auth-system/plan.md (1.8s)
└─ ✅ Generated: /specs/004-auth-system/research.md
└─ ✅ Generated: /specs/004-auth-system/data-model.md

📝 Phase 3: Task Breakdown
└─ Executing /tasks...
└─ ✅ Generated: /specs/004-auth-system/tasks.md (1.2s)

🎉 Workflow completed successfully! (5.3s total)

📂 Generated Files:
├── /specs/004-auth-system/spec.md
├── /specs/004-auth-system/plan.md
├── /specs/004-auth-system/tasks.md
├── /specs/004-auth-system/research.md
├── /specs/004-auth-system/data-model.md
├── /specs/004-auth-system/quickstart.md
└── /specs/004-auth-system/contracts/

🚀 Next Steps:

1.  Review specification: /specs/004-auth-system/spec.md
2.  Execute tasks: Follow /specs/004-auth-system/tasks.md
3.  Start implementation: Begin with contract tests

```

## Error Handling

### Invalid Flag Position
```

❌ ERROR: Invalid flag position

Invalid: /rampante "build app" --dry-run
Valid: /rampante --dry-run "build app"

The --dry-run flag must be the first argument.

```

### Missing Prerequisites
```

❌ ERROR: Spec Kit not found

Current directory missing required structure:
❌ /scripts/ directory
❌ /templates/ directory
❌ /memory/ directory

Install Spec Kit:
uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>

```

### Workflow Failures
```

❌ ERROR: /specify command failed

Original error: Feature description too vague - needs clarification

Suggestion: Provide more specific requirements:
Instead of: "build app"
Try: "build user authentication with login, signup, and password reset"

```

### Partial Execution Recovery
```

⚠️ WARNING: Workflow interrupted at /plan phase

Completed:
✅ /specs/004-auth-system/spec.md

To resume:
/plan /specs/004-auth-system/spec.md

To restart:
/rampante "Build user authentication system"

````

## CLI-Specific Implementation Notes

### Template Integration Requirements
Each AI CLI template must:
1. **Flag Detection**: Parse `--dry-run` as first argument
2. **Spec Kit Validation**: Check for required directories before execution
3. **Command Execution**: Call `/specify`, `/plan`, `/tasks` in sequence
4. **Error Handling**: Provide CLI-appropriate error formatting
5. **Progress Display**: Show execution progress in CLI's format
6. **Output Formatting**: Render markdown according to CLI capabilities

### Gemini CLI Template (TOML)
```toml
[command]
name = "rampante"
description = "Automate Spec Kit workflow with preview mode"

[execution]
dry_run_check = "startsWith(args[0], '--dry-run')"
spec_kit_validation = "exists('scripts/') && exists('templates/')"
error_format = "gemini_markdown"
````

### Codex Template (Markdown)

```markdown
# /rampante Command

Executes Spec Kit workflow automation with optional dry-run preview.

## Logic

- If first argument is "--dry-run": Generate preview
- Else: Execute full workflow
- Always validate Spec Kit installation first
```

### Error Recovery Patterns

- **Network failures**: Retry with exponential backoff
- **Permission errors**: Provide specific chmod commands
- **Partial failures**: Offer resume or restart options
- **Validation failures**: Show specific requirements not met
