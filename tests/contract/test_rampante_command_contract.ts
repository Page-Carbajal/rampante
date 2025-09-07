import { assert, assertEquals, assertExists } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";
import { exists } from "@std/fs";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Contract: creates timestamped backup before modification", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-contract-" });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  const original = join(cmdDir, "rampante.md");

  // Seed original file with legacy content containing stack selection reference
  const legacy = "Run scripts/select-stack.sh during Phase 1";
  await Deno.writeTextFile(original, legacy);

  // Invoke updater targeting the temp workspace (future implementation should support --root)
  const updateCmd = new Deno.Command("deno", {
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
  const result = await updateCmd.output();

  // Expect non-zero until implemented; still assert backup behavior as contract
  // When implemented, this test should pass and backup must exist
  const out = new TextDecoder().decode(result.stdout) +
    new TextDecoder().decode(result.stderr);
  assert(out.length >= 0);

  // Backup should exist with epoch-based name
  const listing = Array.from(Deno.readDirSync(cmdDir)).map((e) => e.name);
  const backups = listing.filter((n) => /^rampante\.\d+(?:-\d+)?\.md$/.test(n));

  // Contract: backup MUST be created before modification
  assert(backups.length >= 1, "Expected at least one timestamped backup");
  assertExists(original);
});
