#!/usr/bin/env node
/**
 * Recheck hotlinked property photos (immobiliare.it / idealista.it CDNs)
 * and rewrite data/broken-external-images.json with URLs that are not 200/206.
 *
 * Usage: node scripts/refresh-broken-external-images.cjs
 *
 * Does not change listing copy or inventory records. Original image URLs
 * stay in data/local-properties.json so they can be restored if a source
 * listing comes back.
 */
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const root = path.join(__dirname, '..')
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/local-properties.json'), 'utf8'))
const outFile = path.join(root, 'data/broken-external-images.json')

const urls = [...new Set(
  inventory.flatMap((property) => Array.isArray(property.images) ? property.images : [])
    .filter((url) => typeof url === 'string' && /^https?:\/\//.test(url))
)]

function check(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https:') ? https : http
    const req = lib.request(url, {
      method: 'HEAD',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'image/*',
        Referer: 'https://www.domyvitalii.cz/',
      },
    }, (res) => {
      res.resume()
      resolve({ url, status: res.statusCode })
    })
    req.on('timeout', () => {
      req.destroy()
      resolve({ url, status: 0 })
    })
    req.on('error', () => resolve({ url, status: 0 }))
    req.end()
  })
}

async function run() {
  const results = []
  const queue = [...urls]
  const workers = 16
  async function worker() {
    while (queue.length) {
      const url = queue.shift()
      results.push(await check(url))
    }
  }
  await Promise.all(Array.from({ length: workers }, worker))
  const broken = results.filter((item) => item.status !== 200 && item.status !== 206).map((item) => item.url).sort()
  fs.writeFileSync(outFile, JSON.stringify(broken, null, 2) + '\n')
  const ok = results.length - broken.length
  console.log(`checked ${results.length} external URLs: ${ok} ok, ${broken.length} broken`)
  console.log(`wrote ${path.relative(root, outFile)}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
