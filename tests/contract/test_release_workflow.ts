import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

// Contract tests for release workflow API
// Based on: specs/001-feature-rampante-slash/contracts/release-workflow-contract.md

describe("Release Workflow Contract", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
  });

  describe("version management", () => {
    it("should detect version changes from deno.json", async () => {
      // Create mock deno.json with version
      await Deno.writeTextFile(
        `${tempDir}/deno.json`,
        JSON.stringify({ version: "0.2.0" }, null, 2)
      );

      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/services/version_service.ts", "--check-version"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Current version: 0.2.0");
      assertStringIncludes(stdout, "Version format: valid semantic version");
    });

    it("should validate semantic versioning format", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/services/version_service.ts", "--validate", "0.2.0"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Valid semantic version: 0.2.0");
    });

    it("should reject invalid version formats", async () => {
      const cmd = new Deno.Command("deno", {
        args: ["run", "-A", "src/services/version_service.ts", "--validate", "invalid-version"],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Invalid semantic version: invalid-version");
      assertStringIncludes(stderr, "Expected format: MAJOR.MINOR.PATCH");
    });

    it("should support PR label-based version increment", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/version_service.ts",
          "--increment", "0.2.0",
          "--type", "minor"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Previous: 0.2.0");
      assertStringIncludes(stdout, "New: 0.3.0");
      assertStringIncludes(stdout, "Increment type: minor");
    });
  });

  describe("template generation", () => {
    it("should generate CLI-specific templates in parallel", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-all",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify parallel generation for all CLIs
      const clis = ["gemini", "codex", "cursor", "claude-code"];
      for (const cli of clis) {
        assertStringIncludes(stdout, `✅ ${cli}: Template generated successfully`);
        assertStringIncludes(stdout, `✅ ${cli}: Validation passed`);
      }
      
      assertStringIncludes(stdout, "🎉 All CLI templates generated successfully");
    });

    it("should validate template syntax for each CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-templates",
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ TOML syntax validation: passed");
      assertStringIncludes(stdout, "✅ Required fields: complete");
      assertStringIncludes(stdout, "✅ CLI compatibility: verified");
    });

    it("should handle template generation failures gracefully", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-all",
          "--simulate-failure", "cursor"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 0); // Should continue with other CLIs
      assertStringIncludes(stdout, "✅ gemini: Template generated successfully");
      assertStringIncludes(stdout, "✅ codex: Template generated successfully");
      assertStringIncludes(stderr, "❌ cursor: Template generation failed");
      assertStringIncludes(stdout, "✅ claude-code: Template generated successfully");
      assertStringIncludes(stdout, "⚠️  Partial success: 3/4 CLIs completed");
    });
  });

  describe("package creation", () => {
    it("should create distribution packages for each CLI", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-packages",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify package creation for all CLIs
      const clis = ["gemini", "codex", "cursor", "claude-code"];
      for (const cli of clis) {
        assertStringIncludes(stdout, `📦 Creating package: rampante-${cli}-0.2.0.zip`);
        assertStringIncludes(stdout, `✅ Package created: rampante-${cli}-0.2.0.zip`);
        assertStringIncludes(stdout, `🔒 Checksum: rampante-${cli}-0.2.0.zip.sha256`);
      }
    });

    it("should validate package contents", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-package",
          "--file", "rampante-gemini-0.2.0.zip"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Package structure: valid");
      assertStringIncludes(stdout, "✅ Required files: present");
      assertStringIncludes(stdout, "✅ File integrity: verified");
      assertStringIncludes(stdout, "✅ Size validation: passed");
    });

    it("should enforce package size limits", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-size",
          "--max-size", "1048576" // 1MB
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ All packages within size limit: < 1MB");
    });

    it("should handle package creation failures", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-packages",
          "--simulate-failure", "codex"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Package creation failed: codex");
      assertStringIncludes(stderr, "Recovery options:");
      assertStringIncludes(stderr, "1. Retry up to 3 times");
      assertStringIncludes(stderr, "2. Log detailed error context");
      assertStringIncludes(stderr, "3. Abort if critical CLI fails");
    });
  });

  describe("release publication", () => {
    it("should create release manifest", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--create-manifest",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "📋 Creating release manifest");
      assertStringIncludes(stdout, "✅ Manifest created: release-manifest.json");
      
      // Check if manifest file exists and has correct structure
      const manifestExists = await Deno.stat(`${tempDir}/release-manifest.json`)
        .then(() => true)
        .catch(() => false);
      assertEquals(manifestExists, true);
    });

    it("should validate release manifest format", async () => {
      // Create mock manifest
      const manifest = {
        version: "0.2.0",
        releaseDate: new Date().toISOString(),
        packages: [
          {
            cli: "gemini",
            version: "0.2.0",
            downloadUrl: "https://github.com/test/releases/download/v0.2.0/rampante-gemini-0.2.0.zip",
            checksum: "sha256:abc123",
            size: 148654
          }
        ],
        minimumSpecKitVersion: "1.0.0"
      };
      
      await Deno.writeTextFile(
        `${tempDir}/test-manifest.json`,
        JSON.stringify(manifest, null, 2)
      );

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--validate-manifest",
          "--file", `${tempDir}/test-manifest.json`
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "✅ Manifest format: valid");
      assertStringIncludes(stdout, "✅ Package entries: complete");
      assertStringIncludes(stdout, "✅ Version consistency: verified");
      assertStringIncludes(stdout, "✅ URL format: valid");
    });

    it("should generate proper GitHub release structure", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--simulate-release",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🏷️  Tag: v0.2.0 (created automatically)");
      assertStringIncludes(stdout, "📦 Assets:");
      assertStringIncludes(stdout, "- rampante-gemini-0.2.0.zip");
      assertStringIncludes(stdout, "- rampante-codex-0.2.0.zip");
      assertStringIncludes(stdout, "- rampante-cursor-0.2.0.zip");
      assertStringIncludes(stdout, "- rampante-claude-code-0.2.0.zip");
      assertStringIncludes(stdout, "- release-manifest.json");
      assertStringIncludes(stdout, "- CHECKSUMS.txt");
    });
  });

  describe("error handling", () => {
    it("should handle partial release failures", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--simulate-partial-failure",
          "--failed-clis", "cursor,claude-code"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 0); // Partial success
      assertStringIncludes(stdout, "Release Status: Partial Success");
      assertStringIncludes(stdout, "✅ gemini: Package created successfully");
      assertStringIncludes(stdout, "✅ codex: Package created successfully");
      assertStringIncludes(stderr, "❌ cursor: Template validation failed");
      assertStringIncludes(stderr, "❌ claude-code: Package creation failed");
      assertStringIncludes(stdout, "Actions Taken:");
      assertStringIncludes(stdout, "- Released available packages");
      assertStringIncludes(stdout, "- Updated manifest to reflect available packages only");
    });

    it("should provide rollback procedures", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--rollback-info",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔄 Rollback Procedure for v0.2.0");
      assertStringIncludes(stdout, "# Emergency rollback");
      assertStringIncludes(stdout, "gh release delete v0.2.0 --yes");
      assertStringIncludes(stdout, "git tag -d v0.2.0");
      assertStringIncludes(stdout, "git push origin :refs/tags/v0.2.0");
      assertStringIncludes(stdout, "# Patch release");
      assertStringIncludes(stdout, "git checkout -b hotfix/critical-fix");
    });
  });

  describe("performance requirements", () => {
    it("should complete within performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--performance-test",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Performance targets from contract
      assertStringIncludes(stdout, "⏱️  Performance Results:");
      assertStringIncludes(stdout, "Template generation: <30s per CLI");
      assertStringIncludes(stdout, "Package creation: <30s per CLI");
      assertStringIncludes(stdout, "Total workflow: <5 minutes");
      
      // Should complete in reasonable time for tests
      assertEquals(duration < 30000, true); // 30 seconds max for test
    });

    it("should validate download availability", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/release_service.ts",
          "--validate-urls",
          "--version", "0.2.0"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔗 URL Validation Results:");
      assertStringIncludes(stdout, "✅ All download URLs return HTTP 200");
      assertStringIncludes(stdout, "✅ Checksums match uploaded files");
      assertStringIncludes(stdout, "✅ CDN availability: < 60 seconds");
    });
  });
});