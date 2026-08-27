import path from "path";
import { promises as fsp } from "fs";

const ENV_GITIGNORE = `
# Environment variables
.env
.env.*
!.env.example
`;

export async function copyEnvExample(projectPath, templatesDir) {
  const src = path.join(templatesDir, ".env.example");
  try {
    await fsp.access(src);
    await fsp.copyFile(src, path.join(projectPath, ".env.example"));
  } catch {}

  // Ensure the project gitignore excludes env files but keeps .env.example.
  const gitignore = path.join(projectPath, ".gitignore");
  try {
    let content = await fsp.readFile(gitignore, "utf8");
    if (!content.includes("!.env.example")) {
      content = content.replace(/\s*$/, "\n") + ENV_GITIGNORE.trimEnd() + "\n";
      await fsp.writeFile(gitignore, content, "utf8");
    }
  } catch {}
}
