import { assertEquals, assertExists, assert, assertRejects } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { 
  registerRampante, 
  getRegistrationPath, 
  verifyRegistration,
  getSupportedTargets 
} from "../../src/services/register_rampante.ts";
import { 
  selectStack, 
  getAvailableStacks, 
  validateStackFile 
} from "../../src/lib/stack_selection.ts";

/**
 * Unit tests for stack selection and rampante registration
 * Tests core functionality for both stack selection and CLI registration
 */

// Helper function to create test environment
async function createTestEnvironment() {
  const testDir = await Deno.makeTempDir({ prefix: "stack-register-test-" });
  const stacksDir = join(testDir, "recommended-stacks");
  const rampanteDir = join(testDir, "rampante", "command");
  const homeDir = join(testDir, "fake-home");
  const codexDir = join(homeDir, ".codex", "prompts");
  
  await Deno.mkdir(stacksDir, { recursive: true });
  await Deno.mkdir(rampanteDir, { recursive: true });
  await Deno.mkdir(codexDir, { recursive: true });
  
  // Create test DEFINITIONS.md
  const definitionsContent = `# Stack Definitions

## Available Stacks

### SIMPLE_WEB_APP

- **Description**: A straightforward web application
- **Tags**: web, frontend, backend, simple, crud
- **Priority**: 1
- **Use Cases**:
  - Basic CRUD applications
  - Simple websites

### CLI_TOOL

- **Description**: Command-line interface tool
- **Tags**: cli, tool, automation, terminal
- **Priority**: 2
- **Use Cases**:
  - Developer tools
  - Automation scripts
`;

  await Deno.writeTextFile(join(stacksDir, "DEFINITIONS.md"), definitionsContent);
  
  // Create test stack files
  const simpleWebAppContent = `# Simple Web App Stack

## Core Technologies

- **HTML5** - Markup language
- **CSS3** - Styling  
- **JavaScript** - Client-side scripting

## Context7 Documentation

- **Express.js** - Web framework
- **SQLite** - Database
`;

  const cliToolContent = `# CLI Tool Stack

## Core Technologies

- **Deno** - Runtime
- **TypeScript** - Language

## Context7 Documentation

- **Commander.js** - CLI framework
- **Chalk** - Terminal colors
`;

  await Deno.writeTextFile(join(stacksDir, "SIMPLE_WEB_APP.md"), simpleWebAppContent);
  await Deno.writeTextFile(join(stacksDir, "CLI_TOOL.md"), cliToolContent);
  
  // Create test rampante.md command file
  const rampanteContent = `# Test Rampante Command

This is a test rampante command file for registration testing.

## Workflow

Test workflow content here.
`;

  await Deno.writeTextFile(join(rampanteDir, "rampante.md"), rampanteContent);
  
  return { testDir, stacksDir, rampanteDir, homeDir, codexDir };
}

// Mock HOME environment for testing
function withMockedHome<T>(homeDir: string, fn: () => Promise<T>): Promise<T> {
  const originalHome = Deno.env.get("HOME");
  Deno.env.set("HOME", homeDir);
  
  return fn().finally(() => {
    if (originalHome !== undefined) {
      Deno.env.set("HOME", originalHome);
    } else {
      Deno.env.delete("HOME");
    }
  });
}

// Stack Selection Tests (focused on key edge cases)

Deno.test("Stack Selection: YOLO strategy selects best match", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // Test that CLI-specific prompts select CLI tools
    const result = await selectStack("I need to build a CLI automation tool", testDir);
    
    assertEquals(result.selectedStack, "CLI_TOOL", "Should select CLI_TOOL for CLI prompt");
    assertEquals(result.fallback, false, "Should not be fallback");
    assertEquals(result.technologies.includes("Commander.js"), true, "Should extract technologies");
    assert(result.matchReason.includes("cli"), "Should mention matched CLI tag");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Deterministic tie-breaking works correctly", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // Generic "web" matches both stacks, should pick lower priority (SIMPLE_WEB_APP)
    const result = await selectStack("I want to build a web application", testDir);
    
    assertEquals(result.selectedStack, "SIMPLE_WEB_APP", "Should select lowest priority on tie");
    assertEquals(result.priority, 1, "Should have priority 1");
    assertEquals(result.fallback, false, "Should not be fallback");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Handles missing stack gracefully", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    const isValid = await validateStackFile("SIMPLE_WEB_APP", testDir);
    assertEquals(isValid, true, "Should validate existing stack");
    
    const isInvalid = await validateStackFile("NONEXISTENT_STACK", testDir);
    assertEquals(isInvalid, false, "Should not validate missing stack");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

// Registration Tests

Deno.test("Registration: Gets correct registration path for supported targets", () => {
  const codexPath = getRegistrationPath("codex");
  assert(codexPath.endsWith("/.codex/prompts/rampante.md"), "Should return correct Codex path");
  
  // Test unsupported target
  assertRejects(
    () => Promise.resolve(getRegistrationPath("unsupported")),
    Error,
    "Unknown CLI target",
    "Should throw error for unsupported target"
  );
});

Deno.test("Registration: Lists supported targets correctly", () => {
  const targets = getSupportedTargets();
  assertEquals(targets.length, 1, "Should have one supported target");
  assertEquals(targets[0], "codex", "Should support codex target");
});

Deno.test("Registration: Registers with Codex successfully", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      // Change to test directory to simulate running from project root
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        // Initially should not be registered
        const beforeRegistration = await verifyRegistration("codex");
        assertEquals(beforeRegistration, false, "Should not be registered initially");
        
        // Register the command
        await registerRampante("codex");
        
        // Should be registered now
        const afterRegistration = await verifyRegistration("codex");
        assertEquals(afterRegistration, true, "Should be registered after registration");
        
        // Verify the file was actually copied
        const registrationPath = getRegistrationPath("codex");
        const fileExists = await exists(registrationPath);
        assertEquals(fileExists, true, "Registration file should exist");
        
        // Verify content was copied correctly
        const content = await Deno.readTextFile(registrationPath);
        assert(content.includes("Test Rampante Command"), "Should have correct content");
        
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Registration: Fails when source file missing", async () => {
  const { testDir, homeDir, rampanteDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        // Remove the source file
        await Deno.remove(join(rampanteDir, "rampante.md"));
        
        // Registration should fail
        await assertRejects(
          () => registerRampante("codex"),
          Error,
          "Source rampante.md not found",
          "Should throw error when source file missing"
        );
        
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Registration: Fails for unsupported CLI target", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        // Registration should fail for unsupported target
        await assertRejects(
          () => registerRampante("unsupported"),
          Error,
          "Unsupported CLI target",
          "Should throw error for unsupported target"
        );
        
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Registration: Handles registration overwrite correctly", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        // Register once
        await registerRampante("codex");
        
        // Modify the source file
        const rampantePath = join("rampante", "command", "rampante.md");
        await Deno.writeTextFile(rampantePath, "# Modified Rampante Command\n\nNew content here.");
        
        // Register again (should overwrite)
        await registerRampante("codex");
        
        // Verify new content was copied
        const registrationPath = getRegistrationPath("codex");
        const content = await Deno.readTextFile(registrationPath);
        assert(content.includes("Modified Rampante Command"), "Should have updated content");
        assert(content.includes("New content here"), "Should have new content");
        
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Registration: Verify registration works without actual file", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      // Should return false when registration file doesn't exist
      const isRegistered = await verifyRegistration("codex");
      assertEquals(isRegistered, false, "Should return false when file doesn't exist");
      
      // Should return false for unsupported targets (catches exception)
      const unsupportedRegistered = await verifyRegistration("unsupported");
      assertEquals(unsupportedRegistered, false, "Should return false for unsupported target");
      
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

// Integration Tests (Stack Selection + Registration)

Deno.test("Integration: Stack selection and registration work together", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        // Select a stack
        const stackResult = await selectStack("I want to build a CLI tool", testDir);
        assertEquals(stackResult.selectedStack, "CLI_TOOL", "Should select CLI_TOOL stack");
        
        // Register the rampante command
        await registerRampante("codex");
        
        // Verify both operations succeeded
        const stacks = await getAvailableStacks(testDir);
        assertEquals(stacks.length, 2, "Should have available stacks");
        
        const isRegistered = await verifyRegistration("codex");
        assertEquals(isRegistered, true, "Should be registered");
        
        // Verify stack validation works
        const isValidStack = await validateStackFile(stackResult.selectedStack, testDir);
        assertEquals(isValidStack, true, "Selected stack should be valid");
        
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Integration: Error handling works across modules", async () => {
  const { testDir, homeDir } = await createTestEnvironment();
  
  try {
    await withMockedHome(homeDir, async () => {
      // Remove DEFINITIONS.md to test error handling
      await Deno.remove(join(testDir, "recommended-stacks", "DEFINITIONS.md"));
      
      // Stack selection should fail gracefully
      await assertRejects(
        () => selectStack("test prompt", testDir),
        Error,
        "DEFINITIONS.md not found",
        "Should handle missing definitions gracefully"
      );
      
      // Registration should still work (doesn't depend on stacks)
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);
      
      try {
        await registerRampante("codex");
        const isRegistered = await verifyRegistration("codex");
        assertEquals(isRegistered, true, "Registration should work independently");
      } finally {
        Deno.chdir(originalCwd);
      }
    });
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});