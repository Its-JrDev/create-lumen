import { execaSync } from "execa";

export function isYarnV1() {
  try {
    const { stdout } = execaSync("yarn", ["-v"]);
    return stdout.trim().startsWith("1.");
  } catch {
    return false;
  }
}
