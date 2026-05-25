import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "./test-helpers";

test(".env.example does not define duplicate keys", () => {
  const lines = readFileSync(".env.example", "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const keys = lines.map((line) => line.split("=")[0]);
  assert.deepEqual(keys, [...new Set(keys)]);
});

test(".gitignore excludes TypeScript build info artifacts", () => {
  const gitignore = readFileSync(".gitignore", "utf8");

  assert.match(gitignore, /^tsconfig\.tsbuildinfo$/m);
  assert.match(gitignore, /^\*\.tsbuildinfo$/m);
});
