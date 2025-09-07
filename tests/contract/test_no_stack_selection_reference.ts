import { assertEquals } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Contract: new file contains no reference to scripts/select-stack.sh", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-contract-" });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  const target = join(cmdDir, "rampante.md");

  // Seed with legacy content that mentions the old script
  await Deno.writeTextFile(target, "Legacy mentions scripts/select-stack.sh");

  // Run updater (expected to fail until implemented)
  const p = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      join(REPO_ROOT, "src", "cli", "update_rampante_command.ts"),
      "--root",
      tmp,
    ],
    stdout: "piped",
    stderr: "piped",
  });
  await p.output();

  // Read updated content
  const updated = await Deno.readTextFile(target);

  // Expectation: should NOT contain reference to select-stack.sh once implemented
  // This will currently fail until updater writes new content
  assertEquals(updated.includes("select-stack.sh"), false);
});

