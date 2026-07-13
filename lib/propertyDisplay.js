// Shared display helpers for property data. Server-safe: no React, no
// browser APIs, so both server components (SEO layouts) and client
// components can import from here.

export const PROPERTY_TYPE_LABELS = {
  apartment: { cs: 'Byt', it: 'Appartamento', en: 'Apartment' },
  house: { cs: 'Samostatný dům', it: 'Casa singola', en: 'Single House' },
  villa: { cs: 'Vila', it: 'Villa', en: 'Villa' },
  rustico: { cs: 'Rustiko', it: 'Rustico', en: 'Rustic House' }
}

const PROPERTY_TYPE_KEYWORDS = {
  apartment: ['apartment', 'appartamento', 'flat', 'byt'],
  house: ['house', 'home', 'casa', 'single', 'singola', 'detached', 'dum'],
  villa: ['villa'],
  rustico: ['rustico', 'casale', 'masseria', 'trullo', 'farmhouse', 'podere', 'borgo'],
  commercial: ['commercial', 'commercio', 'komercni']
}

export const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const hasKeyword = (text, keywords = []) => keywords.some((keyword) => text.includes(keyword))

export const resolvePropertyType = (rawType, context = '') => {
  const normalizedType = normalizeText(rawType)
  const normalizedContext = normalizeText(context)

  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.rustico) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.rustico)
  ) {
    return 'rustico'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.villa) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.villa)
  ) {
    return 'villa'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.apartment) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.apartment)
  ) {
    return 'apartment'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.house) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.house)
  ) {
    return 'house'
  }
  if (
    hasKeyword(normalizedType, PROPERTY_TYPE_KEYWORDS.commercial) ||
    hasKeyword(normalizedContext, PROPERTY_TYPE_KEYWORDS.commercial)
  ) {
    return 'house'
  }

  return 'house'
}

export const getLocalizedValue = (value, language = 'en', fallback = '') => {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.it || value.cs || fallback
  }
  return value || fallback
}

export const getPropertyTypeLabel = (propertyType, language) => {
  const resolvedType = resolvePropertyType(propertyType, propertyType)
  return PROPERTY_TYPE_LABELS[resolvedType]?.[language] || PROPERTY_TYPE_LABELS[resolvedType]?.en || resolvedType
}

export const getStatusLabel = (status, language) => {
  if (status === 'sold') {
    return language === 'cs' ? 'Prodano' : language === 'it' ? 'Venduto' : 'Sold'
  }

  if (status === 'reserved') {
    return language === 'cs' ? 'Rezervovano' : language === 'it' ? 'Riservato' : 'Reserved'
  }

  return null
}
