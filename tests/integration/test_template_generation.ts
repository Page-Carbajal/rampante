import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { join } from "@std/path";

// Integration tests for template generation system
// Tests the complete template processing pipeline for all CLI formats

describe("Template Generation Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
  });

  describe("multi-CLI template generation", () => {
    it("should generate templates for all supported CLIs", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-all-cli-templates",
          "--version", "0.2.0",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);

      // Verify all CLI templates were generated
      const expectedClis = ["gemini", "codex", "cursor", "claude-code"];
      
      for (const cli of expectedClis) {
        assertStringIncludes(stdout, `✅ ${cli}: Template generated successfully`);
        assertStringIncludes(stdout, `✅ ${cli}: Validation passed`);
        
        // Verify template files exist
        const templateDir = join(tempDir, cli);
        await Deno.stat(templateDir); // Should not throw
      }

      assertStringIncludes(stdout, "🎉 All CLI templates generated successfully");
      assertStringIncludes(stdout, "Generated templates: 4/4");
    });

    it("should generate format-specific configuration files", async () => {
      const formatTests = [
        { cli: "gemini", extension: "toml", pattern: "[command.rampante]" },
        { cli: "codex", extension: "md", pattern: "# /rampante" },
        { cli: "cursor", extension: "yaml", pattern: "commands:" },
        { cli: "claude-code", extension: "json", pattern: '"rampante"' }
      ];

      for (const test of formatTests) {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/template_service.ts",
            "--generate-cli-config",
            "--cli", test.cli,
            "--output-dir", tempDir
          ],
          cwd: tempDir,
        });

        const result = await cmd.output();
        assertEquals(result.code, 0);

        // Verify config file exists and has correct format
        const configFile = join(tempDir, `rampante.${test.extension}`);
        await Deno.stat(configFile);

        const content = await Deno.readTextFile(configFile);
        assertStringIncludes(content, test.pattern);
      }
    });

    it("should handle template generation with custom parameters", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-cli-templates",
          "--clis", "gemini,cursor",
          "--version", "0.3.0",
          "--custom-description", "Custom Spec Kit automation tool",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "Using custom description: Custom Spec Kit automation tool");
      assertStringIncludes(stdout, "Version: 0.3.0");
      assertStringIncludes(stdout, "✅ gemini: Template generated successfully");
      assertStringIncludes(stdout, "✅ cursor: Template generated successfully");

      // Verify custom content is included
      const geminiConfig = await Deno.readTextFile(join(tempDir, "gemini", "rampante.toml"));
      assertStringIncludes(geminiConfig, "Custom Spec Kit automation tool");
      assertStringIncludes(geminiConfig, "0.3.0");
    });
  });

  describe("template validation", () => {
    it("should validate TOML template syntax", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-template",
          "--cli", "gemini",
          "--format", "toml"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating Gemini TOML template");
      assertStringIncludes(stdout, "✅ TOML syntax: valid");
      assertStringIncludes(stdout, "✅ Required sections: present");
      assertStringIncludes(stdout, "✅ Command configuration: complete");
      assertStringIncludes(stdout, "✅ File references: valid");
    });

    it("should validate Markdown template structure", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-template",
          "--cli", "codex",
          "--format", "md"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating Codex Markdown template");
      assertStringIncludes(stdout, "✅ Markdown syntax: valid");
      assertStringIncludes(stdout, "✅ Header structure: correct");
      assertStringIncludes(stdout, "✅ Code blocks: properly formatted");
      assertStringIncludes(stdout, "✅ Links and references: valid");
    });

    it("should validate YAML template structure", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-template",
          "--cli", "cursor",
          "--format", "yaml"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating Cursor YAML template");
      assertStringIncludes(stdout, "✅ YAML syntax: valid");
      assertStringIncludes(stdout, "✅ Schema compliance: verified");
      assertStringIncludes(stdout, "✅ Command structure: correct");
      assertStringIncludes(stdout, "✅ Flag support: configured");
    });

    it("should validate JSON template structure", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-template",
          "--cli", "claude-code",
          "--format", "json"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Validating Claude Code JSON template");
      assertStringIncludes(stdout, "✅ JSON syntax: valid");
      assertStringIncludes(stdout, "✅ Schema validation: passed");
      assertStringIncludes(stdout, "✅ Command configuration: complete");
      assertStringIncludes(stdout, "✅ Mode definitions: valid");
    });

    it("should detect and report template validation errors", async () => {
      // Create invalid template file
      const invalidTemplate = join(tempDir, "invalid.toml");
      await Deno.writeTextFile(invalidTemplate, `
[invalid-section
missing = "closing bracket"
description = incomplete
      `);

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--validate-file",
          "--file", invalidTemplate,
          "--format", "toml"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Template validation failed");
      assertStringIncludes(stderr, "Syntax error in TOML file");
      assertStringIncludes(stderr, "Line");
      assertStringIncludes(stderr, "missing closing bracket");
    });
  });

  describe("template processing pipeline", () => {
    it("should process templates with variable substitution", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--process-template",
          "--cli", "gemini",
          "--variables", JSON.stringify({
            version: "0.4.0",
            description: "Test automation tool",
            author: "Test Suite",
            features: ["preview", "execution", "validation"]
          }),
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔄 Processing template with variables");
      assertStringIncludes(stdout, "✅ Variable substitution: completed");
      assertStringIncludes(stdout, "✅ Template processing: successful");

      // Verify variables were substituted
      const processedFile = join(tempDir, "rampante.toml");
      const content = await Deno.readTextFile(processedFile);
      
      assertStringIncludes(content, "0.4.0");
      assertStringIncludes(content, "Test automation tool");
      assertStringIncludes(content, "Test Suite");
    });

    it("should handle conditional template sections", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--process-conditional-template",
          "--cli", "codex",
          "--conditions", JSON.stringify({
            enablePreview: true,
            enableExecution: true,
            enableDebug: false,
            supportedFlags: ["--dry-run", "--verbose"]
          }),
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const processedFile = join(tempDir, "rampante.md");
      const content = await Deno.readTextFile(processedFile);

      // Verify conditional sections
      assertStringIncludes(content, "## Preview Mode"); // enablePreview: true
      assertStringIncludes(content, "## Execution Mode"); // enableExecution: true
      assert(!content.includes("## Debug Mode")); // enableDebug: false
      assertStringIncludes(content, "--dry-run");
      assertStringIncludes(content, "--verbose");
    });

    it("should generate MD files alongside configuration files", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-complete-package",
          "--cli", "cursor",
          "--version", "0.2.0",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "📦 Generating complete package for Cursor CLI");
      assertStringIncludes(stdout, "✅ Configuration file: generated");
      assertStringIncludes(stdout, "✅ Markdown file: generated");
      assertStringIncludes(stdout, "✅ Package structure: validated");

      // Verify both files exist
      await Deno.stat(join(tempDir, "rampante.yaml")); // Config file
      await Deno.stat(join(tempDir, "rampante.md")); // MD file

      // Verify config references MD file
      const configContent = await Deno.readTextFile(join(tempDir, "rampante.yaml"));
      assertStringIncludes(configContent, "file: \"rampante.md\"");
    });
  });

  describe("template compatibility testing", () => {
    it("should test CLI compatibility for generated templates", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--test-cli-compatibility",
          "--cli", "gemini",
          "--simulate-cli-environment"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🧪 Testing Gemini CLI compatibility");
      assertStringIncludes(stdout, "✅ Template format: compatible");
      assertStringIncludes(stdout, "✅ Command registration: successful");
      assertStringIncludes(stdout, "✅ Flag parsing: working");
      assertStringIncludes(stdout, "✅ File execution: functional");
      assertStringIncludes(stdout, "✅ Gemini CLI integration: fully compatible");
    });

    it("should verify cross-CLI consistency", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--verify-cross-cli-consistency",
          "--generate-all",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Verifying cross-CLI consistency");
      assertStringIncludes(stdout, "✅ Command behavior: consistent");
      assertStringIncludes(stdout, "✅ Flag support: unified");
      assertStringIncludes(stdout, "✅ Output format: standardized");
      assertStringIncludes(stdout, "✅ Error handling: harmonized");
      assertStringIncludes(stdout, "✅ Cross-CLI consistency: verified");
    });

    it("should validate template version compatibility", async () => {
      const versions = ["0.1.0", "0.2.0", "0.3.0"];

      for (const version of versions) {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/template_service.ts",
            "--validate-version-compatibility",
            "--version", version,
            "--cli", "all"
          ],
          cwd: tempDir,
        });

        const result = await cmd.output();
        const stdout = new TextDecoder().decode(result.stdout);

        assertEquals(result.code, 0);
        assertStringIncludes(stdout, `✅ Version ${version}: compatible with all CLIs`);
      }
    });
  });

  describe("template error handling", () => {
    it("should handle missing template files gracefully", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-from-template",
          "--template", "non-existent-template.toml",
          "--cli", "gemini"
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 1);
      assertStringIncludes(stderr, "❌ Template file not found");
      assertStringIncludes(stderr, "non-existent-template.toml");
      assertStringIncludes(stderr, "Available templates:");
    });

    it("should recover from partial template generation failures", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-all-cli-templates",
          "--simulate-partial-failure",
          "--failed-clis", "cursor",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 0); // Should continue with other CLIs
      
      // Successful generations
      assertStringIncludes(stdout, "✅ gemini: Template generated successfully");
      assertStringIncludes(stdout, "✅ codex: Template generated successfully");
      assertStringIncludes(stdout, "✅ claude-code: Template generated successfully");
      
      // Failed generation
      assertStringIncludes(stderr, "❌ cursor: Template generation failed");
      
      // Recovery summary
      assertStringIncludes(stdout, "⚠️  Partial success: 3/4 CLIs completed");
      assertStringIncludes(stdout, "🔄 Failed CLI templates can be regenerated individually");
    });

    it("should validate template output before saving", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-with-validation",
          "--cli", "gemini",
          "--strict-validation",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔍 Pre-save validation enabled");
      assertStringIncludes(stdout, "✅ Template syntax: validated");
      assertStringIncludes(stdout, "✅ Required fields: verified");
      assertStringIncludes(stdout, "✅ CLI compatibility: confirmed");
      assertStringIncludes(stdout, "✅ Template saved with validation passed");
    });
  });

  describe("performance and scalability", () => {
    it("should generate templates within performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--performance-test",
          "--generate-all-cli-templates",
          "--output-dir", tempDir
        ],
        cwd: tempDir,
      });

      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Should complete within 1s per CLI (contract requirement: <1s per CLI)
      assert(duration < 4000, `Template generation took ${duration}ms, should be <4000ms for 4 CLIs`);
    });

    it("should handle concurrent template generation", async () => {
      const clis = ["gemini", "codex", "cursor", "claude-code"];

      const promises = clis.map(cli => {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/template_service.ts",
            "--generate-cli-template",
            "--cli", cli,
            "--output-dir", join(tempDir, cli),
            "--concurrent"
          ],
          cwd: tempDir,
        });
        return cmd.output();
      });

      const results = await Promise.all(promises);

      // All generations should succeed
      for (const result of results) {
        assertEquals(result.code, 0);
      }

      // Verify no file conflicts
      for (const cli of clis) {
        const templateDir = join(tempDir, cli);
        await Deno.stat(templateDir); // Should exist
      }
    });

    it("should optimize template caching", async () => {
      // First generation (cache miss)
      const firstCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-with-caching",
          "--cli", "gemini",
          "--output-dir", tempDir,
          "--enable-cache"
        ],
        cwd: tempDir,
      });

      const firstStart = Date.now();
      const firstResult = await firstCmd.output();
      const firstDuration = Date.now() - firstStart;

      assertEquals(firstResult.code, 0);
      const firstOutput = new TextDecoder().decode(firstResult.stdout);
      assertStringIncludes(firstOutput, "Cache miss: generating new template");

      // Second generation (cache hit)
      const secondCmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/template_service.ts",
          "--generate-with-caching",
          "--cli", "gemini",
          "--output-dir", tempDir,
          "--enable-cache"
        ],
        cwd: tempDir,
      });

      const secondStart = Date.now();
      const secondResult = await secondCmd.output();
      const secondDuration = Date.now() - secondStart;

      assertEquals(secondResult.code, 0);
      const secondOutput = new TextDecoder().decode(secondResult.stdout);
      assertStringIncludes(secondOutput, "Cache hit: using cached template");

      // Cached generation should be significantly faster
      assert(secondDuration < firstDuration / 2, 
             `Cached generation (${secondDuration}ms) should be much faster than first (${firstDuration}ms)`);
    });
  });
});