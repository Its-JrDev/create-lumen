import { isCancel, log, spinner, text } from "@clack/prompts";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

import { confirmEmptyFolder } from "@/confirm-empty-folder.js";
import { copyEnvExample } from "@/env.js";
import { cleanupBoilerplate } from "@/cleanup.js";
import { configureProject } from "@/configure.js";
import { setupCssFramework } from "@/css.js";
import { injectArchitecture, injectConditionals, injectFormatter } from "@/injector.js";
import { getPkgManager } from "@/utils/pkg-manager.js";
import { handleDevServer } from "@/utils/dev-server.js";
import { getUserInputs, onCancel } from "@/prompts.js";
import { runBaseInstall, runGitInit, runViteCreate } from "@/scaffold.js";
import { installAllDeps } from "@/dependencies.js";
import { generateReadme } from "@/readme.js";
import { runProjectFormat } from "@/format.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, "../templates");
const CURRENT_DIR = process.cwd();

export function resolveProjectName({ quickSetup = false, projectName: nameArg, cwd = CURRENT_DIR } = {}) {
  const cliArgs = (process.argv.slice(2) ?? []).filter((arg) => arg && !arg.startsWith("-"));
  const cliArg = nameArg || cliArgs[0] || null;

  if (cliArg && cliArg.trim()) {
    return cliArg.trim();
  }

  if (quickSetup) {
    const defaultName = path.basename(cwd).trim() || "my-app";
    return defaultName === "." ? "my-app" : defaultName;
  }

  return null;
}

export async function main(options = {}) {
  const { quickSetup = false, projectName: nameArg } = options;
  const pkg = getPkgManager();

  // 1. Project name
  let projectName = resolveProjectName({ quickSetup, projectName: nameArg, cwd: CURRENT_DIR });

  if (projectName) {
    log.step(chalk.gray(`Project name: ${chalk.bold(projectName)}`));
  } else {
    projectName = await text({
      message: "What is your project name?",
      placeholder: "my-app",
      validate(value) {
        if (!value || !value.trim()) return "Project name is required!";
      },
    });
    if (isCancel(projectName)) onCancel();
  }

  // 2. Handle existing folder
  await confirmEmptyFolder(projectName);

  // 3. Collect user preferences
  const responses = await getUserInputs(projectName, { quickSetup });

  const projectPath = path.resolve(CURRENT_DIR, projectName);

  // 4. Scaffold via vite create
  const createSpin = spinner();
  createSpin.start("Creating your Vite + React project...");
  try {
    await runViteCreate(projectPath, projectName, pkg, responses.language);
    createSpin.stop(chalk.green("Project created successfully!"));
  } catch (err) {
    createSpin.stop(chalk.red("Failed to create project."));
    throw err;
  }

  // 5. Install base dependencies
  const depSpin = spinner();
  depSpin.start(`Installing dependencies using ${pkg}...`);
  try {
    await runBaseInstall(projectPath, pkg);
    depSpin.stop(chalk.green("Dependencies installed."));
  } catch (err) {
    depSpin.stop(chalk.red("Failed to install dependencies."));
    throw err;
  }

  // 6. Git init (if requested)
  if (responses.gitInit) {
    const gitSpin = spinner();
    gitSpin.start("Initializing git repository...");
    try {
      await runGitInit(projectPath);
      gitSpin.stop(chalk.green("Git repository initialized."));
    } catch (err) {
      gitSpin.stop(chalk.red("Git initialization failed."));
      throw err;
    }
  }

  // 7. Inject architecture templates
  const archSpin = spinner();
  archSpin.start(
    `Setting up ${responses.architecture === "feature-based" ? "feature-based" : "component-based"} architecture...`
  );
  try {
    await injectArchitecture(
      projectPath,
      TEMPLATES_DIR,
      responses.architecture,
      responses.language
    );
    archSpin.stop(chalk.green("Architecture scaffolding complete."));
  } catch (err) {
    archSpin.stop(chalk.red("Failed to scaffold architecture."));
    throw err;
  }

  // 8. Inject conditional features
  const condSpin = spinner();
  condSpin.start("Installing additional features...");
  try {
    await injectConditionals(
      projectPath,
      TEMPLATES_DIR,
      responses,
      responses.architecture,
      responses.language
    );
    condSpin.stop(chalk.green("Features configured."));
  } catch (err) {
    condSpin.stop(chalk.red("Failed to configure features."));
    throw err;
  }

  // 8.5 Inject formatter (config file + scripts + eslint-config-prettier wiring)
  const fmtSpin = spinner();
  fmtSpin.start("Configuring code formatter...");
  try {
    await injectFormatter(projectPath, TEMPLATES_DIR, responses);
    fmtSpin.stop(chalk.green("Formatter configured."));
  } catch (err) {
    fmtSpin.stop(chalk.red("Failed to configure formatter."));
    throw err;
  }

  // 9. Install all additional dependencies in one batch
  const extrasSpin = spinner();
  extrasSpin.start("Installing additional dependencies...");
  try {
    await installAllDeps(responses, pkg, projectPath);
    extrasSpin.stop(chalk.green("Additional dependencies installed."));
  } catch (err) {
    extrasSpin.stop(chalk.red("Failed to install additional dependencies."));
    throw err;
  }

  // 10. CSS framework setup
  const cssSpin = spinner();
  const cssLabel =
    responses.cssFramework === "none"
      ? "CSS reset"
      : responses.cssFramework === "tailwind"
      ? "Tailwind CSS"
      : "Bootstrap";
  if (responses.cssFramework !== "none") {
    cssSpin.start(`Setting up ${cssLabel}...`);
  }
  try {
    await setupCssFramework({
      projectPath,
      templatesDir: TEMPLATES_DIR,
      language: responses.language,
      cssFramework: responses.cssFramework,
      ext: responses.language === "ts" ? "tsx" : "jsx",
      pkg,
    });
    if (responses.cssFramework !== "none") {
      cssSpin.stop(chalk.green(`${cssLabel} setup complete.`));
    }
  } catch (err) {
    cssSpin.stop(chalk.red(`Failed to setup ${cssLabel}.`));
    throw err;
  }

  // 11. Configure path aliases + package.json
  const configSpin = spinner();
  configSpin.start("Configuring project...");
  try {
    await configureProject(projectPath, responses.language, responses.cssFramework);
    configSpin.stop(chalk.green("Project configured."));
  } catch (err) {
    configSpin.stop(chalk.red("Failed to configure project."));
    throw err;
  }

  // 12. Cleanup boilerplate
  await cleanupBoilerplate(projectPath);

  // 12.5 Copy .env.example into the project
  await copyEnvExample(projectPath, TEMPLATES_DIR);

  // 13. Generate README.md + LICENSE (if requested)
  if (responses.readme) {
    const readmeSpin = spinner();
    readmeSpin.start("Generating README.md and LICENSE...");
    try {
      await generateReadme(projectPath, projectName, responses);
      readmeSpin.stop(chalk.green("README.md and LICENSE generated."));
    } catch (err) {
      readmeSpin.stop(chalk.red("Failed to generate README.md and LICENSE."));
      throw err;
    }
  }

  // 13.5 Format the freshly generated project so it is canonical on init
  if (responses.formatter && responses.formatter !== "none") {
    const fmtPassSpin = spinner();
    fmtPassSpin.start(`Formatting project with ${responses.formatter}...`);
    try {
      await runProjectFormat(projectPath, responses);
      fmtPassSpin.stop(chalk.green("Project formatted."));
    } catch (err) {
      fmtPassSpin.stop(chalk.red("Failed to format project."));
      throw err;
    }
  }

  log.step(chalk.green("\nProject setup complete!"));
  log.message(
    chalk.gray(
      `  Architecture: ${responses.architecture === "feature-based" ? "Feature-based" : "Component-based"}`
    )
  );

  // 14. Offer dev server
  await handleDevServer(pkg, projectName);
}
