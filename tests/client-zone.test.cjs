const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

function loadSchedule() {
  const source = read('lib/zoneSchedule.js').replace(/export (const|function)/g, '$1')
  const context = { Intl, Date, Number, String }
  vm.runInNewContext(`${source}\nthis.api = { isOfficeHours, getCallbackSlots }`, context)
  return context.api
}

test('office hours follow Mon-Fri 9:00-21:00 Europe/Prague', () => {
  const { isOfficeHours } = loadSchedule()
  // 2026-11-18 is a Wednesday; Prague is UTC+1 in November.
  assert.equal(isOfficeHours(new Date('2026-11-18T09:00:00Z')), true) // 10:00 Prague
  assert.equal(isOfficeHours(new Date('2026-11-18T07:59:00Z')), false) // 8:59 Prague
  assert.equal(isOfficeHours(new Date('2026-11-18T17:00:00Z')), true) // 18:00 Prague
  assert.equal(isOfficeHours(new Date('2026-11-18T19:00:00Z')), true) // 20:00 Prague
  assert.equal(isOfficeHours(new Date('2026-11-18T20:00:00Z')), false) // 21:00 Prague
  assert.equal(isOfficeHours(new Date('2026-11-21T10:00:00Z')), false) // Saturday
})

test('callback slots outside office hours include weekend times', () => {
  const { getCallbackSlots } = loadSchedule()
  const slots = getCallbackSlots(new Date('2026-11-20T19:00:00Z')) // Friday 20:00 Prague
  assert.deepEqual(Array.from(slots, (s) => s.label), ['So 10:00', 'So 14:00', 'Ne 11:00', 'Po 9:30'])
})

test('zone has no chat composer, price-drop card or public view counts', () => {
  const files = ['app/dashboard/page.js', 'app/dashboard/ulozene/page.js', 'components/zone/ZoneSidebar.jsx', 'components/zone/ZoneShell.jsx']
  for (const file of files) {
    const source = read(file)
    assert.doesNotMatch(source, /<textarea|Napište zprávu/i, file)
    assert.doesNotMatch(source, /klesla cena|snížen/i, file)
    assert.doesNotMatch(source, /views|zobrazení/i, file)
  }
})

test('sidebar contacts Lucie via shared contact details', () => {
  const sidebar = read('components/zone/ZoneSidebar.jsx')
  assert.match(sidebar, /CONTACT_PHONE_E164/)
  assert.match(sidebar, /buildWhatsappUrl/)
  assert.match(sidebar, /TEAM_CONTACTS\[0\]/)
  assert.match(sidebar, /\/dashboard\/settings/)
})

test('zone loads fast: no full inventory download, no session waterfall', () => {
  const hook = read('components/zone/useZoneData.js')
  assert.doesNotMatch(hook, /\/api\/properties/)
  assert.doesNotMatch(hook, /getDashboardUser|auth\.getUser\(/)
  assert.match(hook, /\/api\/favorites\/houses/)
  assert.match(hook, /loadSiteAuthUser/)

  const route = read('app/api/favorites/houses/route.js')
  assert.match(route, /getAuthenticatedUser/)
  assert.match(route, /_id in \$ids/)
  assert.doesNotMatch(route, /getListableProperties|getAllProperties/)

  const layout = read('app/dashboard/DashboardLayoutClient.jsx')
  assert.doesNotMatch(layout, /\/api\/profile/)
  assert.match(layout, /loading && !isZonePage/)

  for (const file of ['app/dashboard/page.js', 'app/dashboard/ulozene/page.js']) {
    assert.match(read(file), /<ZoneSkeleton/, file)
  }
})

test('saved strip shows full house titles in equal-height cards', () => {
  const page = read('app/dashboard/page.js')
  const strip = page.slice(page.indexOf('function SavedStrip'), page.indexOf('function UnavailableCard'))
  assert.doesNotMatch(strip, /line-clamp|truncate|text-ellipsis/)
  assert.match(strip, /items-stretch/)
  assert.match(strip, /flex w-\[160px\] flex-shrink-0 flex-col/)
})

test('mobile sidebar is compact, desktop column and CallBlock unchanged', () => {
  const sidebar = read('components/zone/ZoneSidebar.jsx')
  assert.match(sidebar, /data-testid="zone-contact-buttons"/)
  assert.match(sidebar, /grid grid-cols-3/)
  assert.match(sidebar, /aria-label="Vyberte čas, kdy vám Lucie zavolá"/)
  assert.match(sidebar, /<CallBlock \/>/)
  const shell = read('components/zone/ZoneShell.jsx')
  assert.match(shell, /lg:sticky lg:top-28 lg:w-\[340px\]/)
})

test('header and greeting never show the e-mail as a name', () => {
  const source = read('lib/siteAuthUser.js')
  const body = source.slice(source.indexOf('export function getUserDisplayName')).replace(/export function/g, 'function')
  const context = { String }
  vm.runInNewContext(`${body}\nthis.api = { getUserRealName, getUserFirstName }`, context)
  const { getUserRealName, getUserFirstName } = context.api
  assert.equal(getUserRealName({ email: 'jarvis-mat@example.com', user_metadata: {} }), '')
  assert.equal(getUserRealName({ email: 'jarvis-mat@example.com' }, { name: 'jarvis-mat' }), '')
  assert.equal(getUserRealName({ email: 'a@b.cz' }, { name: 'User' }), '')
  assert.equal(getUserFirstName({ email: 'a@b.cz', user_metadata: { full_name: 'Jana Nováková' } }), 'Jana')

  const nav = read('components/Navigation.js')
  assert.match(nav, /getUserFirstName\(user\)/)
  assert.doesNotMatch(nav, /\{getUserDisplayName\(user\)\}/)
  assert.doesNotMatch(nav, /split\(' '\)\[0\] \|\| navLabels\.dashboard/)
})

test('searches and settings use the zone shell with the sidebar, no breadcrumbs', () => {
  const layout = read('app/dashboard/DashboardLayoutClient.jsx')
  assert.match(layout, /'\/dashboard\/searches', '\/dashboard\/settings'/)
  assert.match(layout, /redirect=\$\{encodeURIComponent\(/)

  const settings = read('app/dashboard/settings/page.js')
  assert.match(settings, /<ZoneShell data=\{data\}>/)
  assert.doesNotMatch(settings, /breadcrumb/i)
  assert.match(settings, /method: 'PATCH'/)
  assert.match(settings, /notifySiteAuthChanged/)

  const searches = read('app/dashboard/searches/page.js')
  assert.match(searches, /<ZoneShell data=\{data\}>/)
  assert.match(searches, /Nastavte, co hledáte/)
  assert.match(searches, /Uložit hledání/)
  assert.match(searches, /\/api\/saved-searches/)
  assert.match(searches, /existing \? 'PATCH' : 'POST'/)
  assert.doesNotMatch(searches, /Pro Tip|individually|jednou týdně|Souhrn vám přijde/)

  const profileRoute = read('app/api/profile/route.js')
  assert.match(profileRoute, /auth\.updateUser\(\{\s*data: \{ name: fullName, full_name: fullName \}/)
})

test('search summary shows Czech property type labels', () => {
  const hook = read('components/zone/useZoneData.js')
  assert.match(hook, /PROPERTY_TYPE_LABELS\[filters\.type\]\?\.cs/)
})

test('old zone pages redirect temporarily, active entry points stay', () => {
  const config = read('next.config.js')
  for (const [page, destination] of [
    ['prehled', '/dashboard'],
    ['inquiries', '/dashboard'],
    ['favorites', '/dashboard/ulozene'],
    ['documents', '/dashboard'],
    ['notifications', '/dashboard'],
    ['content', '/dashboard'],
    ['webinars', '/dashboard'],
    ['profile', '/dashboard/settings']
  ]) {
    assert.ok(config.includes(`['${page}', '${destination}']`), page)
  }
  assert.match(config, /source: `\/dashboard\/\$\{page\}`, destination, permanent: false/)
  for (const kept of ['intake-form', 'recommendations', 'concierge']) {
    assert.ok(!config.includes(`['${kept}',`), kept)
  }

  const proxy = read('proxy.js')
  assert.match(proxy, /searchParams\.set\('redirect', request\.nextUrl\.pathname\)/)
  assert.match(proxy, /if \(zonePath && definitelySignedOut\)/)
})
