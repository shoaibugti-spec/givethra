import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const buildId = createHash("sha256").update(`${source}:${Date.now()}`).digest("hex").slice(0, 12);
const output = source.replaceAll("__GIVETHRA_BUILD_ID__", buildId);
await writeFile(new URL("../public/sw.js", import.meta.url), output);
console.log(`Prepared Givethra release ${buildId}`);
