const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('mobile contact bar offers WhatsApp, call and inquiry from shared contact details', () => {
  const bar = read('components/MobileContactBar.jsx')
  assert.match(bar, /from '@\/lib\/contactDetails'/)
  assert.match(bar, /buildWhatsappUrl\(whatsappText\)/)
  assert.match(bar, /tel:\$\{CONTACT_PHONE_E164\}/)
  assert.match(bar, /data-track-location="sticky_bar"/)
  assert.match(bar, /trackClientEvent\('inquiry_cta_click', \{ location: 'sticky_bar' \}\)/)
  assert.match(bar, /lg:hidden/)
  assert.match(bar, /env\(safe-area-inset-bottom/)
  assert.ok(!bar.includes('420731450001'), 'no hard-coded number in the bar')

  const css = read('app/globals.css')
  assert.match(css, /body\[data-contact-bar='true'\] \{\s*padding-bottom: calc\(var\(--contact-bar-height\) \+ env\(safe-area-inset-bottom/)
})

test('bar is mounted on the listing and the property detail, not on the homepage', () => {
  const detail = read('app/properties/[slug]/PropertyDetailClient.jsx')
  const listing = read('app/properties/PropertiesClient.jsx')
  assert.match(detail, /<MobileContactBar/)
  assert.match(detail, /forms\.contactBar\.whatsappProperty/)
  assert.match(detail, /\.replace\('\{title\}'/)
  assert.match(detail, /\.replace\('\{url\}'/)
  assert.match(listing, /<MobileContactBar/)
  assert.match(listing, /hidden=\{mobileMapActive\}/)
  // The consultant card lives only on the homepage, so the two never stack.
  assert.ok(!read('app/HomePageClient.jsx').includes('MobileContactBar'))
  assert.ok(!detail.includes('ConciergeContact'))
  assert.ok(!listing.includes('ConciergeContact'))
})

test('property inquiry form: no alert(), inline error, optional phone, reassurance', () => {
  const detail = read('app/properties/[slug]/PropertyDetailClient.jsx')
  assert.ok(!/\balert\(/.test(detail))
  assert.match(detail, /role="alert"/)
  assert.match(detail, /result\?\.inquirySaved === true/)
  assert.match(detail, /autoComplete="tel"/)
  assert.match(detail, /autoComplete="email"/)
  assert.match(detail, /autoComplete="name"/)
  assert.match(detail, /tr\('reassurance'\)/)
  assert.match(detail, /data-testid="interested-button"/)

  for (const file of ['components/ui/input.jsx', 'components/ui/textarea.jsx']) {
    assert.match(read(file), /text-base md:text-sm/, `${file} must be 16px on phones`)
  }
})

test('a stored inquiry is reported as success even when e-mail delivery fails', () => {
  const route = read('app/api/inquiries/route.js')
  assert.ok(!route.includes('status: 502'))
  assert.match(route, /success: true,\s*inquirySaved: true/)
  assert.match(route, /console\.error\(\s*`\[INQUIRIES\] Inquiry .* saved, but email delivery failed/)
})

test('lead_submit is tracked before the confirmation e-mail is attempted', () => {
  const leads = read('app/api/leads/route.js')
  const lastTrack = leads.lastIndexOf("trackServerEvent(request, 'lead_submit'")
  assert.ok(lastTrack > 0 && lastTrack < leads.indexOf('sendLeadConfirmEmail('))
})

test('server tracking passes the request and logs failures', () => {
  const server = read('lib/trackServerEvent.js')
  assert.match(server, /\{ request \}/)
  assert.match(server, /console\.error\(`\[TRACK\] \$\{name\} failed:`/)
})

test('new form and bar texts exist in every language of lib/translations.js', async () => {
  const { t } = await import(require('node:url').pathToFileURL(path.join(root, 'lib/translations.js')).href)
  const keys = [
    'forms.propertyInquiry.send', 'forms.propertyInquiry.reassurance', 'forms.propertyInquiry.phone',
    'forms.propertyInquiry.optional', 'forms.propertyInquiry.interested',
    'forms.contactBar.label', 'forms.contactBar.whatsapp', 'forms.contactBar.call', 'forms.contactBar.inquiry',
    'forms.contactBar.whatsappProperty', 'forms.contactBar.whatsappListing'
  ]
  for (const language of ['cs', 'en', 'it']) {
    for (const key of keys) {
      const value = t(key, language)
      assert.ok(typeof value === 'string' && value && value !== key, `${language}:${key}`)
    }
  }
  assert.equal(t('forms.propertyInquiry.send', 'cs'), 'Poslat nezávazný dotaz')
  assert.equal(t('forms.propertyInquiry.reassurance', 'cs'), 'Odpovíme česky do 24 h, zdarma a nezávazně')
  assert.equal(t('forms.propertyInquiry.phone', 'cs'), 'Telefon / WhatsApp')
  assert.match(t('forms.contactBar.whatsappProperty', 'cs'), /\{title\}.*\{url\}/)
})
