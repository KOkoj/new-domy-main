// Currency conversion rates and utilities
// EUR is the base currency (1 EUR = X currency units)

export const CURRENCY_RATES = {
  EUR: 1,
  CZK: 25.0  // Updated to reflect more accurate EUR to CZK exchange rate
}

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  CZK: 'Kč'
}

/**
 * Format price with currency conversion
 * @param {Object} price - Price object with amount and currency
 * @param {string} targetCurrency - Target currency to convert to (EUR or CZK)
 * @param {string} language - Language code for formatting (en, cs, it)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, targetCurrency = 'EUR', language = 'en') {
  // Convert price to EUR first (base currency)
  const eurAmount = price.currency === 'EUR' 
    ? price.amount 
    : price.amount / CURRENCY_RATES[price.currency]
  
  // Convert from EUR to target currency
  const convertedAmount = eurAmount * CURRENCY_RATES[targetCurrency]
  
  // Map language codes to locale codes for currency formatting
  const localeMap = {
    'en': 'en-US',
    'cs': 'cs-CZ', 
    'it': 'it-IT'
  }
  
  return new Intl.NumberFormat(localeMap[language] || 'en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(convertedAmount)
}

/**
 * Format price with compact notation (k, M) for large numbers
 * @param {number|Object} price - Price as number or price object with amount and currency
 * @param {string} targetCurrency - Target currency to convert to (EUR or CZK)
 * @returns {string} Formatted price string with compact notation
 */
export function formatPriceCompact(price, targetCurrency = 'EUR') {
  let amount = typeof price === 'number' ? price : price.amount
  
  // Convert to target currency if price is an object with currency info
  if (typeof price === 'object' && price.currency) {
    const eurAmount = price.currency === 'EUR' 
      ? price.amount 
      : price.amount / CURRENCY_RATES[price.currency]
    amount = eurAmount * CURRENCY_RATES[targetCurrency]
  } else if (targetCurrency === 'CZK') {
    // If just a number, assume it's in EUR and convert to CZK
    amount = amount * CURRENCY_RATES.CZK
  }
  
  const symbol = CURRENCY_SYMBOLS[targetCurrency]
  
  if (amount >= 1000000) {
    const millions = amount / 1000000
    return `${symbol}${millions.toFixed(millions % 1 === 0 ? 0 : 2)}M`
  } else if (amount >= 1000) {
    const thousands = amount / 1000
    return `${symbol}${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`
  } else {
    return `${symbol}${Math.round(amount)}`
  }
}

/**
 * Convert price amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to EUR first (base currency)
  const eurAmount = fromCurrency === 'EUR' 
    ? amount 
    : amount / CURRENCY_RATES[fromCurrency]
  
  // Convert from EUR to target currency
  return eurAmount * CURRENCY_RATES[toCurrency]
}

