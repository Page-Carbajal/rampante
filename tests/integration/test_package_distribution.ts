import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { join } from "@std/path";

// Integration tests for package distribution system
// Tests the complete package creation, validation, and distribution workflow

describe("Package Distribution Integration", () => {
  let tempDir: string;
  let distDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
    distDir = join(tempDir, "dist");
    await Deno.mkdir(distDir, { recursive: true });
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
  });

  describe("package creation workflow", () => {
    it("should create complete distribution packages for all CLIs", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-distribution-packages",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--all-clis"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify package creation progress
      assertStringIncludes(stdout, "🏗️  Creating distribution packages for version 0.2.0");
      
      const expectedClis = ["gemini", "codex", "cursor", "claude-code"];
      
      for (const cli of expectedClis) {
        assertStringIncludes(stdout, `📦 Creating package: rampante-${cli}-0.2.0.zip`);
        assertStringIncludes(stdout, `✅ Package created: rampante-${cli}-0.2.0.zip`);
        assertStringIncludes(stdout, `🔒 Checksum: rampante-${cli}-0.2.0.zip.sha256`);
        
        // Verify actual files exist
        await Deno.stat(join(distDir, `rampante-${cli}-0.2.0.zip`));
        await Deno.stat(join(distDir, `rampante-${cli}-0.2.0.zip.sha256`));
      }

      assertStringIncludes(stdout, "📋 Creating release manifest");
      assertStringIncludes(stdout, "✅ All distribution packages created successfully");

      // Verify manifest file
      await Deno.stat(join(distDir, "release-manifest.json"));
    });

    it("should include correct package contents", async () => {
      // Create a single package to verify contents
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-single-package",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--extract-for-verification"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      // Verify package contents
      const packageDir = join(distDir, "rampante-gemini-0.2.0");
      
      // Essential files
      await Deno.stat(join(packageDir, "rampante.md")); // MD file
      await Deno.stat(join(packageDir, "rampante.toml")); // CLI config
      await Deno.stat(join(packageDir, "README.md")); // Instructions
      await Deno.stat(join(packageDir, "package.json")); // Package metadata
      
      // Verify content
      const readmeContent = await Deno.readTextFile(join(packageDir, "README.md"));
      assertStringIncludes(readmeContent, "# Rampante for Gemini CLI");
      assertStringIncludes(readmeContent, "Version: 0.2.0");
      assertStringIncludes(readmeContent, "## Installation");
      assertStringIncludes(readmeContent, "deno run -A --reload jsr:@page-carbajal/rampante install gemini");

      const packageJson = await Deno.readTextFile(join(packageDir, "package.json"));
      const pkg = JSON.parse(packageJson);
      assertEquals(pkg.name, "@page-carbajal/rampante-gemini");
      assertEquals(pkg.version, "0.2.0");
      assertEquals(pkg.cli, "gemini");
    });

    it("should generate valid checksums", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-and-verify",
          "--cli", "codex",
          "--version", "0.2.0",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔒 Generating checksum for rampante-codex-0.2.0.zip");

      // Verify checksum file
      const checksumFile = join(distDir, "rampante-codex-0.2.0.zip.sha256");
      const checksumContent = await Deno.readTextFile(checksumFile);
      
      // Should contain hash and filename
      const checksumPattern = /^[a-f0-9]{64}\s+rampante-codex-0\.2\.0\.zip$/;
      assert(checksumPattern.test(checksumContent.trim()), 
             `Checksum format invalid: ${checksumContent}`);

      // Verify checksum is correct
      assertStringIncludes(stdout, "✅ Checksum verification: passed");
    });

    it("should create release manifest with correct metadata", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-packages-and-manifest",
          "--version", "0.2.1",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const manifestFile = join(distDir, "release-manifest.json");
      const manifestContent = await Deno.readTextFile(manifestFile);
      const manifest = JSON.parse(manifestContent);

      // Verify manifest structure
      assertEquals(manifest.version, "0.2.1");
      assert(manifest.releaseDate);
      assertEquals(Array.isArray(manifest.packages), true);
      assertEquals(manifest.packages.length, 4);

      // Verify package entries
      const clis = ["gemini", "codex", "cursor", "claude-code"];
      for (const cli of clis) {
        const pkg = manifest.packages.find((p: any) => p.cli === cli);
        assert(pkg, `Package entry for ${cli} should exist`);
        assertEquals(pkg.version, "0.2.1");
        assertStringIncludes(pkg.downloadUrl, `rampante-${cli}-0.2.1.zip`);
        assert(pkg.checksum.startsWith("sha256:"));
        assert(typeof pkg.size === "number");
        assert(pkg.size > 0);
      }

      assertEquals(manifest.minimumSpecKitVersion, "1.0.0");
    });
  });

  describe("package validation", () => {
    it("should validate package integrity", async () => {
      // First create a package
      const createCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-single-package",
          "--cli", "cursor",
          "--version", "0.2.0",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      await createCmd.output();

      // Then validate it
      const validateCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-package",
          "--package", join(distDir, "rampante-cursor-0.2.0.zip"),
          "--checksum-file", join(distDir, "rampante-cursor-0.2.0.zip.sha256")
        ],
        cwd: tempDir,
      });

      const result = await validateCmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating package: rampante-cursor-0.2.0.zip");
      assertStringIncludes(stdout, "✅ Package structure: valid");
      assertStringIncludes(stdout, "✅ Required files: present");
      assertStringIncludes(stdout, "✅ File integrity: verified");
      assertStringIncludes(stdout, "✅ Checksum validation: passed");
      assertStringIncludes(stdout, "✅ Size validation: within limits");
      assertStringIncludes(stdout, "✅ Package validation: successful");
    });

    it("should enforce package size limits", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-all-packages",
          "--directory", distDir,
          "--max-size", "1048576" // 1MB limit
        ],
        cwd: tempDir,
      });

      // First create some packages
      const createCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-distribution-packages",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--clis", "gemini,codex"
        ],
        cwd: tempDir,
      });

      await createCmd.output();

      // Then validate sizes
      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "📏 Validating package sizes");
      assertStringIncludes(stdout, "✅ rampante-gemini-0.2.0.zip: within limit");
      assertStringIncludes(stdout, "✅ rampante-codex-0.2.0.zip: within limit");
      assertStringIncludes(stdout, "✅ All packages within size limit: < 1MB");
    });

    it("should detect corrupted packages", async () => {
      // Create a valid package first
      const createCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-single-package",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      await createCmd.output();

      // Corrupt the package by overwriting with invalid content
      const packagePath = join(distDir, "rampante-gemini-0.2.0.zip");
      await Deno.writeTextFile(packagePath, "corrupted content");

      // Validate the corrupted package
      const validateCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-package",
          "--package", packagePath,
          "--checksum-file", join(distDir, "rampante-gemini-0.2.0.zip.sha256")
        ],
        cwd: tempDir,
      });

      const result = await validateCmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Package validation failed");
      assertStringIncludes(stderr, "Checksum mismatch");
      assertStringIncludes(stderr, "Expected:");
      assertStringIncludes(stderr, "Actual:");
    });
  });

  describe("distribution workflow", () => {
    it("should simulate complete GitHub release workflow", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--simulate-github-release",
          "--version", "0.2.0",
          "--repository", "page-carbajal/rampante",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🚀 Simulating GitHub release workflow");
      assertStringIncludes(stdout, "📋 Creating release: v0.2.0");
      assertStringIncludes(stdout, "📦 Uploading assets:");
      
      const clis = ["gemini", "codex", "cursor", "claude-code"];
      for (const cli of clis) {
        assertStringIncludes(stdout, `- rampante-${cli}-0.2.0.zip`);
        assertStringIncludes(stdout, `- rampante-${cli}-0.2.0.zip.sha256`);
      }
      
      assertStringIncludes(stdout, "- release-manifest.json");
      assertStringIncludes(stdout, "✅ Release simulation: successful");
      assertStringIncludes(stdout, "🌐 Download URLs would be available at:");
      assertStringIncludes(stdout, "https://github.com/page-carbajal/rampante/releases/download/v0.2.0/");
    });

    it("should generate proper download URLs", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--generate-download-urls",
          "--version", "0.2.0",
          "--repository", "page-carbajal/rampante"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      const clis = ["gemini", "codex", "cursor", "claude-code"];
      for (const cli of clis) {
        const expectedUrl = `https://github.com/page-carbajal/rampante/releases/download/v0.2.0/rampante-${cli}-0.2.0.zip`;
        assertStringIncludes(stdout, expectedUrl);
      }

      assertStringIncludes(stdout, "📋 Manifest URL: https://github.com/page-carbajal/rampante/releases/download/v0.2.0/release-manifest.json");
    });

    it("should validate download URL accessibility", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-download-urls",
          "--version", "0.2.0",
          "--repository", "page-carbajal/rampante",
          "--simulate-http-check"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔗 Validating download URL accessibility");
      assertStringIncludes(stdout, "✅ All URLs: simulated HTTP 200 response");
      assertStringIncludes(stdout, "✅ CDN propagation: simulated successful");
      assertStringIncludes(stdout, "✅ Download validation: passed");
    });
  });

  describe("package distribution errors", () => {
    it("should handle template generation failures", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-distribution-packages",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--simulate-template-failure", "cursor"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 0); // Should continue with other CLIs
      
      // Successful packages
      assertStringIncludes(stdout, "✅ Package created: rampante-gemini-0.2.0.zip");
      assertStringIncludes(stdout, "✅ Package created: rampante-codex-0.2.0.zip");
      assertStringIncludes(stdout, "✅ Package created: rampante-claude-code-0.2.0.zip");
      
      // Failed package
      assertStringIncludes(stderr, "❌ Template generation failed for cursor");
      assertStringIncludes(stderr, "Skipping cursor package creation");
      
      // Partial success summary
      assertStringIncludes(stdout, "⚠️  Partial success: 3/4 packages created");
      assertStringIncludes(stdout, "Failed packages can be regenerated individually");
    });

    it("should handle insufficient disk space", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-distribution-packages",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--simulate-disk-full"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Package creation failed: insufficient disk space");
      assertStringIncludes(stderr, "Available space:");
      assertStringIncludes(stderr, "Required space:");
      assertStringIncludes(stderr, "Free up disk space and retry");
    });

    it("should recover from network failures during upload simulation", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--simulate-github-release",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--simulate-network-failure",
          "--retry-on-failure"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "⚠️  Network failure detected - retrying");
      assertStringIncludes(stdout, "🔄 Retry attempt 1/3");
      assertStringIncludes(stdout, "🔄 Retry attempt 2/3");
      assertStringIncludes(stdout, "✅ Upload successful on retry");
      assertStringIncludes(stdout, "✅ Release created successfully after recovery");
    });
  });

  describe("performance and scalability", () => {
    it("should create packages within performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--performance-test",
          "--create-distribution-packages",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--all-clis"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should complete within reasonable time (target: <30s per CLI)
      assert(duration < 120000, `Package creation took ${duration}ms, should be <120s for 4 CLIs`);
    });

    it("should handle concurrent package operations", async () => {
      const versions = ["0.2.0", "0.2.1", "0.2.2"];
      
      const promises = versions.map(version => {
        const versionDir = join(distDir, version);
        Deno.mkdir(versionDir, { recursive: true });
        
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/package_service.ts",
            "--create-distribution-packages",
            "--version", version,
            "--output-dir", versionDir,
            "--cli", "gemini" // Single CLI for faster testing
          ],
          cwd: tempDir,
        });
        return cmd.output();
      });

      const results = await Promise.all(promises);

      // All package operations should succeed
      for (const result of results) {
        assertEquals(result.code, 0);
      }

      // Verify no conflicts occurred
      for (const version of versions) {
        await Deno.stat(join(distDir, version, `rampante-gemini-${version}.zip`));
      }
    });

    it("should optimize package compression", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-optimized-package",
          "--cli", "gemini",
          "--version", "0.2.0",
          "--output-dir", distDir,
          "--compression-level", "9"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "📦 Creating optimized package");
      assertStringIncludes(stdout, "🗜️  Compression level: 9 (maximum)");
      assertStringIncludes(stdout, "✅ Package optimization: completed");
      assertStringIncludes(stdout, "💾 Size reduction:");
      
      // Verify optimized package exists and has reasonable size
      const packagePath = join(distDir, "rampante-gemini-0.2.0.zip");
      const stat = await Deno.stat(packagePath);
      assert(stat.size > 0 && stat.size < 1048576, // Should be reasonable size < 1MB
             `Package size ${stat.size} should be reasonable`);
    });
  });

  describe("manifest management", () => {
    it("should update manifest for incremental releases", async () => {
      // Create initial release manifest
      const initialCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-packages-and-manifest",
          "--version", "0.2.0",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      await initialCmd.output();

      // Update manifest for new version
      const updateCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--update-manifest",
          "--new-version", "0.2.1",
          "--manifest", join(distDir, "release-manifest.json"),
          "--add-packages", join(distDir, "rampante-gemini-0.2.1.zip")
        ],
        cwd: tempDir,
      });

      // First create the new package
      const newPackageCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--create-single-package",
          "--cli", "gemini",
          "--version", "0.2.1",
          "--output-dir", distDir
        ],
        cwd: tempDir,
      });

      await newPackageCmd.output();

      const result = await updateCmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "📋 Updating release manifest");
      assertStringIncludes(stdout, "🆕 Adding version 0.2.1 packages");
      assertStringIncludes(stdout, "✅ Manifest updated successfully");

      // Verify updated manifest
      const manifestContent = await Deno.readTextFile(join(distDir, "release-manifest.json"));
      const manifest = JSON.parse(manifestContent);
      
      // Should contain both versions
      const geminiPackages = manifest.packages.filter((p: any) => p.cli === "gemini");
      const versions = geminiPackages.map((p: any) => p.version);
      assert(versions.includes("0.2.0") && versions.includes("0.2.1"));
    });

    it("should validate manifest consistency", async () => {
      // Create manifest
      await Deno.writeTextFile(
        join(distDir, "test-manifest.json"),
        JSON.stringify({
          version: "0.2.0",
          releaseDate: new Date().toISOString(),
          packages: [
            {
              cli: "gemini",
              version: "0.2.0",
              downloadUrl: "https://example.com/rampante-gemini-0.2.0.zip",
              checksum: "sha256:invalid-checksum-for-testing",
              size: 150000
            }
          ],
          minimumSpecKitVersion: "1.0.0"
        }, null, 2)
      );

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/package_service.ts",
          "--validate-manifest-consistency",
          "--manifest", join(distDir, "test-manifest.json")
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating manifest consistency");
      assertStringIncludes(stdout, "✅ Manifest format: valid");
      assertStringIncludes(stdout, "✅ Package entries: complete");
      assertStringIncludes(stdout, "✅ URL format: valid");
      assertStringIncludes(stdout, "✅ Version consistency: verified");
    });
  });
});