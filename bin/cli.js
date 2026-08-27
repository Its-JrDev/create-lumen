#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import chalk from "chalk";
import "../register.js";

const { version } = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

const args = process.argv.slice(2);
const quickSetup = args.includes("-y");
const projectName = args.find((a) => !a.startsWith("-"));

console.log(
  chalk.bold.cyan("\n  ✦ LUMEN") +
    chalk.gray(` v${version}`) +
    chalk.gray(
      "\n  Scaffold a React + Vite project with architecture choice\n"
    )
);

const { main } = await import("@/main.js");

main({ quickSetup, projectName }).catch((e) => {
  console.error(chalk.red("\nError:"), e.message || e);
  process.exit(1);
});
