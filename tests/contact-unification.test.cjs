const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

function loadSchedule() {
  const source = read('lib/zoneSchedule.js').replace(/export (const|function)/g, '$1')
  const context = { Intl, Date, Number, String, Object, URLSearchParams }
  vm.runInNewContext(
    `${source}\nthis.api = { CALL_HOURS, getCallHoursLabel, getCallbackSlots, buildZoneCallBooking, buildBookCallHref, readBookCallPrefill }`,
    context
  )
  return context.api
}

const plain = (value) => JSON.parse(JSON.stringify(value))

test('calling hours are Mon-Fri 9-21 Europe/Prague in one shared source', () => {
  const { CALL_HOURS, getCallHoursLabel } = loadSchedule()
  assert.deepEqual(plain(CALL_HOURS), { startHour: 9, endHour: 21, firstWeekday: 1, lastWeekday: 5, timeZone: 'Europe/Prague' })
  assert.equal(getCallHoursLabel('cs'), 'Po–Pá 9:00–21:00')
  assert.equal(getCallHoursLabel('en', 'long'), 'Monday – Friday, 9:00 – 21:00')
  assert.equal(getCallHoursLabel('it'), 'Lun–Ven 9:00–21:00')
  assert.equal(getCallHoursLabel('xx'), 'Po–Pá 9:00–21:00')
})

test('every public hours display uses the shared label, no 9-18 or 9-16/18-20 left', () => {
  const users = {
    'components/Footer.jsx': /getCallHoursLabel\(language\)/,
    'app/contact/page.js': /getCallHoursLabel\('cs', 'long'\)/,
    'app/HomePageClient.jsx': /getCallHoursLabel\(language, 'long'\)/,
    'components/ConciergeContact.jsx': /getCallHoursLabel\('cs'\)/,
    'components/zone/ZoneSidebar.jsx': /getCallHoursLabel\('cs'\)/,
    'app/dashboard/concierge/page.js': /getCallHoursLabel\(language, 'withZone'\)/
  }
  for (const [file, pattern] of Object.entries(users)) {
    const source = read(file)
    assert.match(source, pattern, file)
    assert.doesNotMatch(source, /9:00 ?[-–] ?18:00|9[-–]16|18[-–]20|9AM-6PM/, file)
  }
})

test('Club translations show the same hours as the shared label', async () => {
  const { getCallHoursLabel } = loadSchedule()
  const { t } = await import(require('node:url').pathToFileURL(path.join(root, 'lib/translations.js')).href)
  for (const language of ['cs', 'en', 'it']) {
    assert.equal(t('club.conciergePage.callHours', language), getCallHoursLabel(language, 'withZone'), language)
  }
})

test('public e-mail is info@ everywhere; names and phones stay', () => {
  const details = read('lib/contactDetails.js')
  assert.match(details, /CONTACT_EMAIL = 'info@domyvitalii\.cz'/)
  assert.match(details, /'\+420 731 450 001'/)
  assert.match(details, /'\+420 720 363 136'/)
  for (const file of ['components/Footer.jsx', 'app/contact/page.js', 'lib/contactDetails.js', 'components/zone/ZoneSidebar.jsx']) {
    const source = read(file)
    assert.doesNotMatch(source, /lucie@domyvitalii|luca\.croce@domyvitalii/, file)
  }
  const footer = read('components/Footer.jsx')
  assert.match(footer, /Lucie Ku/)
  assert.match(footer, /Luca Croce/)
  assert.equal((footer.match(/href=\{`mailto:\$\{CONTACT_EMAIL\}`\}/g) || []).length, 2)
  assert.match(read('app/contact/page.js'), /import \{ CONTACT_EMAIL, TEAM_CONTACTS \} from '@\/lib\/contactDetails'/)
})

test('consultation / call CTAs link to /book-call, contact-form CTAs stay on /contact', () => {
  assert.match(read('app/HomePageClient.jsx'), /href="\/book-call"\s+data-testid="hero-consultation-link"/)
  assert.match(read('app/about/page.js'), /<Link href="\/book-call">\s+\{language === 'cs' \? 'Konzultace zdarma'/)
  assert.match(read('app/regions/RegionsListingClient.jsx'), /<Link href="\/book-call"[^>]*>\s+\{copy\.consult\}/)
  const process = read('app/process/page.js')
  assert.match(process, /<Link href="\/book-call">\s+<Button[\s\S]{0,400}'Bezplatná konzultace'/)
  assert.match(process, /<Link href="\/contact#contact-form">/)
  assert.match(read('app/guides/rekonstrukce-domu-v-italii/page.js'), /'Domluvte si konzultaci zdarma',\s+href: '\/book-call'/)
  const system = read('app/guides/real-estate-purchase-system-italy/page.js')
  assert.equal((system.match(/"serviceSecondaryCtaHref": "\/book-call"/g) || []).length, 3)
  assert.doesNotMatch(system, /"serviceSecondaryCtaHref": "\/contact"/)
})

test('/dashboard/concierge has no ticket form, only book-call / WhatsApp / tel / mailto', () => {
  const page = read('app/dashboard/concierge/page.js')
  assert.doesNotMatch(page, /type: 'concierge'|\/api\/inquiries|<form|<Textarea/)
  assert.match(page, /href="\/book-call"/)
  assert.match(page, /CONTACT_WHATSAPP_URL/)
  assert.match(page, /tel:\$\{CONTACT_PHONE_E164\}/)
  assert.match(page, /mailto:\$\{CONTACT_EMAIL\}/)
})

test('zone slots carry book-call date/time formats', () => {
  const { getCallbackSlots } = loadSchedule()
  const [first] = getCallbackSlots(new Date('2026-11-23T05:00:00Z')) // Monday 6:00 Prague
  assert.equal(first.date, '2026-11-23')
  assert.equal(first.time, '09:30')
})

test('zone slot with full contact posts a call_booking including phone', () => {
  const { getCallbackSlots, buildZoneCallBooking } = loadSchedule()
  const [slot] = getCallbackSlots(new Date('2026-11-23T05:00:00Z'))
  const booking = plain(buildZoneCallBooking({ slot, name: 'Jana Nová', email: 'jana@example.cz', phone: '+420 777 000 111' }))
  assert.equal(booking.action, 'post')
  assert.equal(booking.body.type, 'call_booking')
  assert.equal(booking.body.propertyTitle, 'Call booking')
  assert.equal(booking.body.phone, '+420 777 000 111')
  assert.equal(booking.body.preferredDate, '2026-11-23')
  assert.equal(booking.body.preferredTime, '09:30')
  assert.equal(booking.body.timezone, 'Europe/Prague')
  assert.match(booking.body.message, /Preferred slot: 2026-11-23 09:30 \(Europe\/Prague\)/)

  const sidebar = read('components/zone/ZoneSidebar.jsx')
  assert.match(sidebar, /fetch\('\/api\/inquiries'/)
  assert.match(sidebar, /attribution: readAttributionForSubmit\(\)/)
  assert.match(sidebar, /profile\?\.phone/)
  assert.match(sidebar, /window\.location\.assign\(booking\.href\)/)
  // WhatsApp stays as the separate message button, not the slot action.
  assert.match(sidebar, /buildWhatsappUrl\(''\)/)
  assert.doesNotMatch(sidebar, /prosím o zavolání/)
})

test('zone slot without phone redirects to prefilled /book-call', () => {
  const { getCallbackSlots, buildZoneCallBooking, readBookCallPrefill } = loadSchedule()
  const [slot] = getCallbackSlots(new Date('2026-11-23T05:00:00Z'))
  const booking = plain(buildZoneCallBooking({ slot, name: 'Jana Nová', email: 'jana@example.cz', phone: '' }))
  assert.equal(booking.action, 'redirect')
  assert.equal(booking.body, undefined)
  const url = new URL(booking.href, 'https://www.domyvitalii.cz')
  assert.equal(url.pathname, '/book-call')
  assert.deepEqual(plain(readBookCallPrefill(url.searchParams)), {
    preferredDate: '2026-11-23',
    preferredTime: '09:30',
    name: 'Jana Nová',
    email: 'jana@example.cz'
  })
})

test('/book-call reads prefill from the query string and ignores malformed values', () => {
  const { readBookCallPrefill } = loadSchedule()
  assert.deepEqual(plain(readBookCallPrefill(new URLSearchParams('preferredDate=23.11.2026&preferredTime=9:30'))), {})
  const page = read('app/book-call/page.js')
  assert.match(page, /readBookCallPrefill\(new URLSearchParams\(window\.location\.search\)\)/)
  assert.match(page, /email: prev\.email \|\| user\.email/)
})
