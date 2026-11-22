const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

let sucrase = null
try {
  sucrase = require('sucrase')
} catch {
  sucrase = null
}

// Loads an ESM/JSX source file as CommonJS; `stubs` replace imports by name.
// '@/x' imports without a stub are loaded the same way from the repo.
function load(file, stubs = {}, cache = new Map()) {
  if (cache.has(file)) return cache.get(file)
  const { code } = sucrase.transform(read(file), {
    transforms: ['jsx', 'imports'],
    jsxRuntime: 'automatic',
    production: true,
    filePath: file
  })
  const module = { exports: {} }
  cache.set(file, module.exports)
  const localRequire = (name) => {
    if (Object.prototype.hasOwnProperty.call(stubs, name)) return stubs[name]
    if (name.startsWith('@/')) {
      const base = name.slice(2)
      const found = ['.js', '.jsx', '/index.js'].map((ext) => base + ext).find((candidate) => fs.existsSync(path.join(root, candidate)))
      return load(found, stubs, cache)
    }
    return require(name)
  }
  new Function('require', 'module', 'exports', 'process', code)(localRequire, module, module.exports, process)
  cache.set(file, module.exports)
  return module.exports
}

class FakeResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = init.headers || {}
  }
  static json(body, init) {
    return new FakeResponse(body, init)
  }
}
const nextServer = { NextResponse: FakeResponse }

// Chainable Supabase query stub resolving to `result`.
function queryStub(result) {
  const chain = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === 'then') return (resolve, reject) => Promise.resolve(result).then(resolve, reject)
        if (prop === 'single' || prop === 'maybeSingle') return () => Promise.resolve(result)
        return () => chain
      }
    }
  )
  return chain
}

const missingTable = { data: null, error: { code: '42P01', message: 'relation "public.client_messages" does not exist' } }
const missingTableRest = { data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.client_messages' in the schema cache" } }

const skipIfNoSucrase = { skip: sucrase ? false : 'sucrase not installed' }

test('missing-table detection covers Postgres and PostgREST errors', skipIfNoSucrase, () => {
  const { isMissingTableError } = load('lib/clientMessages.js')
  assert.equal(isMissingTableError(missingTable.error), true)
  assert.equal(isMissingTableError(missingTableRest.error), true)
  assert.equal(isMissingTableError({ code: '42501', message: 'permission denied' }), false)
  assert.equal(isMissingTableError(null), false)
})

test('message body validation and author labels', skipIfNoSucrase, () => {
  const lib = load('lib/clientMessages.js')
  assert.equal(lib.normalizeMessageBody('  Dobrý den\r\nLuca  '), 'Dobrý den\nLuca')
  assert.equal(lib.normalizeMessageBody('   '), '')
  assert.equal(lib.normalizeMessageBody('x'.repeat(4001)), '')
  assert.equal(lib.AUTHOR_LABELS.team, 'Lucie a Luca')
  assert.equal(lib.authorAvatar('team'), 'both')
  assert.equal(lib.authorAvatar('luca'), 'luca')
  assert.equal(lib.foldText('Toskánsko'), 'toskansko')
})

test('e-mail safety switch: only test inboxes outside production', skipIfNoSucrase, () => {
  const { canSendMessageNotification } = load('lib/clientMessages.js')
  const preview = { VERCEL_ENV: 'preview' }
  assert.equal(canSendMessageNotification('jarvis-matej@mail.grokbot.com', preview), true)
  assert.equal(canSendMessageNotification('jarvis-matej+zona2@mail.grokbot.com', preview), true)
  assert.equal(canSendMessageNotification('klient@example.com', preview), false)
  assert.equal(canSendMessageNotification('jarvis-matej@mail.grokbot.com.evil.cz', preview), false)
  assert.equal(canSendMessageNotification('klient@example.com', {}), false)
  assert.equal(canSendMessageNotification('klient@example.com', { VERCEL_ENV: 'production' }), true)
  assert.equal(canSendMessageNotification('', { VERCEL_ENV: 'production' }), false)
})

function loadNotify({ configured = true, email, sendImpl }) {
  const sent = []
  const emailService = {
    isConfigured: configured,
    sendClientMessageNotification: async (args) => {
      sent.push(args)
      return sendImpl ? sendImpl(args) : { success: true }
    }
  }
  const { notifyClient } = load('lib/clientMessagesServer.js', {
    '@/lib/emailService': { __esModule: true, default: emailService },
    '@/lib/zoneHouses': { resolveZoneHouses: async () => new Map() }
  })
  const admin = { auth: { admin: { getUserById: async () => ({ data: { user: { email } }, error: null }) } } }
  return { notifyClient, admin, sent }
}

test('notification: skipped outside production for real clients, never throws', skipIfNoSucrase, async () => {
  const saved = process.env.VERCEL_ENV
  try {
    process.env.VERCEL_ENV = 'preview'
    let ctx = loadNotify({ email: 'klient@example.com' })
    assert.equal(await ctx.notifyClient(ctx.admin, 'id', 'luca'), 'skipped')
    assert.equal(ctx.sent.length, 0)

    ctx = loadNotify({ email: 'jarvis-matej+zona@mail.grokbot.com' })
    assert.equal(await ctx.notifyClient(ctx.admin, 'id', 'luca'), 'sent')
    assert.equal(ctx.sent.length, 1)

    ctx = loadNotify({ configured: false, email: 'jarvis-matej@mail.grokbot.com' })
    assert.equal(await ctx.notifyClient(ctx.admin, 'id', 'luca'), 'skipped')
    assert.equal(ctx.sent.length, 0)

    ctx = loadNotify({ email: 'jarvis-matej@mail.grokbot.com', sendImpl: () => { throw new Error('boom') } })
    assert.equal(await ctx.notifyClient(ctx.admin, 'id', 'luca'), 'failed')

    process.env.VERCEL_ENV = 'production'
    ctx = loadNotify({ email: 'klient@example.com' })
    assert.equal(await ctx.notifyClient(ctx.admin, 'id', 'team'), 'sent')
  } finally {
    if (saved === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = saved
  }
})

function routeStubs({ user, result, adminResult }) {
  const supabase = { from: () => queryStub(result) }
  return {
    'next/server': nextServer,
    '@/lib/serverAuth': {
      createRouteSupabaseClient: async () => ({ supabase, applyCookies: (response) => response }),
      getAuthenticatedUser: async () => user
    },
    '@/lib/zoneHouses': { resolveZoneHouses: async () => new Map(), toZoneHouse: (p) => p },
    '@/lib/emailService': { __esModule: true, default: { isConfigured: false } },
    '@/lib/supabaseAdmin': { getSupabaseAdminClient: () => ({ from: () => queryStub(adminResult || result) }) },
    '@/lib/rateLimit': { checkRateLimit: () => ({ allowed: true }) },
    '@/lib/propertyApi': { getListableProperties: async () => [] }
  }
}

test('client thread API: missing table means an empty thread, not an error', skipIfNoSucrase, async () => {
  for (const result of [missingTable, missingTableRest]) {
    const route = load('app/api/zone/messages/route.js', routeStubs({ user: { id: 'u1' }, result }))
    const response = await route.GET()
    assert.equal(response.status, 200)
    assert.deepEqual(response.body, { messages: [] })

    const read = load('app/api/zone/messages/read/route.js', routeStubs({ user: { id: 'u1' }, result }))
    const readResponse = await read.POST()
    assert.equal(readResponse.status, 200)
    assert.deepEqual(readResponse.body, { updated: 0 })
  }

  const anonymous = load('app/api/zone/messages/route.js', routeStubs({ user: null, result: missingTable }))
  assert.equal((await anonymous.GET()).status, 401)
})

function adminAuthStubs({ role, email = 'someone@example.com' }) {
  const user = { id: '11111111-1111-1111-1111-111111111111', email }
  const supabase = { from: () => queryStub({ data: { id: user.id, role }, error: null }) }
  return {
    'next/server': nextServer,
    '@/lib/serverAuth': {
      createRouteSupabaseClient: async () => ({ supabase, applyCookies: (response) => response }),
      getAuthenticatedUser: async () => user
    },
    '@/lib/supabaseAdmin': { getSupabaseAdminClient: () => ({ from: () => queryStub(missingTable) }) }
  }
}

const ADMIN_ROUTES = [
  ['app/api/admin/messages/route.js', ['GET', 'POST']],
  ['app/api/admin/messages/clients/route.js', ['GET']],
  ['app/api/admin/messages/properties/route.js', ['GET']]
]

test('admin message APIs: non-admin gets 403, admin gets a clear missing-migration error', skipIfNoSucrase, async () => {
  const request = (url, body) => ({
    url,
    headers: new Map(),
    json: async () => body || {}
  })
  for (const [file, methods] of ADMIN_ROUTES) {
    const stubs = routeStubs({ user: null, result: missingTable })
    const forbidden = load(file, { ...stubs, '@/lib/adminAuth': load('lib/adminAuth.js', adminAuthStubs({ role: 'user' })) })
    for (const method of methods) {
      const response = await forbidden[method](request('https://x/api?clientId=11111111-1111-1111-1111-111111111111&q=to'))
      assert.equal(response.status, 403, `${file} ${method}`)
    }
  }

  const stubs = routeStubs({ user: null, result: missingTable })
  const asAdmin = load('app/api/admin/messages/route.js', {
    ...stubs,
    '@/lib/adminAuth': load('lib/adminAuth.js', adminAuthStubs({ role: 'admin' }))
  })
  const history = await asAdmin.GET(request('https://x/api/admin/messages?clientId=22222222-2222-2222-2222-222222222222'))
  assert.equal(history.status, 503)
  assert.match(history.body.error, /db\/setup-client-messages\.sql/)

  const sent = await asAdmin.POST(
    request('https://x/api/admin/messages', { clientId: '22222222-2222-2222-2222-222222222222', authorKind: 'luca', body: 'Ahoj' })
  )
  assert.equal(sent.status, 503)
  assert.equal(sent.body.code, 'missing_migration')

  const badAuthor = await asAdmin.POST(
    request('https://x/api/admin/messages', { clientId: '22222222-2222-2222-2222-222222222222', authorKind: 'client', body: 'Ahoj' })
  )
  assert.equal(badAuthor.status, 400)
})

test('thread renders authors, dates, plain text and the attached house', skipIfNoSucrase, () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const stubs = {
    'lucide-react': { Heart: () => React.createElement('svg', { 'data-icon': 'heart' }) },
    './ZoneShell': { HouseRow: ({ house }) => React.createElement('a', { href: `/properties/${house.slug}`, 'data-house': house.id }, house.title) },
    './ZoneSidebar': { TeamAvatars: ({ who }) => React.createElement('span', { 'data-avatars': who }) }
  }
  const { default: MessageThread } = load('components/zone/MessageThread.jsx', stubs)
  const house = { id: 'local-import-x', slug: 'mlyn', title: 'Zrekonstruovaný bývalý mlýn ve Valdottavu', price: 250000 }
  const html = renderToStaticMarkup(
    React.createElement(MessageThread, {
      messages: [
        { id: '3', authorKind: 'client', body: 'Děkuji!', createdAt: '2026-11-20T10:00:00Z', readAt: null },
        { id: '2', authorKind: 'luca', body: 'Byl jsem tam.\nStřecha <b>potřebuje</b> opravu.', house, createdAt: '2026-11-19T10:00:00Z', readAt: null },
        { id: '1', authorKind: 'team', body: 'Vítejte', createdAt: '2026-11-18T10:00:00Z', readAt: '2026-11-18T11:00:00Z' }
      ],
      savedIds: new Set(['local-import-x']),
      onToggleSaved: () => {}
    })
  )
  assert.match(html, /data-avatars="luca"/)
  assert.match(html, /data-avatars="both"/)
  assert.match(html, />Luca</)
  assert.match(html, /Lucie a Luca/)
  assert.match(html, /Vy · /)
  assert.match(html, /Střecha &lt;b&gt;potřebuje&lt;\/b&gt; opravu/) // no HTML injection
  assert.match(html, /whitespace-pre-line/)
  assert.match(html, /data-house="local-import-x"/)
  assert.match(html, /aria-pressed="true"/)
  assert.equal((html.match(/data-unread="true"/g) || []).length, 1)
  assert.match(html, /19\. 11\. 11:00/)
})

test('zone page loads the thread in parallel and keeps the old empty state', () => {
  const page = read('app/dashboard/page.js')
  assert.match(page, /useZoneMessages\(\)/)
  assert.match(page, /thread\.messages\.length > 0/)
  assert.match(page, /<WelcomeCard \/>/)
  const thread = read('components/zone/MessageThread.jsx')
  assert.match(thread, /\/api\/zone\/messages\/read/)
  assert.match(thread, /AbortController/)
  assert.doesNotMatch(thread, /dangerouslySetInnerHTML|<textarea/)
  const shell = read('app/admin/AdminShell.jsx')
  assert.match(shell, /href: '\/admin\/zpravy'/)
})

test('migration is idempotent and keeps clients to their own thread', () => {
  const sql = read('db/setup-client-messages.sql')
  assert.match(sql, /create table if not exists public\.client_messages/)
  assert.match(sql, /enable row level security/)
  assert.match(sql, /using \(client_id = auth\.uid\(\)\)/)
  assert.match(sql, /grant update \(read_at\) on public\.client_messages to authenticated/)
  assert.doesNotMatch(sql, /grant delete/i)
  const creates = sql.match(/create policy "([^"]+)"/g) || []
  for (const create of creates) {
    const name = create.match(/"([^"]+)"/)[1]
    assert.ok(sql.includes(`drop policy if exists "${name}"`), name)
  }
})
