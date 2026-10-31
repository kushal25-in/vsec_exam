const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = ["index.html", "src/app.js", "src/styles.css", "src/task-store.js"];

fs.rmSync(output, { recursive: true, force: true });
files.forEach((file) => {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
});

console.log(`Built ${files.length} files in dist/`);