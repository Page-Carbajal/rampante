import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { join } from "@std/path";

// Integration tests for CLI installation flow
// Tests the complete installation workflow from detection to verification

describe("CLI Installation Integration", () => {
  let tempDir: string;
  let homeDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
    homeDir = await Deno.makeTempDir();
    
    // Set HOME environment variable for testing
    Deno.env.set("HOME", homeDir);
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
    await Deno.remove(homeDir, { recursive: true });
    Deno.env.delete("HOME");
  });

  describe("end-to-end installation workflow", () => {
    it("should complete full installation for Gemini CLI", async () => {
      // Step 1: CLI Detection
      const detectCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/services/cli_detection_service.ts", "--detect", "gemini"],
        cwd: tempDir,
      });

      const detectResult = await detectCmd.output();
      assertEquals(detectResult.code, 0);

      // Step 2: Package Download
      const downloadCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/download_service.ts",
          "--download-package",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output", tempDir
        ],
        cwd: tempDir,
      });

      const downloadResult = await downloadCmd.output();
      assertEquals(downloadResult.code, 0);

      // Verify package was downloaded
      const packagePath = join(tempDir, "rampante-gemini-0.2.0.zip");
      await Deno.stat(packagePath); // Should not throw

      // Step 3: Package Extraction and Installation
      const installCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/installation_service.ts",
          "--install-package",
          "--package", packagePath,
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const installResult = await installCmd.output();
      const installOutput = new TextDecoder().decode(installResult.stdout);

      assertEquals(installResult.code, 0);
      assertStringIncludes(installOutput, "✅ Package extracted successfully");
      assertStringIncludes(installOutput, "✅ Gemini CLI configuration installed");
      assertStringIncludes(installOutput, ".gemini/commands/rampante.toml");

      // Step 4: Installation Verification
      const verifyCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list", "--json"],
        cwd: tempDir,
      });

      const verifyResult = await verifyCmd.output();
      const verifyOutput = new TextDecoder().decode(verifyResult.stdout);

      assertEquals(verifyResult.code, 0);
      
      const status = JSON.parse(verifyOutput);
      const geminiCli = status.clis.find((cli: any) => cli.name === "gemini");
      assertEquals(geminiCli.installed, true);
      assertEquals(geminiCli.version, "0.2.0");
    });

    it("should handle installation rollback on failure", async () => {
      // Simulate installation failure by creating invalid package
      const invalidPackage = join(tempDir, "invalid-package.zip");
      await Deno.writeTextFile(invalidPackage, "invalid content");

      const installCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/installation_service.ts",
          "--install-package",
          "--package", invalidPackage,
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const result = await installCmd.output();
      const output = new TextDecoder().decode(result.stdout);
      const error = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(error, "❌ Package extraction failed");
      assertStringIncludes(output, "🔄 Rolling back installation");
      assertStringIncludes(output, "✅ Rollback completed successfully");

      // Verify no partial installation remains
      const geminiDir = join(homeDir, ".gemini");
      const exists = await Deno.stat(geminiDir).then(() => true).catch(() => false);
      assertEquals(exists, false);
    });

    it("should support dry-run installation preview", async () => {
      const dryRunCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "codex", "--dry-run"],
        cwd: tempDir,
      });

      const result = await dryRunCmd.output();
      const output = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(output, "DRY RUN: Install simulation for Codex CLI");
      assertStringIncludes(output, "Would download package from:");
      assertStringIncludes(output, "Would create directory: ~/.codex/prompts/");
      assertStringIncludes(output, "Would install: rampante.md");
      assertStringIncludes(output, "Would update CLI configuration");
      assertStringIncludes(output, "No files were modified");
    });
  });

  describe("multi-CLI installation", () => {
    it("should install multiple CLIs in sequence", async () => {
      const clis = ["gemini", "codex"];
      const results: boolean[] = [];

      for (const cli of clis) {
        const installCmd = new Deno.Command("deno", {
          args: ["run", "-A", "src/cli/main.ts", "install", cli],
          cwd: tempDir,
        });

        const result = await installCmd.output();
        results.push(result.code === 0);
      }

      // Verify all installations succeeded
      assertEquals(results.every(r => r), true);

      // Verify status shows both CLIs installed
      const statusCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list", "--json"],
        cwd: tempDir,
      });

      const statusResult = await statusCmd.output();
      const status = JSON.parse(new TextDecoder().decode(statusResult.stdout));

      const installedCount = status.clis.filter((cli: any) => cli.installed).length;
      assertEquals(installedCount, 2);
    });

    it("should handle partial installation failures gracefully", async () => {
      // Install first CLI successfully
      const geminiCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini"],
        cwd: tempDir,
      });

      const geminiResult = await geminiCmd.output();
      assertEquals(geminiResult.code, 0);

      // Simulate failure for second CLI by removing internet connectivity
      const codexCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/cli/main.ts", "install", "codex",
          "--simulate-network-failure"
        ],
        cwd: tempDir,
      });

      const codexResult = await codexCmd.output();
      const codexError = new TextDecoder().decode(codexResult.stderr);

      assertEquals(codexResult.code, 1);
      assertStringIncludes(codexError, "❌ Failed to download package for codex");

      // Verify first installation is still intact
      const statusCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list"],
        cwd: tempDir,
      });

      const statusResult = await statusCmd.output();
      const statusOutput = new TextDecoder().decode(statusResult.stdout);

      assertStringIncludes(statusOutput, "✅ gemini      - Installed");
      assertStringIncludes(statusOutput, "❌ codex       - Not installed");
    });
  });

  describe("installation validation", () => {
    it("should validate package integrity during installation", async () => {
      const validationCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/installation_service.ts",
          "--validate-integrity",
          "--package", "test-package.zip",
          "--expected-checksum", "invalid-checksum"
        ],
        cwd: tempDir,
      });

      // Create test package
      await Deno.writeTextFile(join(tempDir, "test-package.zip"), "test content");

      const result = await validationCmd.output();
      const error = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(error, "❌ Package integrity validation failed");
      assertStringIncludes(error, "Expected checksum:");
      assertStringIncludes(error, "Actual checksum:");
    });

    it("should verify CLI compatibility before installation", async () => {
      const compatCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/installation_service.ts",
          "--check-compatibility",
          "--cli", "gemini",
          "--package-version", "0.2.0",
          "--cli-version", "unknown"
        ],
        cwd: tempDir,
      });

      const result = await compatCmd.output();
      const output = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(output, "🔍 Checking CLI compatibility");
      assertStringIncludes(output, "CLI: gemini");
      assertStringIncludes(output, "Package version: 0.2.0");
      // Should handle unknown CLI version gracefully
      assertStringIncludes(output, "⚠️  CLI version unknown - proceeding with installation");
    });

    it("should validate MD file generation after installation", async () => {
      // Install CLI first
      const installCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini"],
        cwd: tempDir,
      });

      await installCmd.output();

      // Validate MD file was generated correctly
      const validateCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/md_file_service.ts",
          "--validate-generated",
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const result = await validateCmd.output();
      const output = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(output, "✅ MD file structure: valid");
      assertStringIncludes(output, "✅ Preview mode logic: present");
      assertStringIncludes(output, "✅ Execution mode logic: present");
      assertStringIncludes(output, "✅ Spec Kit mappings: complete");
      assertStringIncludes(output, "✅ CLI adaptations: configured");
    });
  });

  describe("uninstallation workflow", () => {
    it("should cleanly uninstall CLI integration", async () => {
      // Install first
      const installCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "cursor"],
        cwd: tempDir,
      });

      await installCmd.output();

      // Verify installation
      const cursorDir = join(homeDir, ".cursor", "commands");
      await Deno.stat(cursorDir); // Should exist

      // Uninstall
      const uninstallCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "uninstall", "cursor"],
        cwd: tempDir,
      });

      const result = await uninstallCmd.output();
      const output = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(output, "🗑️  Removing Cursor CLI integration");
      assertStringIncludes(output, "✅ Removed: .cursor/commands/rampante.yaml");
      assertStringIncludes(output, "✅ Removed: rampante.md");
      assertStringIncludes(output, "✅ Successfully uninstalled Rampante from Cursor CLI");

      // Verify cleanup
      const configExists = await Deno.stat(join(cursorDir, "rampante.yaml"))
        .then(() => true)
        .catch(() => false);
      assertEquals(configExists, false);
    });

    it("should handle uninstall of non-installed CLI gracefully", async () => {
      const uninstallCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "uninstall", "claude-code"],
        cwd: tempDir,
      });

      const result = await uninstallCmd.output();
      const output = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(output, "ℹ️  Rampante was not installed for Claude Code CLI");
      assertStringIncludes(output, "Nothing to remove");
    });
  });

  describe("installation recovery", () => {
    it("should recover from corrupted installation", async () => {
      // Install normally
      const installCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini"],
        cwd: tempDir,
      });

      await installCmd.output();

      // Corrupt the installation by removing key file
      const configPath = join(homeDir, ".gemini", "commands", "rampante.toml");
      await Deno.remove(configPath).catch(() => {}); // Ignore if already missing

      // Attempt to use corrupted installation
      const listCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "list"],
        cwd: tempDir,
      });

      const listResult = await listCmd.output();
      const output = new TextDecoder().decode(listResult.stdout);

      assertEquals(listResult.code, 0);
      assertStringIncludes(output, "⚠️  gemini      - Installation corrupted");

      // Recover with reinstall
      const recoveryCmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/cli/main.ts", "install", "gemini", "--force"],
        cwd: tempDir,
      });

      const recoveryResult = await recoveryCmd.output();
      const recoveryOutput = new TextDecoder().decode(recoveryResult.stdout);

      assertEquals(recoveryResult.code, 0);
      assertStringIncludes(recoveryOutput, "🔄 Existing installation detected - replacing");
      assertStringIncludes(recoveryOutput, "✅ Recovery installation completed");

      // Verify recovery
      await Deno.stat(configPath); // Should exist again
    });
  });
});