import { assertEquals } from "@std/assert";
import { dirname, fromFileUrl, join } from "@std/path";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Integration: unique backup names on same-second updates", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-int-" });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  const target = join(cmdDir, "rampante.md");
  await Deno.writeTextFile(target, "Legacy orchestrator");

  const runOnce = async () => {
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
  };

  // Invoke twice within likely same second
  await runOnce();
  await runOnce();

  const names = Array.from(Deno.readDirSync(cmdDir)).map((e) => e.name);
  const backups = names.filter((n) => /^rampante\.\d+(?:-\d+)?\.md$/.test(n));
  // Expect at least two backups with unique names (will fail RED until implemented)
  assertEquals(backups.length >= 2, true);
});
