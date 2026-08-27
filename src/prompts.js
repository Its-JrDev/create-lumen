import { cancel, confirm, isCancel, note, select, text } from "@clack/prompts";
import chalk from "chalk";
import { configExists, loadConfig, saveConfig } from "@/config-cache.js";

export function onCancel() {
  console.log(chalk.gray("\n\nOperation cancelled.\n"));
  process.exit(1);
}

function formatConfig(responses) {
  const lang = responses.language === "ts" ? "TypeScript" : "JavaScript";
  const arch =
    responses.architecture === "feature-based"
      ? "Feature-based"
      : "Component-based";
  const css =
    responses.cssFramework === "none"
      ? "None"
      : responses.cssFramework === "tailwind"
      ? "Tailwind CSS"
      : "Bootstrap";
  const testing =
    responses.testing === "none"
      ? "None"
      : responses.testing === "vitest"
      ? "Vitest"
      : "Jest";
  const state =
    responses.stateManagement === "none"
      ? "None"
      : responses.stateManagement === "redux"
      ? "Redux Toolkit"
      : "Zustand";

  return [
    `• ${chalk.bold("Architecture:")} ${chalk.green(arch)}`,
    `• ${chalk.bold("Language:")} ${chalk.green(lang)}`,
    `• ${chalk.bold("CSS:")} ${chalk.yellow(css)}`,
    `• ${chalk.bold("Testing:")} ${chalk.magenta(testing)}`,
    `• ${chalk.bold("Router:")} ${responses.router ? chalk.green("Yes") : chalk.red("No")}`,
    `• ${chalk.bold("State:")} ${chalk.blue(state)}`,
    `• ${chalk.bold("Icons:")} ${chalk.blue(responses.iconLibrary === "none" ? "None" : responses.iconLibrary === "lucide" ? "Lucide" : "Huge")}`,
    `• ${chalk.bold("API Client:")} ${responses.apiClient === "axios" ? chalk.green("Axios") : responses.apiClient === "fetch" ? chalk.yellow("Fetch") : chalk.red("None")}`,
    `• ${chalk.bold("Linter:")} ${responses.linter === "oxlint" ? chalk.green("Oxlint") : responses.linter === "eslint" ? chalk.yellow("ESLint") : chalk.red("None")}`,
    `• ${chalk.bold("Formatter:")} ${responses.formatter === "oxfmt" ? chalk.green("Oxfmt") : responses.formatter === "prettier" ? chalk.yellow("Prettier") : chalk.red("None")}`,
    `• ${chalk.bold("Git:")} ${responses.gitInit ? chalk.green("Yes") : chalk.red("No")}`,
    `• ${chalk.bold("README:")} ${responses.readme ? chalk.green("Yes") : chalk.red("No")}`,
  ].join("\n");
}

export async function getUserInputs(projectName) {
  let oldConfig = {};
  let useOldConfig = false;

  if (await configExists()) {
    oldConfig = await loadConfig();
    oldConfig.projectName = projectName;

    note(
      `Previous setup found:\n\n${formatConfig(oldConfig)}\n`,
      "Previous Configuration"
    );

    const useExisting = await select({
      message: "How would you like to proceed?",
      options: [
        { value: true, label: "Continue with previous setup" },
        { value: false, label: "Start fresh (new setup)" },
      ],
      initialValue: true,
    });

    if (isCancel(useExisting)) onCancel();
    useOldConfig = useExisting;

    if (useOldConfig) {
      if (oldConfig.apiClient === undefined) {
        oldConfig.apiClient = oldConfig.axios ? "axios" : "none";
      }
      if (oldConfig.formatter === undefined) {
        oldConfig.formatter = "none";
      }
      return { ...oldConfig, projectName };
    }
  }

  // Quick Setup
  const quickSetup = await confirm({
    message:
      "Quick Setup? (TypeScript + Tailwind + Feature-based + Router + ESLint + Vitest)",
    initialValue: true,
  });
  if (isCancel(quickSetup)) onCancel();

  if (quickSetup) {
    const responses = {
      projectName,
      architecture: "feature-based",
      language: "ts",
      cssFramework: "tailwind",
      testing: "vitest",
      router: true,
      stateManagement: "none",
      iconLibrary: "none",
      apiClient: "none",
      linter: "eslint",
      formatter: "prettier",
      gitInit: true,
      readme: true,
    };
    await saveConfig(responses);
    return responses;
  }

  // Custom setup
  const architecture = await select({
    message: "Which project architecture do you want?",
    options: [
      {
        label: "Feature-based",
        value: "feature-based",
        hint: "Scales to large apps — code grouped by business domain",
      },
      {
        label: "Component-based",
        value: "component-based",
        hint: "Small apps / component libraries — code grouped by UI type",
      },
    ],
    initialValue: "feature-based",
  });
  if (isCancel(architecture)) onCancel();

  const language = await select({
    message: "Which language do you want to use?",
    options: [
      { label: "TypeScript", value: "ts" },
      { label: "JavaScript", value: "js" },
    ],
    initialValue: "ts",
  });
  if (isCancel(language)) onCancel();

  const cssFramework = await select({
    message: "Which CSS framework do you want to use?",
    options: [
      { label: "Tailwind CSS", value: "tailwind" },
      { label: "Bootstrap", value: "bootstrap" },
      { label: "None", value: "none" },
    ],
    initialValue: "tailwind",
  });
  if (isCancel(cssFramework)) onCancel();

  const testing = await select({
    message: "Which testing framework do you want to set up?",
    options: [
      { label: "Vitest", value: "vitest" },
      { label: "Jest", value: "jest" },
      { label: "None", value: "none" },
    ],
    initialValue: "vitest",
  });
  if (isCancel(testing)) onCancel();

  const router = await confirm({
    message: "Would you like to install React Router?",
    initialValue: true,
  });
  if (isCancel(router)) onCancel();

  const stateManagement = await select({
    message: "Which state management library do you want to use?",
    options: [
      { label: "None", value: "none" },
      { label: "Redux Toolkit", value: "redux" },
      { label: "Zustand", value: "zustand" },
    ],
    initialValue: "none",
  });
  if (isCancel(stateManagement)) onCancel();

  const iconLibrary = await select({
    message: "Which icon library would you like to use?",
    options: [
      { label: "None", value: "none" },
      { label: "Lucide Icons", value: "lucide" },
      { label: "Huge Icons", value: "huge" },
    ],
    initialValue: "none",
  });
  if (isCancel(iconLibrary)) onCancel();

  const apiClient = await select({
    message: "Which API client do you want to use?",
    options: [
      { label: "None", value: "none" },
      { label: "Axios", value: "axios" },
      { label: "Fetch (native)", value: "fetch" },
    ],
    initialValue: "none",
  });
  if (isCancel(apiClient)) onCancel();

  const gitInit = await confirm({
    message: "Would you like to initialize a Git repository?",
    initialValue: false,
  });
  if (isCancel(gitInit)) onCancel();

  const linter = await select({
    message: "Which linter do you want to use?",
    options: [
      { label: "ESLint", value: "eslint", hint: "Industry standard JavaScript linter (Recommended)" },
      { label: "Oxlint", value: "oxlint", hint: "Fast Rust-based linter" },
      { label: "None", value: "none" },
    ],
    initialValue: "eslint",
  });
  if (isCancel(linter)) onCancel();

  let formatter = "none";
  if (linter !== "none") {
    const formatterOptions =
      linter === "eslint"
        ? [
            { label: "None", value: "none" },
            { label: "Prettier", value: "prettier" },
          ]
        : [
            { label: "None", value: "none" },
            { label: "Oxfmt (Recommended)", value: "oxfmt" },
            { label: "Prettier", value: "prettier" },
          ];
    formatter = await select({
      message: "Which formatter do you want to use?",
      options: formatterOptions,
      initialValue: linter === "eslint" ? "prettier" : "oxfmt",
    });
    if (isCancel(formatter)) onCancel();
  }

  const readme = await confirm({
    message: "Would you like to generate a README.md and LICENSE?",
    initialValue: true,
  });
  if (isCancel(readme)) onCancel();

  const responses = {
    projectName,
    architecture,
    language,
    cssFramework,
    testing,
    router,
    stateManagement,
    iconLibrary,
    apiClient,
    linter,
    formatter,
    gitInit,
    readme,
  };

  await saveConfig(responses);
  return responses;
}
