import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { join } from "@std/path";

// Integration tests for complete workflow execution
// Tests end-to-end Spec Kit workflow automation

describe("Workflow Execution Integration", () => {
  let tempDir: string;
  let specKitDir: string;

  beforeEach(async () => {
    tempDir = await Deno.makeTempDir();
    specKitDir = await Deno.makeTempDir();
    
    // Create complete Spec Kit structure for testing
    await createSpecKitEnvironment(specKitDir);
  });

  afterEach(async () => {
    await Deno.remove(tempDir, { recursive: true });
    await Deno.remove(specKitDir, { recursive: true });
  });

  async function createSpecKitEnvironment(dir: string) {
    // Create Spec Kit directories
    await Deno.mkdir(join(dir, "scripts"), { recursive: true });
    await Deno.mkdir(join(dir, "templates"), { recursive: true });
    await Deno.mkdir(join(dir, "memory"), { recursive: true });
    await Deno.mkdir(join(dir, "specs"), { recursive: true });

    // Create mock Spec Kit scripts
    await Deno.writeTextFile(
      join(dir, "scripts", "specify.sh"),
      `#!/bin/bash
echo "Mock /specify execution"
echo "Generated: specs/001-test-feature/spec.md"
mkdir -p specs/001-test-feature
echo "# Test Feature Spec" > specs/001-test-feature/spec.md
`
    );

    await Deno.writeTextFile(
      join(dir, "scripts", "plan.sh"),
      `#!/bin/bash
echo "Mock /plan execution"
echo "Generated: specs/001-test-feature/plan.md"
echo "# Test Feature Plan" > specs/001-test-feature/plan.md
echo "# Test Research" > specs/001-test-feature/research.md
`
    );

    await Deno.writeTextFile(
      join(dir, "scripts", "tasks.sh"),
      `#!/bin/bash
echo "Mock /tasks execution"
echo "Generated: specs/001-test-feature/tasks.md"
echo "# Test Feature Tasks" > specs/001-test-feature/tasks.md
`
    );

    // Make scripts executable
    await Deno.chmod(join(dir, "scripts", "specify.sh"), 0o755);
    await Deno.chmod(join(dir, "scripts", "plan.sh"), 0o755);
    await Deno.chmod(join(dir, "scripts", "tasks.sh"), 0o755);
  }

  describe("complete workflow execution", () => {
    it("should execute full specify-plan-tasks workflow", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Build user authentication system with login and signup"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);

      // Verify workflow progress reporting
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow for: \"Build user authentication system with login and signup\"");
      
      // Phase 1: /specify
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "└─ Executing /specify...");
      assertStringIncludes(stdout, "└─ ✅ Generated: specs/001-test-feature/spec.md");
      
      // Phase 2: /plan
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "└─ Executing /plan...");
      assertStringIncludes(stdout, "└─ ✅ Generated: specs/001-test-feature/plan.md");
      assertStringIncludes(stdout, "└─ ✅ Generated: specs/001-test-feature/research.md");
      
      // Phase 3: /tasks
      assertStringIncludes(stdout, "📝 Phase 3: Task Breakdown");
      assertStringIncludes(stdout, "└─ Executing /tasks...");
      assertStringIncludes(stdout, "└─ ✅ Generated: specs/001-test-feature/tasks.md");
      
      // Completion summary
      assertStringIncludes(stdout, "🎉 Workflow completed successfully!");
      assertStringIncludes(stdout, "📂 Generated Files:");
      assertStringIncludes(stdout, "🚀 Next Steps:");
      assertStringIncludes(stdout, "1. Review specification: specs/001-test-feature/spec.md");
      assertStringIncludes(stdout, "2. Execute tasks: Follow specs/001-test-feature/tasks.md");

      // Verify files were actually created
      await Deno.stat(join(specKitDir, "specs/001-test-feature/spec.md"));
      await Deno.stat(join(specKitDir, "specs/001-test-feature/plan.md"));
      await Deno.stat(join(specKitDir, "specs/001-test-feature/tasks.md"));
    });

    it("should provide accurate timing information", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Simple todo component",
          "--timing"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const totalDuration = Date.now() - startTime;

      assertEquals(result.code, 0);

      // Verify timing format (X.Xs) appears for each step
      const timingPattern = /\(\d+\.\d+s\)/;
      const lines = stdout.split('\n');
      const generatedLines = lines.filter(line => line.includes('✅ Generated:'));
      
      assert(generatedLines.length > 0, "Should have generated file lines");
      
      for (const line of generatedLines) {
        assert(timingPattern.test(line), `Line should contain timing: ${line}`);
      }

      // Verify total time is reported
      assertStringIncludes(stdout, "total");
      assert(totalDuration < 30000, "Workflow should complete within 30 seconds");
    });

    it("should handle complex feature descriptions", async () => {
      const complexFeature = `Build comprehensive e-commerce platform with:
- User authentication and authorization
- Product catalog with search and filtering
- Shopping cart and checkout process
- Payment processing with multiple providers
- Order management and tracking
- Admin dashboard with analytics
- Mobile-responsive design
- API for third-party integrations`;

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", complexFeature
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🚀 Starting Rampante workflow for:");
      assertStringIncludes(stdout, "Build comprehensive e-commerce platform");
      assertStringIncludes(stdout, "🎉 Workflow completed successfully!");

      // Verify all phases completed despite complex input
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "📝 Phase 3: Task Breakdown");
    });
  });

  describe("workflow error handling", () => {
    it("should handle /specify command failure gracefully", async () => {
      // Make /specify script fail
      await Deno.writeTextFile(
        join(specKitDir, "scripts", "specify.sh"),
        `#!/bin/bash
echo "Mock /specify failure" >&2
exit 1
`
      );

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 3);
      assertStringIncludes(stderr, "❌ Error: /specify command failed");
      assertStringIncludes(stderr, "Details: Mock /specify failure");
      assertStringIncludes(stderr, "Recovery options:");
      assertStringIncludes(stderr, "1. Check feature description clarity");
      assertStringIncludes(stderr, "2. Verify Spec Kit installation");
      assertStringIncludes(stderr, "3. Try manual /specify execution");
    });

    it("should handle /plan command failure with partial recovery", async () => {
      // Let /specify succeed but /plan fail
      await Deno.writeTextFile(
        join(specKitDir, "scripts", "plan.sh"),
        `#!/bin/bash
echo "Mock /plan failure" >&2
exit 1
`
      );

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 3);
      
      // /specify should have succeeded
      assertStringIncludes(stdout, "📋 Phase 1: Specification Generation");
      assertStringIncludes(stdout, "└─ ✅ Generated: specs/001-test-feature/spec.md");
      
      // /plan should have failed
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stderr, "❌ Error: /plan command failed");
      
      // Verify spec file was created (partial success)
      await Deno.stat(join(specKitDir, "specs/001-test-feature/spec.md"));
    });

    it("should provide workflow resume capabilities", async () => {
      // Simulate interruption after /specify succeeds
      await Deno.mkdir(join(specKitDir, "specs/001-test-feature"), { recursive: true });
      await Deno.writeTextFile(
        join(specKitDir, "specs/001-test-feature/spec.md"),
        "# Existing Feature Spec"
      );

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--resume-workflow",
          "--from-phase", "plan",
          "--spec-file", "specs/001-test-feature/spec.md"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      assertStringIncludes(stdout, "🔄 Resuming Rampante workflow from phase: plan");
      assertStringIncludes(stdout, "📋 Phase 1: ✅ Already completed");
      assertStringIncludes(stdout, "🔧 Phase 2: Implementation Planning");
      assertStringIncludes(stdout, "└─ Executing /plan...");
      assertStringIncludes(stdout, "🎉 Workflow resumed and completed successfully!");
    });
  });

  describe("workflow state management", () => {
    it("should track workflow state throughout execution", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature with state tracking",
          "--state-tracking"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify state transitions are logged
      assertStringIncludes(stdout, "State: INITIALIZING → SPECIFY_PENDING");
      assertStringIncludes(stdout, "State: SPECIFY_PENDING → SPECIFY_COMPLETE");
      assertStringIncludes(stdout, "State: SPECIFY_COMPLETE → PLAN_PENDING");
      assertStringIncludes(stdout, "State: PLAN_PENDING → PLAN_COMPLETE");
      assertStringIncludes(stdout, "State: PLAN_COMPLETE → TASKS_PENDING");
      assertStringIncludes(stdout, "State: TASKS_PENDING → TASKS_COMPLETE");
      assertStringIncludes(stdout, "State: TASKS_COMPLETE → WORKFLOW_COMPLETE");
    });

    it("should save workflow state for recovery", async () => {
      const stateFile = join(tempDir, "workflow-state.json");

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature",
          "--save-state", stateFile
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      // Verify state file was created
      const stateContent = await Deno.readTextFile(stateFile);
      const state = JSON.parse(stateContent);

      assertEquals(state.status, "WORKFLOW_COMPLETE");
      assertEquals(state.input, "Test feature");
      assertEquals(state.phases.specify.status, "COMPLETE");
      assertEquals(state.phases.plan.status, "COMPLETE");
      assertEquals(state.phases.tasks.status, "COMPLETE");
      assert(Array.isArray(state.generatedFiles));
      assert(state.generatedFiles.length > 0);
    });

    it("should provide detailed progress callbacks", async () => {
      const progressFile = join(tempDir, "progress.log");

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature",
          "--progress-log", progressFile
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      assertEquals(result.code, 0);

      const progressLog = await Deno.readTextFile(progressFile);
      const progressLines = progressLog.split('\n').filter(line => line.trim());

      // Verify progress events are logged with timestamps
      assert(progressLines.some(line => line.includes("WORKFLOW_STARTED")));
      assert(progressLines.some(line => line.includes("PHASE_STARTED:specify")));
      assert(progressLines.some(line => line.includes("PHASE_COMPLETED:specify")));
      assert(progressLines.some(line => line.includes("PHASE_STARTED:plan")));
      assert(progressLines.some(line => line.includes("PHASE_COMPLETED:plan")));
      assert(progressLines.some(line => line.includes("PHASE_STARTED:tasks")));
      assert(progressLines.some(line => line.includes("PHASE_COMPLETED:tasks")));
      assert(progressLines.some(line => line.includes("WORKFLOW_COMPLETED")));

      // Verify timestamps are present
      for (const line of progressLines) {
        assert(line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/), 
               `Line should start with timestamp: ${line}`);
      }
    });
  });

  describe("workflow validation", () => {
    it("should validate Spec Kit environment before execution", async () => {
      // Remove essential Spec Kit directory
      await Deno.remove(join(specKitDir, "scripts"), { recursive: true });

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 2);
      assertStringIncludes(stderr, "❌ Error: Spec Kit not detected in current directory");
      assertStringIncludes(stderr, "Required files missing:");
      assertStringIncludes(stderr, "- scripts/");
    });

    it("should validate input before starting workflow", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", ""
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stderr = new TextDecoder().decode(result.stderr);

      assertEquals(result.code, 4);
      assertStringIncludes(stderr, "❌ Error: Feature description cannot be empty");
    });

    it("should validate generated files meet quality standards", async () => {
      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Test feature",
          "--validate-output"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const stdout = new TextDecoder().decode(result.stdout);

      assertEquals(result.code, 0);
      
      // Verify validation steps
      assertStringIncludes(stdout, "🔍 Validating generated files:");
      assertStringIncludes(stdout, "✅ spec.md: Valid markdown structure");
      assertStringIncludes(stdout, "✅ plan.md: Valid implementation plan format");
      assertStringIncludes(stdout, "✅ tasks.md: Valid task breakdown format");
      assertStringIncludes(stdout, "✅ All generated files passed quality validation");
    });
  });

  describe("performance benchmarks", () => {
    it("should complete simple workflows within performance targets", async () => {
      const startTime = Date.now();

      const cmd = new Deno.Command("deno", {
        args: [
          "run", "-A", "src/services/workflow_service.ts",
          "--execute-workflow",
          "--input", "Simple button component"
        ],
        cwd: specKitDir,
      });

      const result = await cmd.output();
      const duration = Date.now() - startTime;

      assertEquals(result.code, 0);
      
      // Simple workflows should complete quickly (target: <10s total)
      assert(duration < 10000, `Workflow took ${duration}ms, should be <10s`);
    });

    it("should handle concurrent workflow execution", async () => {
      const workflows = [
        "Build login component",
        "Create data table",
        "Add search functionality"
      ];

      const promises = workflows.map(input => {
        const cmd = new Deno.Command("deno", {
          args: [
            "run", "-A", "src/services/workflow_service.ts",
            "--execute-workflow",
            "--input", input,
            "--concurrent-safe"
          ],
          cwd: specKitDir,
        });
        return cmd.output();
      });

      const results = await Promise.all(promises);

      // All workflows should succeed
      for (const result of results) {
        assertEquals(result.code, 0);
      }

      // Verify no file conflicts occurred
      const specs = await Array.fromAsync(Deno.readDir(join(specKitDir, "specs")));
      assert(specs.length >= workflows.length, "Should have created specs for all workflows");
    });
  });
});