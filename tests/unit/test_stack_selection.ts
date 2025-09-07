import { assertEquals, assertExists, assert } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { 
  selectStack, 
  getAvailableStacks, 
  validateStackFile,
  type StackSelectionResult,
  type StackInfo 
} from "../../src/lib/stack_selection.ts";

/**
 * Unit tests for stack selection helper
 * Tests YOLO strategy, deterministic tie-breaking, and technology extraction
 */

// Helper function to create test environment
async function createTestEnvironment() {
  const testDir = await Deno.makeTempDir({ prefix: "stack-selection-test-" });
  const stacksDir = join(testDir, "recommended-stacks");
  await Deno.mkdir(stacksDir, { recursive: true });
  
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

### REACT_SPA

- **Description**: Modern single-page application using React
- **Tags**: web, frontend, react, spa, javascript
- **Priority**: 2
- **Use Cases**:
  - Interactive web applications
  - Real-time interfaces

### CLI_TOOL

- **Description**: Command-line interface tool
- **Tags**: cli, tool, automation, terminal
- **Priority**: 3
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

  const reactSpaContent = `# React SPA Stack

## Core Technologies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

## Context7 Documentation

- **React Router** - Client-side routing
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
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
  await Deno.writeTextFile(join(stacksDir, "REACT_SPA.md"), reactSpaContent);
  await Deno.writeTextFile(join(stacksDir, "CLI_TOOL.md"), cliToolContent);
  
  return { testDir, stacksDir };
}

Deno.test("Stack Selection: Parses DEFINITIONS.md correctly", async () => {
  const { testDir, stacksDir } = await createTestEnvironment();
  
  try {
    const stacks = await getAvailableStacks(testDir);
    
    assertEquals(stacks.length, 3, "Should parse 3 stacks");
    
    const simpleWeb = stacks.find(s => s.name === "SIMPLE_WEB_APP");
    assertExists(simpleWeb, "Should find SIMPLE_WEB_APP");
    assertEquals(simpleWeb.priority, 1, "Should have correct priority");
    assertEquals(simpleWeb.tags.includes("web"), true, "Should include web tag");
    assertEquals(simpleWeb.order, 0, "Should be first in order");
    
    const reactSpa = stacks.find(s => s.name === "REACT_SPA");
    assertExists(reactSpa, "Should find REACT_SPA");
    assertEquals(reactSpa.priority, 2, "Should have correct priority");
    assertEquals(reactSpa.order, 1, "Should be second in order");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Selects best matching stack", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // Test exact tag match
    const result = await selectStack("I want to build a React application", testDir);
    
    assertEquals(result.selectedStack, "REACT_SPA", "Should select React SPA for React prompt");
    assertEquals(result.fallback, false, "Should not be fallback");
    assert(result.matchReason.includes("react"), "Should mention matched tag");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Deterministic tie-breaking by priority", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // Both SIMPLE_WEB_APP and REACT_SPA have "web" tag, but SIMPLE_WEB_APP has lower priority
    const result = await selectStack("I want to build a web application", testDir);
    
    assertEquals(result.selectedStack, "SIMPLE_WEB_APP", "Should select lower priority stack in tie");
    assertEquals(result.priority, 1, "Should have priority 1");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Fallback to lowest priority when no matches", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // No stack should match "mobile" or "android"
    const result = await selectStack("I want to build a mobile Android app", testDir);
    
    assertEquals(result.selectedStack, "SIMPLE_WEB_APP", "Should fallback to lowest priority");
    assertEquals(result.fallback, true, "Should indicate fallback");
    assertEquals(result.matchReason, "no tag match; fallback to lowest priority", "Should have fallback reason");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Extracts technologies from Context7 section", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    const result = await selectStack("I want to build a React app", testDir);
    
    assertEquals(result.selectedStack, "REACT_SPA", "Should select React SPA");
    assertEquals(result.technologies.length, 3, "Should extract 3 technologies from Context7 section");
    assertEquals(result.technologies.includes("React Router"), true, "Should include React Router");
    assertEquals(result.technologies.includes("React Query"), true, "Should include React Query");
    assertEquals(result.technologies.includes("Tailwind CSS"), true, "Should include Tailwind CSS");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Falls back to Core Technologies when no Context7 section", async () => {
  const { testDir, stacksDir } = await createTestEnvironment();
  
  try {
    // Create a stack file with only Core Technologies section
    const testStackContent = `# Test Stack

## Core Technologies

- **Node.js** - Runtime
- **Express** - Framework
`;
    
    // Add to definitions
    const definitionsPath = join(stacksDir, "DEFINITIONS.md");
    const existingContent = await Deno.readTextFile(definitionsPath);
    const updatedContent = existingContent + `
### TEST_STACK

- **Description**: Test stack without Context7 section
- **Tags**: test, node
- **Priority**: 4
- **Use Cases**:
  - Testing fallback
`;
    await Deno.writeTextFile(definitionsPath, updatedContent);
    await Deno.writeTextFile(join(stacksDir, "TEST_STACK.md"), testStackContent);
    
    const result = await selectStack("I want to test node", testDir);
    
    assertEquals(result.selectedStack, "TEST_STACK", "Should select test stack");
    assertEquals(result.technologies.length, 2, "Should extract from Core Technologies");
    assertEquals(result.technologies.includes("Node.js"), true, "Should include Node.js");
    assertEquals(result.technologies.includes("Express"), true, "Should include Express");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Validates stack files exist", async () => {
  const { testDir, stacksDir } = await createTestEnvironment();
  
  try {
    const isValid = await validateStackFile("REACT_SPA", testDir);
    assertEquals(isValid, true, "Should validate existing stack file");
    
    const isInvalid = await validateStackFile("NONEXISTENT", testDir);
    assertEquals(isInvalid, false, "Should not validate missing stack file");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Handles missing DEFINITIONS.md", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "stack-selection-test-" });
  
  try {
    let errorThrown = false;
    try {
      await selectStack("test prompt", testDir);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes("DEFINITIONS.md not found"), "Should throw meaningful error");
    }
    
    assertEquals(errorThrown, true, "Should throw error for missing definitions");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Handles missing stack file", async () => {
  const { testDir, stacksDir } = await createTestEnvironment();
  
  try {
    // Add stack to definitions but don't create the file
    const definitionsPath = join(stacksDir, "DEFINITIONS.md");
    const existingContent = await Deno.readTextFile(definitionsPath);
    const updatedContent = existingContent + `
### MISSING_STACK

- **Description**: Stack with missing file
- **Tags**: missing, test
- **Priority**: 5
- **Use Cases**:
  - Testing error handling
`;
    await Deno.writeTextFile(definitionsPath, updatedContent);
    
    let errorThrown = false;
    try {
      await selectStack("I want missing test", testDir);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes("Missing stack file"), "Should throw meaningful error");
    }
    
    assertEquals(errorThrown, true, "Should throw error for missing stack file");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Stack Selection: Multiple word matches increase score", async () => {
  const { testDir } = await createTestEnvironment();
  
  try {
    // "cli tool" should match CLI_TOOL better than single word matches
    const result = await selectStack("I want to build a CLI tool for automation", testDir);
    
    assertEquals(result.selectedStack, "CLI_TOOL", "Should select CLI_TOOL for multiple matching tags");
    assert(result.matchReason.includes("cli"), "Should mention CLI in match reason");
    assert(result.matchReason.includes("tool"), "Should mention tool in match reason");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});