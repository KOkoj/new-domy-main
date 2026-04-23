const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

test('type-check script runs tsc when tsconfig exists', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'domy-typecheck-'))

  fs.mkdirSync(path.join(tempDir, 'node_modules', 'typescript', 'bin'), { recursive: true })
  fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { noEmit: true } }))
  fs.writeFileSync(
    path.join(tempDir, 'node_modules', 'typescript', 'bin', 'tsc'),
    "console.log('fake-tsc-ok'); process.exit(0);"
  )

  const result = spawnSync(process.execPath, [path.join(process.cwd(), 'scripts', 'type-check.cjs')], {
    cwd: tempDir,
    encoding: 'utf8'
  })

  fs.rmSync(tempDir, { recursive: true, force: true })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /fake-tsc-ok/)
})
