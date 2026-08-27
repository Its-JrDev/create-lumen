import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { deleteIfExists } from "@/utils/fs.js";

export async function setupCssFramework({
  projectPath,
  templatesDir,
  language,
  cssFramework,
  ext,
  pkg,
}) {
  process.chdir(projectPath);
  const cssDir = path.join(templatesDir, "css");
  const indexCssPath = path.join(projectPath, "src", "index.css");

  if (cssFramework === "tailwind") {
    const viteConfigFile = `vite.config.${language === "ts" ? "ts" : "js"}`;
    const viteConfigTarget = path.join(projectPath, viteConfigFile);
    const viteConfigContent = await fsp.readFile(
      path.join(cssDir, "tailwind", viteConfigFile),
      "utf8"
    );
    await fsp.writeFile(viteConfigTarget, viteConfigContent, "utf8");

    const indexCssContent = await fsp.readFile(
      path.join(cssDir, "tailwind", "src", "index.css"),
      "utf8"
    );
    await fsp.writeFile(indexCssPath, indexCssContent, "utf8");
  } else if (cssFramework === "bootstrap") {
    const mainFile = path.join(projectPath, "src", `main.${ext}`);
    if (fs.existsSync(mainFile)) {
      let mainContent = await fsp.readFile(mainFile, "utf8");
      if (
        !mainContent.includes("bootstrap/dist/css/bootstrap.min.css")
      ) {
        mainContent =
          "import 'bootstrap/dist/css/bootstrap.min.css';\n" + mainContent;
        await fsp.writeFile(mainFile, mainContent, "utf8");
      }
    }
    const indexCssContent = await fsp.readFile(
      path.join(cssDir, "bootstrap", "src", "index.css"),
      "utf8"
    );
    await fsp.writeFile(indexCssPath, indexCssContent, "utf8");
  } else {
    const indexCssContent = await fsp.readFile(
      path.join(cssDir, "none", "src", "index.css"),
      "utf8"
    );
    await fsp.writeFile(indexCssPath, indexCssContent, "utf8");
  }

  // Clean up Vite's default App.css
  await deleteIfExists(path.join(projectPath, "src", "App.css"));
}
