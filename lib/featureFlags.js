export const PREMIUM_PDFS_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_PDFS_ENABLED === 'true'
export const ADMIN_LAUNCH_TOOLS_ENABLED = process.env.ADMIN_LAUNCH_TOOLS_ENABLED === 'true'
export const PUBLIC_SITE_STANDBY = true

export function getPremiumPdfDisabledResponse() {
  return {
    error: 'PREMIUM_PDFS_DISABLED',
    message: 'Premium PDFs are not available yet.'
  }
}

export function getAdminToolDisabledResponse() {
  return {
    error: 'ADMIN_TOOL_DISABLED',
    message: 'This admin tool is not enabled for the current launch.'
  }
}
