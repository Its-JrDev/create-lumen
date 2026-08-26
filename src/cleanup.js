import { cleanDir } from "./utils/fs.js";

export async function cleanupBoilerplate(projectPath) {
  await cleanDir(`${projectPath}/public`);
  await cleanDir(`${projectPath}/src/assets`);
}
