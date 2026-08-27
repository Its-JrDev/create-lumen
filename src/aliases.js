export function getPathAliases() {
  return { "@/*": ["./src/*"] };
}

export function getViteAliases() {
  return [{ find: "@", replacement: "path.resolve(__dirname, \"src\")" }];
}
