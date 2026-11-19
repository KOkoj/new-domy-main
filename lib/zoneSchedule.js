// Calling hours shared by the whole site (footer, contact page, homepage,
// concierge FAB, client zone) and the client zone call scheduler:
// Mon–Fri 9:00–21:00, Europe/Prague. Change them only here.
// lib/translations.js cannot import this module (tests load it standalone),
// so its club.conciergePage.callHours copies the 'withZone' label and
// tests/contact-unification.test.cjs fails if they drift apart.

export const ZONE_TIME_ZONE = 'Europe/Prague'
export const CALL_HOURS = { startHour: 9, endHour: 21, firstWeekday: 1, lastWeekday: 5, timeZone: ZONE_TIME_ZONE }
export const OFFICE_START_MINUTES = CALL_HOURS.startHour * 60
export const OFFICE_END_MINUTES = CALL_HOURS.endHour * 60

const HOURS_RANGE = `${CALL_HOURS.startHour}:00–${CALL_HOURS.endHour}:00`
const HOURS_RANGE_SPACED = `${CALL_HOURS.startHour}:00 – ${CALL_HOURS.endHour}:00`

export const CALL_HOURS_LABELS = {
  cs: {
    short: `Po–Pá ${HOURS_RANGE}`,
    long: `Pondělí – pátek, ${HOURS_RANGE_SPACED}`,
    withZone: `Po–Pá ${HOURS_RANGE} (pražský čas)`
  },
  en: {
    short: `Mon–Fri ${HOURS_RANGE}`,
    long: `Monday – Friday, ${HOURS_RANGE_SPACED}`,
    withZone: `Mon–Fri ${HOURS_RANGE} (Prague time)`
  },
  it: {
    short: `Lun–Ven ${HOURS_RANGE}`,
    long: `Lunedì – venerdì, ${HOURS_RANGE_SPACED}`,
    withZone: `Lun–Ven ${HOURS_RANGE} (ora di Praga)`
  }
}

export function getCallHoursLabel(language = 'cs', variant = 'short') {
  const labels = CALL_HOURS_LABELS[language] || CALL_HOURS_LABELS.cs
  return labels[variant] || labels.short
}

// Callback slot times offered outside office hours (weekday index 0 = Sunday).
export const CALLBACK_SLOTS_BY_WEEKDAY = {
  0: ['11:00'],
  1: ['9:30', '14:00'],
  2: ['9:30', '14:00'],
  3: ['9:30', '14:00'],
  4: ['9:30', '14:00'],
  5: ['9:30', '14:00'],
  6: ['10:00', '14:00']
}

const WEEKDAY_SHORT_CS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function getPragueParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE_TIME_ZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date)
  const get = (type) => parts.find((part) => part.type === type)?.value
  return {
    weekday: WEEKDAY_INDEX[get('weekday')],
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    minutes: Number(get('hour')) * 60 + Number(get('minute'))
  }
}

export function isOfficeHours(date = new Date()) {
  const { weekday, minutes } = getPragueParts(date)
  return weekday >= CALL_HOURS.firstWeekday && weekday <= CALL_HOURS.lastWeekday && minutes >= OFFICE_START_MINUTES && minutes < OFFICE_END_MINUTES
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function toMinutes(time) {
  const [h, m] = String(time).split(':').map(Number)
  return h * 60 + m
}

// Next `count` callback slots in Prague time, at least `leadMinutes` from now.
export function getCallbackSlots(date = new Date(), count = 4, leadMinutes = 60) {
  const slots = []
  const now = getPragueParts(date)
  for (let offset = 0; offset < 8 && slots.length < count; offset += 1) {
    const day = getPragueParts(new Date(date.getTime() + offset * 24 * 60 * 60 * 1000))
    for (const time of CALLBACK_SLOTS_BY_WEEKDAY[day.weekday] || []) {
      if (offset === 0 && toMinutes(time) < now.minutes + leadMinutes) continue
      slots.push({
        id: `${day.year}-${day.month}-${day.day}-${time}`,
        // Same formats as the /book-call date and time inputs.
        date: `${day.year}-${pad2(day.month)}-${pad2(day.day)}`,
        time: time.padStart(5, '0'),
        label: `${WEEKDAY_SHORT_CS[day.weekday]} ${time}`,
        dateLabel: `${WEEKDAY_SHORT_CS[day.weekday]} ${day.day}. ${day.month}. v ${time}`
      })
      if (slots.length >= count) break
    }
  }
  return slots
}

// /book-call with the picked slot (and whatever contact data we have) prefilled.
export function buildBookCallHref({ slot, name, email, phone } = {}) {
  const params = new URLSearchParams()
  if (slot?.date) params.set('preferredDate', slot.date)
  if (slot?.time) params.set('preferredTime', slot.time)
  if (name) params.set('name', name)
  if (email) params.set('email', email)
  if (phone) params.set('phone', phone)
  const query = params.toString()
  return query ? `/book-call?${query}` : '/book-call'
}

// A zone slot click becomes a real call booking (same payload as /book-call)
// only when we know who to call. Without a phone the visitor finishes on
// /book-call, because the admin notification needs the number.
export function buildZoneCallBooking({ slot, name, email, phone } = {}) {
  const contact = {
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    phone: String(phone || '').trim()
  }
  if (!slot || !contact.name || !contact.email || !contact.phone) {
    return { action: 'redirect', href: buildBookCallHref({ slot, ...contact }) }
  }
  const message = [
    'Call booking request',
    `Preferred slot: ${slot.date} ${slot.time} (${ZONE_TIME_ZONE})`,
    'Call mode: Phone call',
    'Source: client zone'
  ].join('\n')
  return {
    action: 'post',
    body: {
      ...contact,
      message,
      type: 'call_booking',
      propertyTitle: 'Call booking',
      preferredDate: slot.date,
      preferredTime: slot.time,
      timezone: ZONE_TIME_ZONE
    }
  }
}

// Values for the /book-call form from its query string (zone slot links).
export function readBookCallPrefill(searchParams) {
  const get = (key) => String(searchParams?.get?.(key) || '').trim()
  const prefill = {}
  const date = get('preferredDate')
  const time = get('preferredTime')
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) prefill.preferredDate = date
  if (/^\d{2}:\d{2}$/.test(time)) prefill.preferredTime = time
  for (const key of ['name', 'email', 'phone']) {
    const value = get(key)
    if (value) prefill[key] = value.slice(0, 200)
  }
  return prefill
}
