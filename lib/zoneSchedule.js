// Call availability for the client zone sidebar.
// Office hours match the site footer: Mon–Fri 9:00–18:00, Europe/Prague.

export const ZONE_TIME_ZONE = 'Europe/Prague'
export const OFFICE_START_MINUTES = 9 * 60
export const OFFICE_END_MINUTES = 18 * 60

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
  return weekday >= 1 && weekday <= 5 && minutes >= OFFICE_START_MINUTES && minutes < OFFICE_END_MINUTES
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
        label: `${WEEKDAY_SHORT_CS[day.weekday]} ${time}`,
        dateLabel: `${WEEKDAY_SHORT_CS[day.weekday]} ${day.day}. ${day.month}. v ${time}`
      })
      if (slots.length >= count) break
    }
  }
  return slots
}
