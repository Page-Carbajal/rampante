import { assert, assertEquals } from "@std/assert";
import { join, dirname, fromFileUrl } from "@std/path";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Unit: generated content contains simplified phases and no forbidden references", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-unit-" });
  await Deno.mkdir(join(tmp, "scripts"), { recursive: true });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  const target = join(cmdDir, "rampante.md");
  await Deno.writeTextFile(target, "legacy with stack selection");

  const p = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      join(REPO_ROOT, "src", "cli", "update-rampante-command.ts"),
      "--root",
      tmp,
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const result = await p.output();
  assertEquals(result.success, true, "CLI should succeed");

  const content = await Deno.readTextFile(target);
  assert(content.includes("Phase 1: Specification Generation"));
  assert(content.includes("Phase 2: Implementation Planning"));
  assert(content.includes("Phase 3: Task Generation"));
  assert(content.includes("Phase 4: Project Overview Generation"));
  assertEquals(content.includes("select-stack.sh"), false);
});
