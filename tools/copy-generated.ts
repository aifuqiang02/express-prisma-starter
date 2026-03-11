import fs from "node:fs";
import path from "node:path";

const source = path.resolve("src/generated");
const destination = path.resolve("dist/src/generated");

if (!fs.existsSync(source)) {
  throw new Error(`Generated client directory not found: ${source}`);
}

fs.mkdirSync(destination, { recursive: true });
fs.cpSync(source, destination, { recursive: true });
