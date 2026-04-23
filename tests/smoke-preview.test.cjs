const test = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const { spawn } = require('node:child_process')
const path = require('node:path')

function createSmokeServer() {
  return http.createServer((req, res) => {
    const { method, url } = req

    const sendJson = (status, payload) => {
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(payload))
    }

    const sendText = (status, body = 'ok') => {
      res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' })
      res.end(body)
    }

    if (method === 'GET' && [
      '/',
      '/about',
      '/properties',
      '/regions',
      '/blog',
      '/guides',
      '/premium',
      '/contact',
      '/process',
      '/faq',
      '/properties/veneto-villa'
    ].includes(url)) {
      return sendText(200)
    }

    if (method === 'GET' && url === '/api/content') {
      return sendJson(200, { properties: [{ slug: { current: 'veneto-villa' } }] })
    }

    if (method === 'GET' && url === '/api/public-articles') {
      return sendJson(200, { articles: [] })
    }

    if (method === 'GET' && url === '/api/payments/session') {
      return sendJson(400, { error: 'Missing session_id' })
    }

    if (method === 'GET' && url === '/api/payments/download') {
      return sendJson(400, { error: 'Missing product' })
    }

    if (method === 'GET' && url === '/api/payments/checkout') {
      return sendJson(405, { error: 'Method not allowed' })
    }

    if (method === 'GET' && url === '/api/free-pdf/upsell') {
      return sendJson(405, { error: 'Method not allowed' })
    }

    if (method === 'POST' && url === '/api/free-pdf/upsell') {
      return sendJson(200, { success: true })
    }

    if (method === 'GET' && url === '/api/marketing-consent') {
      return sendJson(405, { error: 'Method not allowed' })
    }

    if (method === 'POST' && url === '/api/marketing-consent') {
      return sendJson(401, { error: 'Unauthorized' })
    }

    if (method === 'GET' && url === '/api/public-articles/non-existent-slug-test') {
      return sendJson(404, { error: 'Not found' })
    }

    if (method === 'GET' && url === '/api/cron/alerts') {
      return sendJson(401, { error: 'Unauthorized' })
    }

    if (method === 'GET' && url === '/api/cron/follow-up') {
      return sendJson(401, { error: 'Unauthorized' })
    }

    return sendJson(404, { error: 'Unhandled route', method, url })
  })
}

test('smoke-preview script passes against expected routes', async () => {
  const server = createSmokeServer()

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  const scriptPath = path.join(process.cwd(), 'scripts', 'smoke-preview.cjs')
  const child = spawn(process.execPath, [scriptPath, baseUrl], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  })

  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))

  assert.equal(exitCode, 0, `Unexpected smoke-preview exit code.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`)
  assert.match(stdout, /SMOKE_SUMMARY\tPASS\tfailures=0/)
})
