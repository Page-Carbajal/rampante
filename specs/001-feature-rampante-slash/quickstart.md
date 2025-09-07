# Quickstart: Rampante Complete Spec Kit Automation System

## Prerequisites
- Deno installed on your system
- At least one supported AI CLI (Gemini, Codex, Cursor, Claude Code)
- Existing project with Spec Kit installed

## Installation & Setup

### 1. Install Rampante CLI
```bash
# Install for specific AI CLI
deno run -A --reload jsr:@page-carbajal/rampante install gemini
deno run -A --reload jsr:@page-carbajal/rampante install codex

# Check installation status
deno run -A --reload jsr:@page-carbajal/rampante list
```

Expected output:
```
Rampante Status Report:
  
  Supported AI CLIs:
  ✅ gemini      - Installed v0.2.0 (~/.gemini/commands/rampante.toml)
  ❌ codex       - Not installed
  ❌ cursor      - Not installed  
  ❓ claude-code - CLI not detected
  
  Latest Version: 0.2.0
  Installed CLIs: 1/4
```

### 2. Verify Slash Command Installation
Open your AI CLI and test:
```
/rampante --dry-run "test feature"
```

Expected result: Structured preview showing what Spec Kit workflow would generate

## Core Usage Scenarios

### Scenario 1: Preview Before Execution (Dry-Run)
**Use Case**: See what files and content will be generated before committing

**Steps**:
1. Navigate to Spec Kit project directory
2. Open your AI CLI (Gemini, Codex, etc.)
3. Run preview command:
```
/rampante --dry-run "Build user authentication system with login, signup, and password reset"
```

**Expected Output**:
```markdown
# DRY RUN: /rampante

## Summary
- Input: "Build user authentication system with login, signup, and password reset"
- Commands: [/specify, /plan, /tasks]
- Estimated Duration: ~4-6 minutes
- Files to Generate: 8-12 files

## /specify Command Preview
```text
Build user authentication system with login, signup, and password reset
```
**Expected Output**: Feature specification with requirements, user stories

## /plan Command Preview
```text
/specs/005-auth-system/spec.md
```  
**Expected Output**: Implementation plan with architecture, phases

## /tasks Command Preview
```text
/specs/005-auth-system/plan.md
```
**Expected Output**: Task breakdown with dependencies

## Estimated File Structure
specs/005-auth-system/
├── spec.md           # Feature specification
├── plan.md           # Implementation plan
├── tasks.md          # Task breakdown  
├── research.md       # Technical decisions
├── data-model.md     # Entity definitions
├── quickstart.md     # Testing scenarios
└── contracts/        # API contracts
```

### Scenario 2: Automated Workflow Execution
**Use Case**: Run complete Spec Kit workflow with single command

**Steps**:
1. In Spec Kit project directory
2. Open AI CLI
3. Execute workflow:
```
/rampante "Implement real-time notifications with WebSocket support"
```

**Expected Progress**:
```
🚀 Starting Rampante workflow for: "Implement real-time notifications with WebSocket support"

📋 Phase 1: Specification Generation
   └─ Executing /specify...
   └─ ✅ Generated: /specs/006-notifications/spec.md (2.1s)

🔧 Phase 2: Implementation Planning
   └─ Executing /plan...
   └─ ✅ Generated: /specs/006-notifications/plan.md (1.9s)
   └─ ✅ Generated: /specs/006-notifications/research.md
   └─ ✅ Generated: /specs/006-notifications/data-model.md

📝 Phase 3: Task Breakdown
   └─ Executing /tasks...
   └─ ✅ Generated: /specs/006-notifications/tasks.md (1.4s)

🎉 Workflow completed successfully! (5.4s total)

📂 Generated Files:
   ├── /specs/006-notifications/spec.md
   ├── /specs/006-notifications/plan.md
   ├── /specs/006-notifications/tasks.md
   ├── /specs/006-notifications/research.md
   ├── /specs/006-notifications/data-model.md
   ├── /specs/006-notifications/quickstart.md
   └── /specs/006-notifications/contracts/

🚀 Next Steps:
   1. Review specification: /specs/006-notifications/spec.md
   2. Execute tasks: Follow /specs/006-notifications/tasks.md
```

### Scenario 3: CLI Installation Management
**Use Case**: Install, update, or remove Rampante from different AI CLIs

**Installation**:
```bash
# Install for multiple CLIs
deno run -A --reload jsr:@page-carbajal/rampante install gemini
deno run -A --reload jsr:@page-carbajal/rampante install codex --force

# Preview installation (dry-run)
deno run -A --reload jsr:@page-carbajal/rampante install cursor --dry-run
```

**Status Check**:
```bash
deno run -A --reload jsr:@page-carbajal/rampante list
```

**Removal**:
```bash
deno run -A --reload jsr:@page-carbajal/rampante uninstall gemini
```

### Scenario 4: Preview Without AI CLI
**Use Case**: Preview workflow output using Rampante CLI directly

**Command**:
```bash
cd /path/to/spec-kit-project
deno run -A --reload jsr:@page-carbajal/rampante preview "Add payment processing with Stripe integration"
```

**Output**: Same structured markdown preview as slash command dry-run mode

## Integration Test Scenarios

### Test 1: Fresh Installation Validation
**Objective**: Verify clean installation works correctly

**Steps**:
1. Start with clean system (no Rampante installed)
2. Install for Gemini CLI:
   ```bash
   deno run -A --reload jsr:@page-carbajal/rampante install gemini
   ```
3. Verify installation:
   ```bash
   deno run -A --reload jsr:@page-carbajal/rampante list
   ```
4. Test slash command in Gemini:
   ```
   /rampante --dry-run "test feature"
   ```

**Success Criteria**:
- Installation completes without errors
- Slash command available in Gemini
- Dry-run produces expected preview format
- All files created in correct locations

### Test 2: Multi-CLI Installation
**Objective**: Validate installation across different AI CLIs

**Steps**:
1. Install for all supported CLIs:
   ```bash
   deno run -A --reload jsr:@page-carbajal/rampante install gemini
   deno run -A --reload jsr:@page-carbajal/rampante install codex  
   deno run -A --reload jsr:@page-carbajal/rampante install cursor
   ```
2. Verify each CLI has functional `/rampante` command
3. Test identical behavior across CLIs

**Success Criteria**:
- All installations succeed
- Identical functionality across CLIs
- No conflicts between installations

### Test 3: Workflow Execution Validation
**Objective**: Verify complete workflow generates expected files

**Steps**:
1. Navigate to Spec Kit project
2. Capture initial directory state
3. Execute workflow:
   ```
   /rampante "Build todo application with CRUD operations"
   ```
4. Verify all expected files created
5. Validate file content quality

**Success Criteria**:
- All phases complete successfully
- Expected files generated with correct content
- No orphaned or corrupt files
- Proper error handling for edge cases

### Test 4: Error Recovery Testing
**Objective**: Validate robust error handling and recovery

**Test Cases**:
1. **Missing Spec Kit**:
   - Run `/rampante` in directory without Spec Kit
   - Should show clear error with installation instructions

2. **Permission Errors**:
   - Install with insufficient permissions
   - Should provide specific chmod guidance

3. **Network Failures**:
   - Simulate network issues during package download
   - Should retry and provide fallback options

4. **Partial Workflow Failure**:
   - Simulate failure during `/plan` phase
   - Should offer recovery or restart options

## Performance Benchmarks

### Expected Performance Metrics
- **Installation time**: < 5 seconds per CLI
- **Dry-run preview**: < 2 seconds
- **Full workflow execution**: < 10 seconds (depends on Spec Kit)
- **Package download**: < 30 seconds (depends on network)

### Performance Test Commands
```bash
# Time installation
time deno run -A --reload jsr:@page-carbajal/rampante install gemini

# Time preview generation  
time deno run -A --reload jsr:@page-carbajal/rampante preview "test feature"
```

## Troubleshooting

### Common Issues & Solutions

**Issue**: Permission denied during installation
```bash
ERROR: Permission denied writing to ~/.gemini/commands/
```
**Solution**:
```bash
chmod 755 ~/.gemini/commands/
# Or create directory if missing:
mkdir -p ~/.gemini/commands/
```

**Issue**: Template validation failed
```bash
ERROR: Template validation failed - Package may be corrupted
```
**Solution**:
```bash
# Force reinstallation
deno run -A --reload jsr:@page-carbajal/rampante install gemini --force
```

**Issue**: Spec Kit not detected
```bash
ERROR: Spec Kit not detected in current directory
```
**Solution**:
```bash
# Ensure you're in a Spec Kit project
ls scripts/ templates/ memory/
# If missing, initialize Spec Kit:
uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>
```

### Debug Mode
```bash
# Enable verbose logging
deno run -A --reload jsr:@page-carbajal/rampante install gemini --verbose
```

### Clean Reinstallation
```bash
# Complete cleanup and reinstall
deno run -A --reload jsr:@page-carbajal/rampante uninstall gemini
rm -rf ~/.gemini/commands/rampante.*
deno run -A --reload jsr:@page-carbajal/rampante install gemini
```

## Advanced Usage

### Custom Version Installation
```bash
# Install specific version
deno run -A --reload jsr:@page-carbajal/rampante install gemini --version 0.1.0
```

### Batch Operations
```bash
# Install for all detected CLIs
for cli in gemini codex cursor; do
  deno run -A --reload jsr:@page-carbajal/rampante install $cli
done
```

### Integration with CI/CD
```bash
# Automated installation in CI
#!/bin/bash
set -e
deno run -A --reload jsr:@page-carbajal/rampante install gemini --dry-run
if [ $? -eq 0 ]; then
  deno run -A --reload jsr:@page-carbajal/rampante install gemini
fi
```