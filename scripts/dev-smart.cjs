#!/usr/bin/env node

const { spawn } = require("child_process");

const command = "npx next dev --hostname 0.0.0.0";
let combinedOutput = "";

const child = spawn(command, {
  cwd: process.cwd(),
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

function relay(stream, target) {
  stream.on("data", (chunk) => {
    const text = chunk.toString();
    combinedOutput += text;
    target.write(chunk);
  });
}

relay(child.stdout, process.stdout);
relay(child.stderr, process.stderr);

child.on("exit", (code) => {
  const alreadyRunning = combinedOutput.includes("Another next dev server is already running.");

  if (code !== 0 && alreadyRunning) {
    const localMatches = [...combinedOutput.matchAll(/- Local:\s+(http:\/\/[^\s]+)/g)];
    const localUrl = localMatches.length
      ? localMatches[localMatches.length - 1][1]
      : "http://localhost:3000";
    console.log(`\n[dev] Server Next gia attivo su ${localUrl}.`);
    process.exit(0);
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("[dev] Errore avvio Next:", error.message);
  process.exit(1);
});
