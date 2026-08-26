import {
  access,
  readdir,
  readFile,
  rm,
  stat,
  unlink,
  writeFile,
  mkdir,
  copyFile,
} from "fs/promises";
import path from "path";

export async function deleteIfExists(filePath) {
  try {
    await access(filePath);
    const s = await stat(filePath);
    if (s.isDirectory()) {
      await rm(filePath, { recursive: true, force: true });
    } else {
      await unlink(filePath);
    }
  } catch {
    // doesn't exist, skip
  }
}

export async function cleanDir(dirPath) {
  try {
    await access(dirPath);
    const files = await readdir(dirPath);
    for (const file of files) {
      const target = path.join(dirPath, file);
      const s = await stat(target);
      if (s.isDirectory()) {
        await rm(target, { recursive: true, force: true });
      } else {
        await unlink(target);
      }
    }
  } catch {
    // doesn't exist, skip
  }
}

export async function copyDirRecursive(srcDir, destDir, filterFn) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (filterFn && !filterFn(entry.name, srcPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath, filterFn);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

export async function writeFileRecursive(filePath, content) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, "utf8");
}

export async function readFileContent(filePath) {
  return readFile(filePath, "utf8");
}
