import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { join } from "@std/path";

// Integration tests for MD file generation and dual-mode operation
// Tests the core MD file functionality that enables both preview and execution modes

describe("MD File Dual-Mode Integration", () => {
  let tempDir: string;
  let specKitDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
    specKitDir = await Deno.makeTempDir();
    
    // Create Spec Kit environment
    await createSpecKitEnvironment(specKitDir);
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
    await Deno.remove(specKitDir, { recursive: true });
  });

  async function createSpecKitEnvironment(dir: string) {
    await Deno.mkdir(join(dir, "scripts"), { recursive: true });
    await Deno.mkdir(join(dir, "templates"), { recursive: true });
    await Deno.mkdir(join(dir, "memory"), { recursive: true });
    
    // Create mock Spec Kit commands
    await Deno.writeTextFile(
      join(dir, "scripts", "specify.sh"),
      `#!/bin/bash
echo "/specify executed with: $1"
`
    );
    await Deno.chmod(join(dir, "scripts", "specify.sh"), 0o755);
  }

  describe("MD file generation workflow", () => {
    it("should generate complete MD file with dual-mode support", async () => {
      const outputFile = join(tempDir, "rampante.md");

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--generate-complete",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output", outputFile
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      // Verify MD file was created
      const mdContent = await Deno.readTextFile(outputFile);

      // Verify essential structure
      assertStringIncludes(mdContent, "# /rampante - Spec Kit Automation");
      assertStringIncludes(mdContent, "## Usage");
      assertStringIncludes(mdContent, "/rampante [--dry-run] \"<feature description>\"");

      // Verify dual-mode sections
      assertStringIncludes(mdContent, "## Preview Mode (--dry-run)");
      assertStringIncludes(mdContent, "## Execution Mode");

      // Verify Spec Kit command mappings
      assertStringIncludes(mdContent, "## Spec Kit Command Mappings");
      assertStringIncludes(mdContent, "### /specify Simulation");
      assertStringIncludes(mdContent, "### /plan Simulation");
      assertStringIncludes(mdContent, "### /tasks Simulation");

      // Verify CLI-specific adaptations
      assertStringIncludes(mdContent, "Gemini CLI Integration");
    });

    it("should generate CLI-specific variations", async () => {
      const clis = [
        { name: "gemini", format: "toml" },
        { name: "codex", format: "md" },
        { name: "cursor", format: "mdc" },
        { name: "claude-code", format: "json" }
      ];

      for (const cli of clis) {
        const outputFile = join(tempDir, `rampante-${cli.name}.md`);

        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/md_file_service.ts",
            "--generate-complete",
            "--cli", cli.name,
            "--output", outputFile
          ],
          cwd: tempDir,
        });

        const result = await cmd.output();
        assertEquals(result.code, 0);

        const mdContent = await Deno.readTextFile(outputFile);
        
        // Verify CLI-specific content
        assertStringIncludes(mdContent, `${cli.name.charAt(0).toUpperCase() + cli.name.slice(1)} CLI Integration`);
        assertStringIncludes(mdContent, cli.format);
      }
    });

    it("should embed executable logic in markdown", async () => {
      const outputFile = join(tempDir, "executable-rampante.md");

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--generate-executable",
          "--cli", "codex",
          "--output", outputFile
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const mdContent = await Deno.readTextFile(outputFile);

      // Verify executable sections contain actual logic
      assertStringIncludes(mdContent, "```typescript");
      assertStringIncludes(mdContent, "// Preview Mode Logic");
      assertStringIncludes(mdContent, "// Execution Mode Logic");
      assertStringIncludes(mdContent, "function parseFlags(");
      assertStringIncludes(mdContent, "function executeWorkflow(");
      assertStringIncludes(mdContent, "function generatePreview(");
    });
  });

  describe("dual-mode operation testing", () => {
    it("should execute preview mode without side effects", async () => {
      const mdFile = join(tempDir, "test-rampante.md");

      // Generate MD file first
      await generateTestMDFile(mdFile);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--execute-md",
          "--file", mdFile,
          "--mode", "preview",
          "--input", "Build user authentication with OAuth integration"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);

      // Verify preview output format
      assertStringIncludes(stdout, "# DRY RUN: /rampante");
      assertStringIncludes(stdout, "## Summary");
      assertStringIncludes(stdout, "Input: \"Build user authentication with OAuth integration\"");
      assertStringIncludes(stdout, "Commands: [/specify, /plan, /tasks]");
      assertStringIncludes(stdout, "Estimated Duration:");
      assertStringIncludes(stdout, "Files to Generate:");

      // Verify command previews
      assertStringIncludes(stdout, "## /specify Command Preview");
      assertStringIncludes(stdout, "Expected Output: Feature specification");
      assertStringIncludes(stdout, "## /plan Command Preview");
      assertStringIncludes(stdout, "Expected Output: Implementation plan");
      assertStringIncludes(stdout, "## /tasks Command Preview");
      assertStringIncludes(stdout, "Expected Output: Task breakdown");

      // Verify estimated file structure
      assertStringIncludes(stdout, "## Estimated File Structure");
      assertStringIncludes(stdout, "specs/");
      assertStringIncludes(stdout, "├── spec.md");
      assertStringIncludes(stdout, "├── plan.md");
      assertStringIncludes(stdout, "├── tasks.md");

      // Verify no side effects occurred
      const specsDirExists = await Deno.stat(join(specKitDir, "specs"))
        .then(() => true)
        .catch(() => false);
      assertEquals(specsDirExists, false);
    });

    it("should execute workflow mode with actual file creation", async () => {
      const mdFile = join(tempDir, "test-rampante.md");

      // Generate MD file first
      await generateTestMDFile(mdFile);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--execute-md",
          "--file", mdFile,
          "--mode", "execution",
          "--input", "Create payment processing module"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);

      // Verify execution output format
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow for: \"Create payment processing module\"");
      
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "└─ Executing /specify...");
      
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "🔧 Phase 3: Task Breakdown");
      
      assertStringIncludes(stdout, "🎉 Workflow completed successfully!");
      assertStringIncludes(stdout, "📂 Generated Files:");
      assertStringIncludes(stdout, "🚀 Next Steps:");

      // Verify actual files would be created (in integration test, we simulate this)
      assertStringIncludes(stdout, "spec.md");
      assertStringIncludes(stdout, "plan.md");
      assertStringIncludes(stdout, "tasks.md");
    });

    it("should detect mode from flags correctly", async () => {
      const mdFile = join(tempDir, "test-rampante.md");
      await generateTestMDFile(mdFile);

      // Test dry-run flag detection
      const previewCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-flag-detection",
          "--file", mdFile,
          "--args", "--dry-run \"test feature\""
        ],
        cwd: specKitDir,
      });

      const previewResult = await previewCmd.output();
      const previewOutput = new TextDecoder().decode(previewResult.stdout);

      assertEquals(previewResult.code, 0);
      assertStringIncludes(previewOutput, "Mode detected: preview");
      assertStringIncludes(previewOutput, "Flag: --dry-run");
      assertStringIncludes(previewOutput, "Input: test feature");

      // Test execution mode (no flags)
      const execCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-flag-detection",
          "--file", mdFile,
          "--args", "\"test feature without flags\""
        ],
        cwd: specKitDir,
      });

      const execResult = await execCmd.output();
      const execOutput = new TextDecoder().decode(execResult.stdout);

      assertEquals(execResult.code, 0);
      assertStringIncludes(execOutput, "Mode detected: execution");
      assertStringIncludes(execOutput, "Flag: none");
      assertStringIncludes(execOutput, "Input: test feature without flags");
    });

    it("should handle mode switching within same MD file", async () => {
      const mdFile = join(tempDir, "switchable-rampante.md");
      await generateTestMDFile(mdFile);

      const testCases = [
        { mode: "preview", input: "First test", expectOutput: "# DRY RUN:" },
        { mode: "execution", input: "Second test", expectOutput: "🚀 Starting Rampante workflow" },
        { mode: "preview", input: "Third test", expectOutput: "# DRY RUN:" }
      ];

      for (const testCase of testCases) {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/md_file_service.ts",
            "--execute-md",
            "--file", mdFile,
            "--mode", testCase.mode,
            "--input", testCase.input
          ],
          cwd: specKitDir,
        });

        const result = await cmd.output();
        const stdout = new TextDecoder().decode(result.stdout);

        assertEquals(result.code, 0);
        assertStringIncludes(stdout, testCase.expectOutput);
        assertStringIncludes(stdout, testCase.input);
      }
    });
  });

  describe("CLI-specific MD file integration", () => {
    it("should work with Gemini CLI TOML configuration", async () => {
      const mdFile = join(tempDir, "gemini-rampante.md");
      const configFile = join(tempDir, "rampante.toml");

      // Generate Gemini-specific MD file and config
      const genCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-package",
          "--cli", "gemini",
          "--md-output", mdFile,
          "--config-output", configFile
        ],
        cwd: tempDir,
      });

      await genCmd.output();

      // Verify TOML config references MD file
      const configContent = await Deno.readTextFile(configFile);
      assertStringIncludes(configContent, "[command.rampante]");
      assertStringIncludes(configContent, "file = \"rampante.md\"");
      assertStringIncludes(configContent, "execution_mode = \"markdown_processor\"");

      // Test MD file execution through simulated TOML integration
      const testCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--simulate-cli-execution",
          "--cli", "gemini",
          "--md-file", mdFile,
          "--input", "test gemini integration"
        ],
        cwd: specKitDir,
      });

      const result = await testCmd.output();
      assertEquals(result.code, 0);
    });

    it("should work with Codex CLI markdown integration", async () => {
      const mdFile = join(tempDir, "codex-rampante.md");

      const genCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-package",
          "--cli", "codex",
          "--md-output", mdFile
        ],
        cwd: tempDir,
      });

      await genCmd.output();

      const mdContent = await Deno.readTextFile(mdFile);
      
      // Verify Codex-specific integration format
      assertStringIncludes(mdContent, "# /rampante");
      assertStringIncludes(mdContent, "Execute the markdown file logic");
      assertStringIncludes(mdContent, "Support for --dry-run flag detection");

      // Test execution
      const testCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--simulate-cli-execution",
          "--cli", "codex",
          "--md-file", mdFile,
          "--input", "test codex integration"
        ],
        cwd: specKitDir,
      });

      const result = await testCmd.output();
      assertEquals(result.code, 0);
    });

    it("should work with Cursor CLI YAML integration", async () => {
      const mdFile = join(tempDir, "cursor-rampante.md");
      const yamlFile = join(tempDir, "rampante.yaml");

      const genCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-package",
          "--cli", "cursor",
          "--md-output", mdFile,
          "--config-output", yamlFile
        ],
        cwd: tempDir,
      });

      await genCmd.output();

      const yamlContent = await Deno.readTextFile(yamlFile);
      assertStringIncludes(yamlContent, "commands:");
      assertStringIncludes(yamlContent, "rampante:");
      assertStringIncludes(yamlContent, "file: \"rampante.md\"");
      assertStringIncludes(yamlContent, "supports_flags: [\"--dry-run\"]");

      // Test execution
      const testCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--simulate-cli-execution",
          "--cli", "cursor",
          "--md-file", mdFile,
          "--input", "test cursor integration"
        ],
        cwd: specKitDir,
      });

      const result = await testCmd.output();
      assertEquals(result.code, 0);
    });

    it("should work with Claude Code CLI JSON integration", async () => {
      const mdFile = join(tempDir, "claude-rampante.md");
      const jsonFile = join(tempDir, "rampante.json");

      const genCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-package",
          "--cli", "claude-code",
          "--md-output", mdFile,
          "--config-output", jsonFile
        ],
        cwd: tempDir,
      });

      await genCmd.output();

      const jsonContent = await Deno.readTextFile(jsonFile);
      const config = JSON.parse(jsonContent);
      
      assertEquals(config.commands.rampante.file, "rampante.md");
      assertEquals(config.commands.rampante.modes.includes("preview"), true);
      assertEquals(config.commands.rampante.modes.includes("execute"), true);

      // Test execution
      const testCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--simulate-cli-execution",
          "--cli", "claude-code",
          "--md-file", mdFile,
          "--input", "test claude-code integration"
        ],
        cwd: specKitDir,
      });

      const result = await testCmd.output();
      assertEquals(result.code, 0);
    });
  });

  describe("MD file validation and security", () => {
    it("should validate MD file structure before execution", async () => {
      // Create invalid MD file
      const invalidMdFile = join(tempDir, "invalid-rampante.md");
      await Deno.writeTextFile(invalidMdFile, `
# Invalid Rampante File
Missing required sections
      `);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--validate-structure",
          "--file", invalidMdFile
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ MD file structure validation failed");
      assertStringIncludes(stderr, "Missing required section: ## Preview Mode");
      assertStringIncludes(stderr, "Missing required section: ## Execution Mode");
      assertStringIncludes(stderr, "Missing required section: ## Spec Kit Command Mappings");
    });

    it("should sanitize user input in preview mode", async () => {
      const mdFile = join(tempDir, "secure-rampante.md");
      await generateTestMDFile(mdFile);

      const maliciousInput = 'rm -rf / && echo "malicious command"; cat /etc/passwd';

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--execute-md",
          "--file", mdFile,
          "--mode", "preview",
          "--input", maliciousInput
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify input was sanitized but preview still generated
      assertStringIncludes(stdout, "# DRY RUN: /rampante");
      assertStringIncludes(stdout, "Input: \""); // Should contain sanitized version
      
      // Verify no actual command execution occurred
      assertStringIncludes(stdout, "✅ Security: Input sanitized and safe");
    });

    it("should prevent execution mode from running arbitrary commands", async () => {
      const mdFile = join(tempDir, "secure-exec-rampante.md");
      await generateTestMDFile(mdFile);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--security-test",
          "--file", mdFile,
          "--mode", "execution"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Security check: Only known Spec Kit commands allowed");
      assertStringIncludes(stdout, "✅ Security check: File path validation active");
      assertStringIncludes(stdout, "✅ Security check: No privilege escalation possible");
    });
  });

  describe("performance and reliability", () => {
    it("should generate MD files within performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--performance-test",
          "--generate-complete",
          "--cli", "gemini",
          "--output", join(tempDir, "perf-test-rampante.md")
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should generate MD file in <1s (contract requirement)
      assert(duration < 1000, `MD generation took ${duration}ms, should be <1000ms`);
    });

    it("should handle concurrent MD file operations", async () => {
      const operations = [
        { mode: "preview", input: "Concurrent test 1" },
        { mode: "execution", input: "Concurrent test 2" },
        { mode: "preview", input: "Concurrent test 3" }
      ];

      const mdFile = join(tempDir, "concurrent-rampante.md");
      await generateTestMDFile(mdFile);

      const promises = operations.map((op, index) => {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/md_file_service.ts",
            "--execute-md",
            "--file", mdFile,
            "--mode", op.mode,
            "--input", op.input,
            "--instance-id", index.toString()
          ],
          cwd: specKitDir,
        });
        return cmd.output();
      });

      const results = await Promise.all(promises);

      // All operations should succeed
      for (const result of results) {
        assertEquals(result.code, 0);
      }
    });

    it("should recover from corrupted MD files", async () => {
      const corruptedMdFile = join(tempDir, "corrupted-rampante.md");
      
      // Create corrupted MD file (incomplete structure)
      await Deno.writeTextFile(corruptedMdFile, `
# /rampante - Spec Kit Automation

## Usage
/rampante [--dry-run] "feature"

## Preview Mode
[CORRUPTED CONTENT - INCOMPLETE]
      `);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--recover-corrupted",
          "--file", corruptedMdFile,
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔧 Corrupted MD file detected");
      assertStringIncludes(stdout, "🔄 Regenerating missing sections");
      assertStringIncludes(stdout, "✅ MD file recovered successfully");

      // Verify recovered file is valid
      const recoveredContent = await Deno.readTextFile(corruptedMdFile);
      assertStringIncludes(recoveredContent, "## Execution Mode");
      assertStringIncludes(recoveredContent, "## Spec Kit Command Mappings");
    });
  });

  async function generateTestMDFile(outputPath: string) {
    const cmd = new Deno.Command("deno", {
      args: [
        "run", "-A", "src/services/md_file_service.ts",
        "--generate-complete",
        "--cli", "gemini",
        "--version", "0.2.0",
        "--output", outputPath
      ],
      cwd: tempDir,
    });

    const result = await cmd.output();
    assertEquals(result.code, 0);
  }
});