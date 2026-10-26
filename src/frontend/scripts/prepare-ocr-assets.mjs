import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const require = createRequire(import.meta.url);
const tesseractEntry = require.resolve("tesseract.js");
const tesseractDir = path.dirname(path.dirname(tesseractEntry));
const coreDir = path.resolve(tesseractDir, "../tesseract.js-core");
const outputDir = path.join(frontendDir, "public/ocr");
const outputCoreDir = path.join(outputDir, "core");
const modelPath = path.join(outputDir, "lang/eng.traineddata.gz");

await mkdir(outputCoreDir, { recursive: true });
await mkdir(path.dirname(modelPath), { recursive: true });

const files = [
  [
    path.join(tesseractDir, "dist/worker.min.js"),
    path.join(outputDir, "worker.min.js"),
  ],
  [
    path.join(tesseractDir, "LICENSE.md"),
    path.join(outputDir, "TESSERACT-JS-LICENSE.md"),
  ],
  [path.join(coreDir, "LICENSE"), path.join(outputCoreDir, "LICENSE")],
  ...[
    "tesseract-core-lstm.wasm.js",
    "tesseract-core-lstm.wasm",
    "tesseract-core-simd-lstm.wasm.js",
    "tesseract-core-simd-lstm.wasm",
  ].map((name) => [path.join(coreDir, name), path.join(outputCoreDir, name)]),
];

for (const [source, destination] of files) {
  await copyFile(source, destination);
}

const model = await readFile(modelPath);
if (model.length < 1_000_000 || model[0] !== 0x1f || model[1] !== 0x8b) {
  throw new Error(`Missing or invalid English Tesseract model: ${modelPath}`);
}

const totalBytes = (
  await Promise.all(files.map(([, destination]) => stat(destination)))
).reduce((sum, file) => sum + file.size, model.length);
console.log(
  `Prepared same-origin Tesseract OCR assets (${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`,
);
