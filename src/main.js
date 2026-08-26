import { isCancel, log, spinner, text } from "@clack/prompts";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

import { confirmEmptyFolder } from "./confirm-empty-folder.js";
import { cleanupBoilerplate } from "./cleanup.js";
import { configureProject } from "./configure.js";
import { setupCssFramework } from "./css.js";
import { injectArchitecture, injectConditionals } from "./injector.js";
import { getPkgManager } from "./utils/pkg-manager.js";
import { handleDevServer } from "./utils/dev-server.js";
import { getUserInputs, onCancel } from "./prompts.js";
import { runBaseInstall, runGitInit, runViteCreate } from "./scaffold.js";
import { installAllDeps } from "./dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, "../templates");
const CURRENT_DIR = process.cwd();

export async function main() {
  const pkg = getPkgManager();

  // 1. Project name
  const projectName = await text({
    message: "What is your project name?",
    placeholder: "my-app",
    validate(value) {
      if (!value || !value.trim()) return "Project name is required!";
    },
  });
  if (isCancel(projectName)) onCancel();

  // 2. Handle existing folder
  await confirmEmptyFolder(projectName);

  // 3. Collect user preferences
  const responses = await getUserInputs(projectName);

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

  log.step(chalk.green("\nProject setup complete!"));
  log.message(
    chalk.gray(
      `  Architecture: ${responses.architecture === "feature-based" ? "Feature-based" : "Component-based"}`
    )
  );

  // 13. Offer dev server
  await handleDevServer(pkg, projectName);
}
