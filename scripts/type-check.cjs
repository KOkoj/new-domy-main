const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = process.cwd();
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

if (!fs.existsSync(tsconfigPath)) {
  console.log('No tsconfig.json found; skipping standalone tsc check.');
  console.log('Type checking is still performed during `next build`.');
  process.exit(0);
}

const tscBin = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');

if (!fs.existsSync(tscBin)) {
  console.error('TypeScript is not installed. Run `npm install -D typescript`.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [tscBin, '--noEmit', '-p', tsconfigPath], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
