import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const candidates = [
  path.resolve("node_modules/wrangler/bin/wrangler.js"),
  path.resolve("node_modules/wrangler/wrangler-dist/cli.js")
];

const wranglerEntrypoint = candidates.find((candidate) => fs.existsSync(candidate));

if (!wranglerEntrypoint) {
  console.error("Could not find a local Wrangler entrypoint. Run npm install first.");
  process.exit(1);
}

const child = spawn(process.execPath, [wranglerEntrypoint, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
