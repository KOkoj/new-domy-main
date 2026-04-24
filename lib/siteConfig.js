export const SITE_NAME = 'Domy v Italii'
export const SITE_URL = 'https://www.domyvitalii.cz'
export const SITE_HOST = 'www.domyvitalii.cz'

export function absoluteUrl(path = '/') {
  if (!path.startsWith('/')) {
    return `${SITE_URL}/${path}`
  }

  return `${SITE_URL}${path}`
}
