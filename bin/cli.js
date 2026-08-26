#!/usr/bin/env node

import { main } from "../src/main.js";
import chalk from "chalk";

console.log(
  chalk.bold.cyan("\n  ✦ LUMEN") +
    chalk.gray(" v1.1.0") +
    chalk.gray(
      "\n  Scaffold a React + Vite project with architecture choice\n"
    )
);

main().catch((e) => {
  console.error(chalk.red("\nError:"), e.message || e);
  process.exit(1);
});
