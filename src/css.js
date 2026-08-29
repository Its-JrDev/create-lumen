import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { deleteIfExists } from "@/utils/fs.js";

export async function setupCssFramework({
  projectPath,
  templatesDir,
  language,
  cssFramework,
  architecture,
  ext,
  pkg,
}) {
  process.chdir(projectPath);
  const cssDir = path.join(templatesDir, "css");
  const indexCssPath = path.join(projectPath, "src", "index.css");
  // Feature-based main.* imports ./shared/styles/globals.css; component-based
  // imports ./styles/globals.css. The chosen framework's styles must land in
  // the file the architecture actually imports.
  const globalsCssPath =
    architecture === "feature-based"
      ? path.join(projectPath, "src", "shared", "styles", "globals.css")
      : path.join(projectPath, "src", "styles", "globals.css");

  async function writeCss(content) {
    await fsp.writeFile(indexCssPath, content, "utf8");
    try {
      await fsp.access(globalsCssPath);
      await fsp.writeFile(globalsCssPath, content, "utf8");
    } catch {}
  }

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
    await writeCss(indexCssContent);
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
    await writeCss(indexCssContent);
  } else {
    const indexCssContent = await fsp.readFile(
      path.join(cssDir, "none", "src", "index.css"),
      "utf8"
    );
    await writeCss(indexCssContent);
  }

  // Clean up Vite's default App.css
  await deleteIfExists(path.join(projectPath, "src", "App.css"));
}
