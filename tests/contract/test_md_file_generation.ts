import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

// Contract tests for MD file generation behavior
// Based on: specs/001-feature-rampante-slash/contracts/md-file-generation-contract.md

describe("MD File Generation Contract", () => {
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

  describe("MD file structure", () => {
    it("should generate valid markdown file structure", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--generate",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output", `${tempDir}/rampante.md`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      // Verify MD file was created
      const mdContent = await Deno.readTextFile(`${tempDir}/rampante.md`);
      
      // Verify required sections
      assertStringIncludes(mdContent, "# /rampante - Spec Kit Automation");
      assertStringIncludes(mdContent, "## Usage");
      assertStringIncludes(mdContent, "/rampante [--dry-run] \"<feature description>\"");
      assertStringIncludes(mdContent, "## Preview Mode (--dry-run)");
      assertStringIncludes(mdContent, "## Execution Mode");
      assertStringIncludes(mdContent, "## Spec Kit Command Mappings");
      assertStringIncludes(mdContent, "### /specify Simulation");
      assertStringIncludes(mdContent, "### /plan Simulation");
      assertStringIncludes(mdContent, "### /tasks Simulation");
    });

    it("should include CLI-specific adaptations", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--generate",
          "--cli", "cursor",
          "--output", `${tempDir}/cursor-rampante.md`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const mdContent = await Deno.readTextFile(`${tempDir}/cursor-rampante.md`);
      
      // Verify CLI-specific content
      assertStringIncludes(mdContent, "Cursor CLI Integration");
      assertStringIncludes(mdContent, "supports_flags: [\"--dry-run\"]");
    });

    it("should validate markdown syntax", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--validate-syntax",
          "--file", `${tempDir}/test-rampante.md`
        ],
        cwd: tempDir,
      });

      // Create test MD file first
      await Deno.writeTextFile(`${tempDir}/test-rampante.md`, `
# /rampante - Test

## Usage
/rampante [--dry-run] "feature"

## Preview Mode
Test preview content

## Execution Mode  
Test execution content
      `);

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Markdown syntax: valid");
      assertStringIncludes(stdout, "✅ Required sections: present");
      assertStringIncludes(stdout, "✅ Structure: compliant");
    });
  });

  describe("dual-mode operation", () => {
    it("should generate preview mode logic", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-preview-mode",
          "--input", "Add user authentication system"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify preview output format
      assertStringIncludes(stdout, "# DRY RUN: /rampante");
      assertStringIncludes(stdout, "## Summary");
      assertStringIncludes(stdout, "Input: \"Add user authentication system\"");
      assertStringIncludes(stdout, "Commands: [/specify, /plan, /tasks]");
      assertStringIncludes(stdout, "Estimated Duration: ~");
      assertStringIncludes(stdout, "Files to Generate:");
      
      // Verify command previews
      assertStringIncludes(stdout, "## /specify Command Preview");
      assertStringIncludes(stdout, "Expected Output: Feature specification");
      assertStringIncludes(stdout, "specs/");
      assertStringIncludes(stdout, "spec.md");
      
      assertStringIncludes(stdout, "## /plan Command Preview");
      assertStringIncludes(stdout, "Expected Output: Implementation plan");
      assertStringIncludes(stdout, "plan.md");
      
      assertStringIncludes(stdout, "## /tasks Command Preview");
      assertStringIncludes(stdout, "Expected Output: Task breakdown");
      assertStringIncludes(stdout, "tasks.md");
      
      // Verify file structure estimation
      assertStringIncludes(stdout, "## Estimated File Structure");
      assertStringIncludes(stdout, "├── spec.md");
      assertStringIncludes(stdout, "├── plan.md");
      assertStringIncludes(stdout, "├── tasks.md");
      assertStringIncludes(stdout, "└── contracts/");
    });

    it("should generate execution mode logic", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-execution-mode",
          "--input", "Build payment processing system"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify execution output format
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow for: \"Build payment processing system\"");
      
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "└─ Executing /specify...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "└─ Executing /plan...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      
      assertStringIncludes(stdout, "📝 Phase 3: Task Breakdown");
      assertStringIncludes(stdout, "└─ Executing /tasks...");
      assertStringIncludes(stdout, "└─ ✅ Generated:");
      
      assertStringIncludes(stdout, "🎉 Workflow completed successfully!");
      assertStringIncludes(stdout, "📂 Generated Files:");
      assertStringIncludes(stdout, "🚀 Next Steps:");
    });

    it("should handle mode detection correctly", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-mode-detection",
          "--flags", "--dry-run",
          "--input", "test feature"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Mode detected: preview");
      assertStringIncludes(stdout, "Flag parsed: --dry-run");
      assertStringIncludes(stdout, "Input extracted: test feature");
    });

    it("should prevent side effects in preview mode", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-side-effects",
          "--mode", "preview",
          "--input", "create files test"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Preview mode: no file system modifications");
      assertStringIncludes(stdout, "✅ No external network calls");
      assertStringIncludes(stdout, "✅ No command execution");
      assertStringIncludes(stdout, "✅ Safe parsing only");
    });
  });

  describe("CLI-specific adaptations", () => {
    it("should generate Gemini CLI integration", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-cli-config",
          "--cli", "gemini",
          "--output", `${tempDir}/rampante.toml`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const configContent = await Deno.readTextFile(`${tempDir}/rampante.toml`);
      assertStringIncludes(configContent, "[command.rampante]");
      assertStringIncludes(configContent, "description = \"Spec Kit workflow automation with preview\"");
      assertStringIncludes(configContent, "file = \"rampante.md\"");
      assertStringIncludes(configContent, "execution_mode = \"markdown_processor\"");
    });

    it("should generate Codex CLI integration", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-cli-config",
          "--cli", "codex",
          "--output", `${tempDir}/rampante-codex.md`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const configContent = await Deno.readTextFile(`${tempDir}/rampante-codex.md`);
      assertStringIncludes(configContent, "# /rampante");
      assertStringIncludes(configContent, "Execute the markdown file logic");
      assertStringIncludes(configContent, "Support for --dry-run flag detection");
    });

    it("should generate Cursor CLI integration", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-cli-config",
          "--cli", "cursor",
          "--output", `${tempDir}/rampante.yaml`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const configContent = await Deno.readTextFile(`${tempDir}/rampante.yaml`);
      assertStringIncludes(configContent, "commands:");
      assertStringIncludes(configContent, "rampante:");
      assertStringIncludes(configContent, "description: \"Spec Kit automation\"");
      assertStringIncludes(configContent, "file: \"rampante.md\"");
      assertStringIncludes(configContent, "supports_flags: [\"--dry-run\"]");
    });

    it("should generate Claude Code CLI integration", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-cli-config",
          "--cli", "claude-code",
          "--output", `${tempDir}/rampante.json`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const configContent = await Deno.readTextFile(`${tempDir}/rampante.json`);
      const config = JSON.parse(configContent);
      
      assertEquals(config.commands.rampante.description, "Spec Kit workflow automation");
      assertEquals(config.commands.rampante.file, "rampante.md");
      assertEquals(Array.isArray(config.commands.rampante.modes), true);
      assertEquals(config.commands.rampante.modes.includes("preview"), true);
      assertEquals(config.commands.rampante.modes.includes("execute"), true);
    });
  });

  describe("error handling", () => {
    it("should handle missing Spec Kit gracefully", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-execution-mode",
          "--input", "test feature"
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

    it("should validate input arguments", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-validation",
          "--input", ""
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 4);
      assertStringIncludes(stderr, "❌ Error: Feature description cannot be empty");
      assertStringIncludes(stderr, "Usage: /rampante [--dry-run] \"<feature description>\"");
      assertStringIncludes(stderr, "Examples:");
      assertStringIncludes(stderr, "/rampante --dry-run \"Add user authentication\"");
      assertStringIncludes(stderr, "/rampante \"Build REST API with CRUD operations\"");
    });

    it("should handle command execution failures", async () => {
      // Create Spec Kit but remove templates to cause /specify failure
      await Deno.remove(`${specKitDir}/templates`, { recursive: true });

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--test-execution-mode",
          "--input", "test feature"
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
  });

  describe("performance requirements", () => {
    it("should meet preview generation performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--performance-test",
          "--mode", "preview",
          "--input", "Build complex e-commerce system with user auth, product catalog, shopping cart, payment processing, and admin dashboard"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should complete preview in < 2 seconds (contract requirement)
      assertEquals(duration < 2000, true);
    });

    it("should meet MD file parsing performance targets", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--performance-test",
          "--operation", "parse",
          "--file", `${tempDir}/large-rampante.md`
        ],
        cwd: tempDir,
      });

      // Create large MD file for testing
      const largeContent = "# /rampante\n".repeat(1000) + "Content here\n".repeat(1000);
      await Deno.writeTextFile(`${tempDir}/large-rampante.md`, largeContent);

      const startTime = Date.now();
      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should parse in < 100ms (contract requirement)
      assertEquals(duration < 100, true);
    });

    it("should meet execution mode setup targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--performance-test",
          "--mode", "execution-setup",
          "--input", "Simple feature"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const setupDuration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should setup execution in < 5 seconds (contract requirement)
      assertEquals(setupDuration < 5000, true);
    });
  });

  describe("security considerations", () => {
    it("should validate safe preview mode operations", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--security-test",
          "--mode", "preview",
          "--input", "rm -rf / && malicious command"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Security check: No file system writes");
      assertStringIncludes(stdout, "✅ Security check: No external network calls");
      assertStringIncludes(stdout, "✅ Security check: No command execution");
      assertStringIncludes(stdout, "✅ Security check: Safe input parsing");
      assertStringIncludes(stdout, "✅ Malicious input: sanitized and safe");
    });

    it("should validate controlled execution mode", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--security-test",
          "--mode", "execution",
          "--input", "valid feature request"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Security check: Only known Spec Kit commands");
      assertStringIncludes(stdout, "✅ Security check: Validated file paths");
      assertStringIncludes(stdout, "✅ Security check: Proper error handling");
      assertStringIncludes(stdout, "✅ Security check: No privilege escalation");
    });
  });
});