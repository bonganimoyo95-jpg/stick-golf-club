import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const workerPath = resolve(root, "worker", "index.js");
const outputPath = resolve(root, "index.html");
const source = readFileSync(workerPath, "utf8");

const opening = "const page = `";
const start = source.indexOf(opening);
const end = source.lastIndexOf("`;");

if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not locate the embedded page in worker/index.js");
}

const html = source.slice(start + opening.length, end);

if (!html.startsWith("<!doctype html>") || !html.includes("<canvas id=\"game\"")) {
  throw new Error("The generated page did not pass the expected content checks");
}

writeFileSync(outputPath, html + "\n", "utf8");
console.log("Generated index.html for GitHub Pages");
