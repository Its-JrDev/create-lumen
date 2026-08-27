#!/usr/bin/env node

import chalk from "chalk";
import "../register.js";

console.log(
  chalk.bold.cyan("\n  ✦ LUMEN") +
    chalk.gray(" v1.1.0") +
    chalk.gray(
      "\n  Scaffold a React + Vite project with architecture choice\n"
    )
);

const { main } = await import("@/main.js");

main().catch((e) => {
  console.error(chalk.red("\nError:"), e.message || e);
  process.exit(1);
});
