const PREMIUM_PRODUCTS = {
  'premium-notary': {
    key: 'premium-notary',
    checkoutProductName: 'Premium Notary PDF',
    marketingOriginalPriceKc: 250,
    marketingDiscountedPriceKc: 70,
    defaultCancelPath: '/guides/notary',
    stripePriceEnv: 'STRIPE_PRICE_PREMIUM_NOTARY',
    storagePathEnv: 'PREMIUM_PDF_PATH_NOTARY',
    fallbackStoragePath: 'premium/premium-notary.pdf'
  },
  'premium-domy': {
    key: 'premium-domy',
    checkoutProductName: 'Premium Domy PDF',
    marketingOriginalPriceKc: 250,
    marketingDiscountedPriceKc: 85,
    defaultCancelPath: '/guides/costs',
    stripePriceEnv: 'STRIPE_PRICE_PREMIUM_DOMY',
    storagePathEnv: 'PREMIUM_PDF_PATH_DOMY',
    fallbackStoragePath: 'premium/premium-domy.pdf'
  }
}

export function getPremiumProduct(productKey) {
  return PREMIUM_PRODUCTS[productKey] || null
}

export function getStripePriceIdForProduct(productKey) {
  const product = getPremiumProduct(productKey)
  if (!product) return null
  return process.env[product.stripePriceEnv] || null
}

export function getStoragePathForProduct(productKey) {
  const product = getPremiumProduct(productKey)
  if (!product) return null
  return process.env[product.storagePathEnv] || product.fallbackStoragePath
}

export function getMarketingPriceForProduct(productKey) {
  const product = getPremiumProduct(productKey)
  if (!product) return null
  return {
    originalKc: product.marketingOriginalPriceKc,
    discountedKc: product.marketingDiscountedPriceKc
  }
}
