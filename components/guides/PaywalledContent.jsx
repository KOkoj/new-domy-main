/** Matches PAYWALLED_CONTENT_CSS_SELECTOR in lib/seo/contentSeo.js for JSON-LD paywall markup. */
export const PAYWALLED_CONTENT_ID = 'paywalled-content'

export default function PaywalledContent({ children, className = '' }) {
  return (
    <div id={PAYWALLED_CONTENT_ID} className={className}>
      {children}
    </div>
  )
}
