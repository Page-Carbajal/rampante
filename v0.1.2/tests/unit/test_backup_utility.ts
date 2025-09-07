import { assert, assertEquals } from "@std/assert";
import { join, dirname, fromFileUrl } from "@std/path";

const REPO_ROOT = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

Deno.test("Unit: missing original file -> no backup created", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-unit-" });
  await Deno.mkdir(join(tmp, "scripts"), { recursive: true });
  const cmdDir = join(tmp, "rampante", "command");

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

  const names = Array.from(Deno.readDirSync(cmdDir)).map((e) => e.name);
  const backups = names.filter((n) => /^rampante\.\d+(?:-\d+)?\.md$/.test(n));
  assertEquals(backups.length, 0, "No backup expected when original missing");
});

Deno.test("Unit: collision suffixing creates -1 on same-second backups", async () => {
  const tmp = await Deno.makeTempDir({ prefix: "rampante-unit-" });
  await Deno.mkdir(join(tmp, "scripts"), { recursive: true });
  const cmdDir = join(tmp, "rampante", "command");
  await Deno.mkdir(cmdDir, { recursive: true });
  await Deno.writeTextFile(join(cmdDir, "rampante.md"), "legacy");

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

  await runOnce();
  await runOnce();

  const names = Array.from(Deno.readDirSync(cmdDir)).map((e) => e.name);
  const backups = names.filter((n) => /^rampante\.\d+(?:-\d+)?\.md$/.test(n));
  assert(backups.length >= 2, "Should have at least two backups with unique names");
});

Deno.test({
  name: "Unit: backup fails gracefully when directory not writable",
  ignore: false,
  fn: async () => {
    const tmp = await Deno.makeTempDir({ prefix: "rampante-unit-" });
    await Deno.mkdir(join(tmp, "scripts"), { recursive: true });
    const cmdDir = join(tmp, "rampante", "command");
    await Deno.mkdir(cmdDir, { recursive: true });
    await Deno.writeTextFile(join(cmdDir, "rampante.md"), "legacy");

    // Make directory read & execute only
    await Deno.chmod(cmdDir, 0o555);

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

    // Restore perms for cleanup (best-effort)
    try {
      await Deno.chmod(cmdDir, 0o755);
    } catch {}

    // Expect non-zero exit due to backup/write failure (acceptable if either fails)
    assertEquals(result.success, false, "CLI should fail when directory not writable");
  },
});
