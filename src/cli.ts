import * as dotenv from "dotenv";
import { Command } from "commander";
const cli = new Command("dawg");

dotenv.config();

import pull from "./cli/pull";

async function main() {
  cli
    .command("pull")
    .option("--dry-run", "Skip writing .md files to disk")
    .action(pull);

  await cli.parseAsync();
}

main();
