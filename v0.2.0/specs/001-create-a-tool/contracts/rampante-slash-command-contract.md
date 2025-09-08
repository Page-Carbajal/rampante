# Slash Command Contract: /rampante

## Command Signature

```
/rampante [--dry-run] <prompt>
```

## Behavior

### Dry-Run Mode

**Trigger**: Command starts with `--dry-run` flag

**Input**:

```
/rampante --dry-run "Add user authentication to the app"
```

**Output Format** (Markdown):

````markdown
# DRY RUN: /rampante

## Summary

- Commands: [/specify, /plan, /tasks]
- Input: "Add user authentication to the app"

## /specify

```text
Add user authentication to the app
```
````

## /plan

```text
/specs/[feature-name]/spec.md
```

## /tasks

```text
/specs/[feature-name]/plan.md
```

```

### Normal Mode
**Trigger**: No `--dry-run` flag

**Input**:
```

/rampante "Add user authentication to the app"

```

**Behavior**:
1. Execute `/specify "Add user authentication to the app"`
2. Wait for completion, capture spec file path
3. Execute `/plan /specs/[feature-name]/spec.md`
4. Wait for completion, capture plan file path
5. Execute `/tasks /specs/[feature-name]/plan.md`
6. Return completion summary

**Output Example**:
```

✅ Spec Kit workflow completed

Generated files:

- /specs/002-user-auth/spec.md
- /specs/002-user-auth/plan.md
- /specs/002-user-auth/tasks.md

Next: Execute tasks or review generated files

```

## Prerequisites
- Must be run in directory with Spec Kit installed
- Requires access to `/specify`, `/plan`, `/tasks` slash commands

## Error Handling

### Spec Kit Not Detected
```

❌ ERROR: Spec Kit not found in current directory

Required: /scripts/, /templates/, /memory/ directories
Install: uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>

```

### Invalid Flag Position
```

❌ ERROR: --dry-run flag must be first token

Invalid: /rampante "Add auth" --dry-run
Valid: /rampante --dry-run "Add auth"

```

### Slash Command Unavailable
```

❌ ERROR: /specify command not available

Ensure you're in an AI CLI with Spec Kit slash commands installed

```

## Template Integration Notes

Each AI CLI template must:
1. Detect `--dry-run` flag in first position
2. Validate Spec Kit directory structure
3. Generate appropriate command prompts
4. Format output according to CLI's markdown capabilities
5. Handle error cases gracefully within CLI context
```
