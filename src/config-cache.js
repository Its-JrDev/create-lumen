import { access, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const CONFIG_PATH = path.join(os.homedir(), ".lumen-config.json");

export async function configExists() {
  try {
    await access(CONFIG_PATH);
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig() {
  try {
    const content = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function saveConfig(data) {
  await writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}
