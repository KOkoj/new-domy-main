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
  assert.match(sidebar, /mailto:\$\{CONTACT_EMAIL\}/)
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
