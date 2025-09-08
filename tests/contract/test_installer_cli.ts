import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

// Contract tests for installer CLI commands
// Based on: specs/001-feature-rampante-slash/contracts/installer-cli-contract.md

describe("Installer CLI Contract", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
  });

  describe("install command", () => {
    it("should install for gemini CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Successfully installed Rampante for Gemini CLI");
      assertStringIncludes(stdout, ".gemini/commands/rampante.toml");
    });

    it("should install for codex CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "codex"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Successfully installed Rampante for Codex CLI");
      assertStringIncludes(stdout, "~/.codex/prompts/rampante.md");
    });

    it("should install for cursor CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "cursor"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Successfully installed Rampante for Cursor CLI");
      assertStringIncludes(stdout, ".cursor/commands/rampante.mdc");
    });

    it("should install for claude-code CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "claude-code"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Successfully installed Rampante for Claude Code CLI");
      assertStringIncludes(stdout, ".claude/commands/rampante.md");
    });

    it("should support --dry-run flag", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini", "--dry-run"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "DRY RUN: Install simulation for Gemini CLI");
      assertStringIncludes(stdout, "Would create: .gemini/commands/rampante.toml");
      assertStringIncludes(stdout, "Would download package from:");
    });

    it("should fail with unsupported CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "unsupported-cli"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Error: Unsupported CLI 'unsupported-cli'");
      assertStringIncludes(stderr, "Supported CLIs: gemini, codex, cursor, claude-code");
    });
  });

  describe("list command", () => {
    it("should show installation status for all CLIs", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Rampante Status Report:");
      assertStringIncludes(stdout, "Supported AI CLIs:");
      assertStringIncludes(stdout, "gemini");
      assertStringIncludes(stdout, "codex");
      assertStringIncludes(stdout, "cursor");
      assertStringIncludes(stdout, "claude-code");
    });

    it("should support --json flag", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list", "--json"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      const jsonOutput = JSON.parse(stdout);
      assertEquals(typeof jsonOutput.version, "string");
      assertEquals(Array.isArray(jsonOutput.clis), true);
      assertEquals(jsonOutput.clis.length, 4);
    });
  });

  describe("uninstall command", () => {
    it("should uninstall from gemini CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "uninstall", "gemini"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Successfully uninstalled Rampante from Gemini CLI");
    });

    it("should handle already uninstalled CLI gracefully", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "uninstall", "gemini"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "ℹ️  Rampante was not installed for Gemini CLI");
    });
  });

  describe("preview command", () => {
    it("should generate dry-run preview without Spec Kit", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "preview", "Add user authentication"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "# DRY RUN: Rampante Preview");
      assertStringIncludes(stdout, "Input: \"Add user authentication\"");
      assertStringIncludes(stdout, "Commands: [/specify, /plan, /tasks]");
      assertStringIncludes(stdout, "## /specify Command Preview");
      assertStringIncludes(stdout, "## /plan Command Preview");
      assertStringIncludes(stdout, "## /tasks Command Preview");
    });

    it("should work in Spec Kit directory", async () => {
      // Create minimal Spec Kit structure
      await Deno.mkdir(`${tempDir}/scripts`, { recursive: true });
      await Deno.mkdir(`${tempDir}/templates`, { recursive: true });
      await Deno.mkdir(`${tempDir}/memory`, { recursive: true });

      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "preview", "Build REST API"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Spec Kit detected");
      assertStringIncludes(stdout, "Input: \"Build REST API\"");
    });
  });

  describe("execute command", () => {
    it("should fail without Spec Kit installation", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "execute", "Add feature"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 2);
      assertStringIncludes(stderr, "❌ Error: Spec Kit not detected");
      assertStringIncludes(stderr, "Required directories: scripts/, templates/, memory/");
    });

    it("should execute workflow with Spec Kit", async () => {
      // Create Spec Kit structure
      await Deno.mkdir(`${tempDir}/scripts`, { recursive: true });
      await Deno.mkdir(`${tempDir}/templates`, { recursive: true });
      await Deno.mkdir(`${tempDir}/memory`, { recursive: true });

      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "execute", "Build dashboard"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow");
      assertStringIncludes(stdout, "Input: \"Build dashboard\"");
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "📝 Phase 3: Task Breakdown");
    });
  });

  describe("help and version", () => {
    it("should show help text", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "--help"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Rampante - Spec Kit Automation");
      assertStringIncludes(stdout, "install");
      assertStringIncludes(stdout, "list");
      assertStringIncludes(stdout, "uninstall");
      assertStringIncludes(stdout, "preview");
      assertStringIncludes(stdout, "execute");
    });

    it("should show version", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "--version"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "0.2.0");
    });
  });
});