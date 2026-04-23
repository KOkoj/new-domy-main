# Legal Release Checklist

Last updated: 2026-04-07

This checklist is an operational release checklist for the current project. It is not a substitute for advice from a lawyer, accountant, or tax advisor.

## Public pages and disclosures

- [ ] Privacy notice reviewed and kept aligned with the live stack
- [ ] Terms of sale reviewed against target markets and languages
- [ ] Cookie policy reviewed against actual cookies and scripts in production
- [ ] Affiliate or partner disclosure visible where commercial links appear
- [ ] Company identity, contact details, and VAT or registration details visible on site

## GDPR and privacy operations

- [ ] Register of processing activities maintained outside the repo
- [ ] Data retention schedule defined for accounts, purchases, consent logs, and support requests
- [ ] Data subject request workflow defined for access, deletion, rectification, portability, and objection
- [ ] Processor list reviewed: Supabase, Stripe, SendGrid, Sanity, OpenAI, Google Gemini, and any future providers
- [ ] DPAs or equivalent contractual terms accepted with all processors
- [ ] Cross-border transfer basis reviewed for non-EEA providers

## Cookies and tracking

- [ ] Production audit confirms only necessary cookies are active without consent
- [ ] If analytics or marketing scripts are added, consent banner and blocking logic are implemented first
- [ ] Cookie inventory updated after each new script or plugin

## Payments and tax operations

- [ ] Stripe products and prices match the legal offer shown on site
- [ ] Billing address collection verified in live Checkout
- [ ] Tax ID collection verified in live Checkout
- [ ] Invoice or tax document workflow agreed with accountant
- [ ] Automatic tax enabled only after accountant validation and jurisdiction review
- [ ] Refund and complaint handling workflow documented

## Evidence and accountability

- [ ] Consent logs retained and exportable when needed
- [ ] Purchase legal acceptance evidence retained and linked to the relevant order
- [ ] Support contact mailbox monitored and staffed
- [ ] Incident response owner defined for data breach or payment dispute scenarios

## Final pre-launch checks

- [ ] Production environment variables reviewed and current
- [ ] Real test purchase completed end to end
- [ ] Download entitlement verified after payment
- [ ] Receipt, invoice, or manual tax-document process tested
- [ ] Human legal review completed on final texts
- [ ] Human tax or accounting review completed on Stripe setup
