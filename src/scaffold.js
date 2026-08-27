import path from "path";
import { execa } from "execa";
import { isYarnV1 } from "@/utils/yarn-v1.js";

export async function runViteCreate(projectPath, projectName, pkg, language) {
  const useYarn = pkg === "yarn";
  const isYarn1 = useYarn && isYarnV1();
  const useNpm = pkg === "npm";
  const template = language === "ts" ? "react-ts" : "react";

  const createArgs = [
    "create",
    isYarn1 ? "vite" : "vite@latest",
    projectName,
    useNpm && "--",
    "--template",
    template,
  ].filter(Boolean);

  await execa(pkg, createArgs, { stdio: "pipe", cwd: path.dirname(projectPath) });
}

export async function runBaseInstall(projectPath, pkg) {
  await execa(pkg, ["install"], { stdio: "pipe", cwd: projectPath });
}

export async function runGitInit(projectPath) {
  await execa("git", ["init"], { stdio: "pipe", cwd: projectPath });
}
