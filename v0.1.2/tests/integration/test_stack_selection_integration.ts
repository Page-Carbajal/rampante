import { assertEquals, assertExists, assert } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { selectStack } from "../../src/lib/stack_selection.ts";

/**
 * Integration test for stack selection with real repository data
 * Verifies that the stack selection works correctly with actual DEFINITIONS.md
 * and produces JSON-compatible output matching the bash script format
 */

Deno.test("Stack Selection Integration: Works with real repository data", async () => {
  // Test with real repository stacks
  const result = await selectStack("I want to build a React single-page application");
  
  assertEquals(result.selectedStack, "REACT_SPA", "Should select React SPA");
  assertEquals(typeof result.priority, "number", "Priority should be a number");
  assertEquals(Array.isArray(result.technologies), true, "Technologies should be an array");
  assertEquals(typeof result.fallback, "boolean", "Fallback should be a boolean");
  assertEquals(typeof result.matchReason, "string", "Match reason should be a string");
  assertExists(result.stackFile, "Stack file path should exist");
  assert(result.stackFile.endsWith("REACT_SPA.md"), "Stack file should point to correct file");
});

Deno.test("Stack Selection Integration: Produces bash-script compatible JSON", async () => {
  const result = await selectStack("Simple web application with forms");
  
  // Verify output can be serialized to JSON (bash script compatibility)
  const json = JSON.stringify({
    selected_stack: result.selectedStack,
    stack_file: result.stackFile,
    priority: result.priority,
    technologies: result.technologies,
    fallback: result.fallback,
    match_reason: result.matchReason,
    tags: result.tags,
  });
  
  assertExists(json, "Should be able to serialize to JSON");
  
  // Parse back to verify structure
  const parsed = JSON.parse(json);
  assertEquals(parsed.selected_stack, result.selectedStack, "JSON should preserve selected stack");
  assertEquals(parsed.priority, result.priority, "JSON should preserve priority");
  assertEquals(Array.isArray(parsed.technologies), true, "JSON should preserve technologies array");
  assertEquals(Array.isArray(parsed.tags), true, "JSON should preserve tags array");
});

Deno.test("Stack Selection Integration: Handles various realistic prompts", async () => {
  const testCases = [
    { prompt: "Build a mobile React Native app", expected: "MOBILE_REACT_NATIVE" },
    { prompt: "Create a Python REST API", expected: "PYTHON_API" },
    { prompt: "I need a command-line tool", expected: "CLI_TOOL" },
    { prompt: "Build a static website", expected: "STATIC_SITE" },
  ];
  
  for (const testCase of testCases) {
    const result = await selectStack(testCase.prompt);
    assertEquals(result.selectedStack, testCase.expected, 
      `Prompt "${testCase.prompt}" should select ${testCase.expected}`);
    assertEquals(result.fallback, false, "Should not be fallback for these specific prompts");
    assert(result.technologies.length > 0, "Should extract technologies");
  }
});

Deno.test("Stack Selection Integration: Deterministic results", async () => {
  const prompt = "Build a React application";
  
  // Run the same prompt multiple times
  const results = [];
  for (let i = 0; i < 3; i++) {
    results.push(await selectStack(prompt));
  }
  
  // All results should be identical (deterministic)
  const first = results[0];
  for (const result of results.slice(1)) {
    assertEquals(result.selectedStack, first.selectedStack, "Should be deterministic");
    assertEquals(result.priority, first.priority, "Should be deterministic");
    assertEquals(result.fallback, first.fallback, "Should be deterministic");
    assertEquals(result.matchReason, first.matchReason, "Should be deterministic");
  }
});