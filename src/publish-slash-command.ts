import { parse } from "@std/flags";
import { join } from "@std/path";
import { ensureDir } from "@std/fs";

// console.log(">>> Script Directory: ", import.meta.dirname);

const currentDirectory = Deno.cwd(); // Where the script is called
const mdTemplatePath = join(
  import.meta.dirname,
  "/cli/commands/rampante-template.md",
);
const tomlTemplatePath = join(
  import.meta.dirname,
  "/cli/commands/rampante-template.toml",
);

const destinations = {
  gemini: join(currentDirectory!, ".gemini/commands"),
  claude: join(currentDirectory!, ".claude/commands"),
  // cursor: join(Deno.env.get("HOME")!, ".cursor/prompts"),
  codex: join(Deno.env.get("HOME")!, ".codex/prompts"),
};

async function selectCli(): Promise<keyof typeof destinations> {
  console.log("\n\nPlease select a CLI to publish the command to:\n");
  const options = Object.keys(destinations);
  options.forEach((opt, i) => console.log(`${i + 1}. ${opt}`));

  while (true) {
    const choice = prompt("\n\nEnter the number of your choice:");
    if (choice === null) {
      console.error("Selection cancelled.");
      Deno.exit(1);
    }
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < options.length) {
      return options[index] as keyof typeof destinations;
    }
    console.log("Invalid choice, please try again.");
  }
}

async function main() {
  const args = parse(Deno.args);
  let cli = args._[0] as keyof typeof destinations;

  if (!cli) {
    cli = await selectCli();
  }

  if (!Object.keys(destinations).includes(cli)) {
    console.error(`Invalid CLI: ${cli}`);
    console.error(`Valid options are: ${Object.keys(destinations).join(", ")}`);
    Deno.exit(1);
  }

  const destPath = destinations[cli];
  let destFile = join(destPath, "rampante.md");

  if ("gemini" === cli) {
    destFile = join(destPath, "rampante.toml");
  }

  try {
    await ensureDir(destPath);

    if ("gemini" === cli) {
      await Deno.copyFile(tomlTemplatePath, destFile);
    } else {
      await Deno.copyFile(mdTemplatePath, destFile);
    }

    console.log(`Successfully published rampante command to ${destFile}`);
  } catch (error) {
    console.error(`Error publishing command: ${error.message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
