export const CONTACT_EMAIL = 'info@domyvitalii.cz'
export const CONTACT_PHONE_DISPLAY = '+420 731 450 001'
export const CONTACT_PHONE_E164 = '+420731450001'
export const CONTACT_WHATSAPP_URL = `https://wa.me/420731450001`
export const SITE_ORIGIN = 'https://www.domyvitalii.cz'

export function buildWhatsappUrl(text) {
  const message = String(text || '').trim()
  return message ? `${CONTACT_WHATSAPP_URL}?text=${encodeURIComponent(message)}` : CONTACT_WHATSAPP_URL
}

// Names and direct phones stay personal; the public e-mail is the shared inbox.
export const TEAM_CONTACTS = [
  {
    name: 'Lucie Kučerová',
    phone: '+420 731 450 001',
    email: CONTACT_EMAIL
  },
  {
    name: 'Luca Croce',
    phone: '+420 720 363 136',
    email: CONTACT_EMAIL
  }
]
