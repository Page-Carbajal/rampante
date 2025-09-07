import { assert, assertEquals } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Integration: simplified phases present; selection phases absent", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-int-" });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  const target = join(cmdDir, "rampante.md");
  await Deno.writeTextFile(target, "Legacy orchestrator with stack selection");

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
  await p.output();

  const content = await Deno.readTextFile(target);

  // Presence expectations (will fail RED until implemented)
  assert(content.includes("Phase 1: Specification Generation"));
  assert(content.includes("Phase 2: Implementation Planning"));
  assert(content.includes("Phase 3: Task Generation"));
  assert(content.includes("Phase 4: Project Overview Generation"));

  // Absence expectations
  assertEquals(content.includes("Stack Selection"), false);
});
