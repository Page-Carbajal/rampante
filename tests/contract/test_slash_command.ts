import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

// Contract tests for slash command behavior
// Based on: specs/001-feature-rampante-slash/contracts/slash-command-contract.md

describe("Slash Command Contract", () => {
  let tempDir: string;
  let specKitDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
    specKitDir = await Deno.makeTempDir();
    
    // Create Spec Kit structure
    await Deno.mkdir(`${specKitDir}/scripts`, { recursive: true });
    await Deno.mkdir(`${specKitDir}/templates`, { recursive: true });
    await Deno.mkdir(`${specKitDir}/memory`, { recursive: true });
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
    await Deno.remove(specKitDir, { recursive: true });
  });

  describe("/rampante dry-run mode", () => {
    it("should generate preview for authentication feature", async () => {
      // Simulate slash command execution in dry-run mode
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--mode=dry-run",
          "--input=Add user authentication with login, signup, password reset",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify structured markdown output format
      assertStringIncludes(stdout, "# DRY RUN: /rampante");
      assertStringIncludes(stdout, "## Summary");
      assertStringIncludes(stdout, "Input: \"Add user authentication with login, signup, password reset\"");
      assertStringIncludes(stdout, "Commands: [/specify, /plan, /tasks]");
      assertStringIncludes(stdout, "Estimated Duration: ~4-6 minutes");
      assertStringIncludes(stdout, "Files to Generate: 8-12 files");
      
      // Verify command previews
      assertStringIncludes(stdout, "## /specify Command Preview");
      assertStringIncludes(stdout, "Expected Output: Feature specification with requirements, user stories");
      assertStringIncludes(stdout, "specs/005-auth-system/spec.md");
      
      assertStringIncludes(stdout, "## /plan Command Preview");
      assertStringIncludes(stdout, "Expected Output: Implementation plan with architecture, phases");
      assertStringIncludes(stdout, "specs/005-auth-system/plan.md");
      
      assertStringIncludes(stdout, "## /tasks Command Preview");
      assertStringIncludes(stdout, "Expected Output: Task breakdown with dependencies");
      assertStringIncludes(stdout, "specs/005-auth-system/tasks.md");
      
      // Verify estimated file structure
      assertStringIncludes(stdout, "## Estimated File Structure");
      assertStringIncludes(stdout, "specs/005-auth-system/");
      assertStringIncludes(stdout, "├── spec.md");
      assertStringIncludes(stdout, "├── plan.md");
      assertStringIncludes(stdout, "├── tasks.md");
      assertStringIncludes(stdout, "└── contracts/");
    });

    it("should handle simple feature requests", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--mode=dry-run",
          "--input=Create a todo list component",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Input: \"Create a todo list component\"");
      assertStringIncludes(stdout, "Estimated Duration: ~2-4 minutes");
      assertStringIncludes(stdout, "Files to Generate: 4-6 files");
    });

    it("should work without Spec Kit installation", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--mode=dry-run",
          "--input=Build payment system",
        ],
        cwd: tempDir, // Directory without Spec Kit
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "⚠️  Warning: Spec Kit not detected");
      assertStringIncludes(stdout, "Preview generated based on standard patterns");
    });

    it("should generate consistent preview format", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--mode=dry-run",
          "--input=Implement real-time notifications",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify consistent markdown structure
      const sections = [
        "# DRY RUN: /rampante",
        "## Summary",
        "## /specify Command Preview",
        "## /plan Command Preview", 
        "## /tasks Command Preview",
        "## Estimated File Structure"
      ];
      
      for (const section of sections) {
        assertStringIncludes(stdout, section);
      }
    });
  });

  describe("/rampante execution mode", () => {
    it("should execute complete workflow", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--input=Build REST API with CRUD operations",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify progress reporting format
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow for: \"Build REST API with CRUD operations\"");
      
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "└─ Executing /specify...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      assertStringIncludes(stdout, "spec.md");
      
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "└─ Executing /plan...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      assertStringIncludes(stdout, "plan.md");
      
      assertStringIncludes(stdout, "📝 Phase 3: Task Breakdown");
      assertStringIncludes(stdout, "└─ Executing /tasks...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      assertStringIncludes(stdout, "tasks.md");
      
      assertStringIncludes(stdout, "🎉 Workflow completed successfully!");
      assertStringIncludes(stdout, "📂 Generated Files:");
      assertStringIncludes(stdout, "🚀 Next Steps:");
    });

    it("should fail without Spec Kit", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--input=Create feature",
        ],
        cwd: tempDir, // Directory without Spec Kit
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 2);
      assertStringIncludes(stderr, "❌ Error: Spec Kit not detected in current directory");
      assertStringIncludes(stderr, "Required files missing:");
      assertStringIncludes(stderr, "- scripts/");
      assertStringIncludes(stderr, "- templates/");
      assertStringIncludes(stderr, "- memory/");
      assertStringIncludes(stderr, "Install Spec Kit:");
      assertStringIncludes(stderr, "uvx --from git+https://github.com/Page-Carbajal/spec-kit");
    });

    it("should handle workflow step failures", async () => {
      // Create incomplete Spec Kit (missing templates)
      await Deno.remove(`${specKitDir}/templates`, { recursive: true });

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--input=Test feature",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 3);
      assertStringIncludes(stderr, "❌ Error: /specify command failed");
      assertStringIncludes(stderr, "Recovery options:");
      assertStringIncludes(stderr, "1. Check feature description clarity");
      assertStringIncludes(stderr, "2. Verify Spec Kit installation");
      assertStringIncludes(stderr, "3. Try manual /specify execution");
    });

    it("should provide timing information", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--input=Simple component",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify timing format (X.Xs)
      const timingPattern = /\(\d+\.\d+s\)/;
      const lines = stdout.split('\n');
      const generatedLines = lines.filter(line => line.includes('✅ Generated:'));
      
      for (const line of generatedLines) {
        assertEquals(timingPattern.test(line), true);
      }
      
      assertStringIncludes(stdout, "total");
    });
  });

  describe("flag validation", () => {
    it("should handle invalid flag positions", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--input=Test feature --dry-run",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 4);
      assertStringIncludes(stderr, "❌ Error: Invalid usage");
      assertStringIncludes(stderr, "Usage: /rampante [--dry-run] \"<feature description>\"");
      assertStringIncludes(stderr, "Examples:");
      assertStringIncludes(stderr, "/rampante --dry-run \"Add user authentication\"");
      assertStringIncludes(stderr, "/rampante \"Build REST API with CRUD operations\"");
    });

    it("should handle empty input", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--input=",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 4);
      assertStringIncludes(stderr, "❌ Error: Feature description cannot be empty");
    });

    it("should handle missing quotes", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--input=Add user auth without quotes",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      // Should work but provide guidance
      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Input: \"Add user auth without quotes\"");
    });
  });

  describe("CLI-specific adaptations", () => {
    it("should work with Gemini CLI format", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--cli=gemini",
          "--test-slash-command",
          "--input=Test feature",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Gemini CLI integration: ✅");
      assertStringIncludes(stdout, "TOML format: ✅");
    });

    it("should work with Codex CLI format", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--cli=codex",
          "--test-slash-command",
          "--input=Test feature",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Codex CLI integration: ✅");
      assertStringIncludes(stdout, "Markdown format: ✅");
    });

    it("should work with Cursor CLI format", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--cli=cursor",
          "--test-slash-command",
          "--input=Test feature",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Cursor CLI integration: ✅");
      assertStringIncludes(stdout, "MDC format: ✅");
    });

    it("should work with Claude Code CLI format", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--cli=claude-code",
          "--test-slash-command",
          "--input=Test feature",
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Claude Code CLI integration: ✅");
      assertStringIncludes(stdout, "JSON format: ✅");
    });
  });
});