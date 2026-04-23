#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const root = process.cwd();
const syncScript = path.join("scripts", "sync-cs-translations.cjs");

function spawnProcess(command, name) {
  const child = spawn(command, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[dev:i18n] ${name} exited with ${reason}`);
  });

  return child;
}

const nodeBin = process.execPath;
const syncWatcher = spawnProcess(`"${nodeBin}" "${syncScript}" --watch --no-initial`, "i18n-watcher");
const nextDev = spawnProcess("npx next dev --hostname 0.0.0.0 --port 3000", "next-dev");

function shutdown(signal) {
  console.log(`[dev:i18n] shutting down (${signal})...`);
  try {
    if (!syncWatcher.killed) syncWatcher.kill("SIGTERM");
  } catch {}
  try {
    if (!nextDev.killed) nextDev.kill("SIGTERM");
  } catch {}
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
