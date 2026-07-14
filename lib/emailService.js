import sgMail from '@sendgrid/mail';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags';

const isSendGridConfigured =
  process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');

if (isSendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let genAI = null;
let geminiModel = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
    try {
      geminiModel = genAI.getGenerativeModel({ model });
      break;
    } catch {
      // Model not available, try next
    }
  }
}

class EmailService {
  constructor() {
    this.isConfigured = isSendGridConfigured;
    this.isAIConfigured =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'placeholder' &&
      geminiModel !== null;
  }

  getBaseUrl() {
    return (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  }

  buildUrl(path) {
    const baseUrl = this.getBaseUrl();
    return baseUrl ? `${baseUrl}${path}` : null;
  }

  renderButton(url, label) {
    if (!url || !label) return '';
    return `<p style="margin: 24px 0;"><a href="${url}" style="background: #0f172a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">${label}</a></p>`;
  }

  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Email subject/header values must never contain raw newlines (header injection).
  sanitizeHeaderValue(value) {
    return String(value || '').replace(/[\r\n]+/g, ' ').trim();
  }

  formatMessageHtml(message) {
    return this.escapeHtml(message).replace(/\r?\n/g, '<br>');
  }

  renderShell({ eyebrow, title, intro, body, bullets = [], ctaLabel, ctaUrl, closing }) {
    const listHtml =
      bullets.length > 0
        ? `<ul style="padding-left: 20px; margin: 16px 0;">${bullets
            .map((item) => `<li style="margin: 8px 0;">${item}</li>`)
            .join('')}</ul>`
        : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
        ${eyebrow ? `<p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">${eyebrow}</p>` : ''}
        <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 16px;">${title}</h1>
        ${intro ? `<p>${intro}</p>` : ''}
        ${body ? `<p>${body}</p>` : ''}
        ${listHtml}
        ${this.renderButton(ctaUrl, ctaLabel)}
        ${closing ? `<p>${closing}</p>` : ''}
        <p style="margin-top: 24px;">Domy v Itálii</p>
      </div>
    `;
  }

  formatPlainText({ intro, body, bullets = [], url, closing }) {
    const bulletBlock = bullets.length > 0 ? `\n- ${bullets.join('\n- ')}` : '';
    return [intro, body, bulletBlock.trim(), url || '', closing, 'Domy v Itálii']
      .filter(Boolean)
      .join('\n\n');
  }

  async generateAIContent(type, data) {
    if (!this.isAIConfigured || !genAI) {
      return null;
    }

    const prompts = {
      welcome: `Write a concise welcome email for ${data.userName}. Return JSON with keys subject and body.`,
      'inquiry-response': `Write a concise inquiry confirmation email for ${data.userName} about "${data.propertyTitle}". Return JSON with keys subject and body.`,
      'property-alert': `Write a concise property alert email for ${data.userName}. We found ${data.properties.length} properties. Return JSON with keys subject and body.`
    };

    const prompt = prompts[type];
    if (!prompt) return null;

    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
      try {
        const currentModel = genAI.getGenerativeModel({ model });
        const result = await currentModel.generateContent(prompt);
        const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        const content = JSON.parse(text);
        if (content?.subject && content?.body) {
          return content;
        }
      } catch (error) {
        console.error(`[EMAIL SYSTEM] AI generation failed with ${model}:`, error.message);
      }
    }

    return null;
  }

  async sendEmail({ to, subject, text, html, replyTo }) {
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('[EMAIL SYSTEM] SIMULATION MODE - Email NOT sent');
      console.log('========================================');
      console.log('From (System):', process.env.SENDGRID_FROM_EMAIL || '(Not Set)');
      console.log('To:', to);
      console.log('Reply-To:', replyTo || '(Default)');
      console.log('Subject:', subject);
      console.log('---');
      console.log('Text Content:');
      console.log(text);
      console.log('---');
      console.log('HTML Content:');
      console.log(html);
      console.log('========================================\n');

      return {
        success: true,
        provider: 'simulation',
        message: 'Email logged to console (SendGrid not configured)'
      };
    }

    const verifiedSender = process.env.SENDGRID_FROM_EMAIL;
    if (!verifiedSender) {
      const errorMsg =
        'Missing SENDGRID_FROM_EMAIL environment variable. SendGrid requires a verified sender.';
      console.error(`[EMAIL SYSTEM] ${errorMsg}`);
      return {
        success: false,
        provider: 'sendgrid',
        error: errorMsg
      };
    }

    try {
      const msg = {
        to,
        from: verifiedSender,
        replyTo,
        subject,
        text,
        html
      };

      Object.keys(msg).forEach((key) => msg[key] === undefined && delete msg[key]);

      const result = await sgMail.send(msg);
      return {
        success: true,
        provider: 'sendgrid',
        statusCode: result[0].statusCode
      };
    } catch (error) {
      console.error('[EMAIL SYSTEM] Error sending email via SendGrid:', error.message);
      if (error.response) {
        console.error(JSON.stringify(error.response.body, null, 2));
      }
      return {
        success: false,
        provider: 'sendgrid',
        error: error.message
      };
    }
  }

  async sendPropertyAlert({ userEmail, userName, properties, searchCriteria }) {
    const aiContent = await this.generateAIContent('property-alert', {
      userName,
      properties,
      searchCriteria
    });

    const recommendationsUrl = this.buildUrl('/dashboard/recommendations');
    const criteriaSummary = [
      searchCriteria?.type ? `Property type: ${searchCriteria.type}` : null,
      searchCriteria?.city ? `Area: ${searchCriteria.city}` : null,
      searchCriteria?.priceMin ? `Minimum budget: EUR ${searchCriteria.priceMin}` : null,
      searchCriteria?.priceMax ? `Maximum budget: EUR ${searchCriteria.priceMax}` : null
    ].filter(Boolean);

    const subject =
      aiContent?.subject ||
      `${properties.length} new propert${properties.length === 1 ? 'y' : 'ies'} matching your search`;

    const intro = `Hi ${userName}, we found ${properties.length} new propert${properties.length === 1 ? 'y' : 'ies'} matching your saved search.`;
    const body =
      aiContent?.body ||
      'Open your dashboard to review the new listings and decide which ones are worth a closer look.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: criteriaSummary,
        url: recommendationsUrl || 'Log in to your dashboard to review the new matches.',
        closing:
          'If you no longer want these alerts, you can change your notification preferences in your account.'
      }),
      html: this.renderShell({
        eyebrow: 'Property alerts',
        title: subject,
        intro,
        body,
        bullets: criteriaSummary,
        ctaLabel: recommendationsUrl ? 'View matching properties' : null,
        ctaUrl: recommendationsUrl,
        closing:
          'If you no longer want these alerts, you can change your notification preferences in your account.'
      })
    });
  }

  // Transactional confirmation sent for every inquiry that includes an email
  // address (property, general contact, call booking, concierge), regardless
  // of auth state. This is sent on a legitimate-interest basis and must never
  // be gated on the marketing_emails preference.
  async sendInquiryConfirmation({
    userEmail,
    userName,
    type = 'property',
    propertyTitle,
    inquiryMessage,
    preferredDate,
    preferredTime,
    timezone
  }) {
    const contactUrl = this.buildUrl('/contact');
    const safeName = userName || 'zájemce';
    const preferredSlot = [preferredDate, preferredTime].filter(Boolean).join(' ');

    const copyByType = {
      general: {
        subject: 'Děkujeme za zprávu',
        body: 'Děkujeme za zprávu, ozveme se do 24 hodin.'
      },
      call_booking: {
        subject: 'Potvrzení žádosti o telefonát',
        body: [
          'Děkujeme za žádost o telefonát.',
          preferredSlot
            ? `Požadovaný termín: ${preferredSlot}${timezone ? ` (${timezone})` : ''}.`
            : null,
          'Termín vám co nejdříve potvrdíme e-mailem.'
        ]
          .filter(Boolean)
          .join(' ')
      },
      concierge: {
        subject: 'Potvrzení požadavku na concierge služby',
        body: 'Děkujeme za váš požadavek. Náš tým se vám brzy ozve s dalšími kroky.'
      },
      property: {
        subject: propertyTitle ? `Potvrzení poptávky: ${propertyTitle}` : 'Potvrzení poptávky',
        body: propertyTitle
          ? `Děkujeme za zájem o nemovitost „${propertyTitle}“. Ozveme se vám co nejdříve.`
          : 'Děkujeme za vaši poptávku. Ozveme se vám co nejdříve.'
      }
    };

    const copy = copyByType[type] || copyByType.property;
    const aiContent =
      type === 'property'
        ? await this.generateAIContent('inquiry-response', {
            userName: safeName,
            propertyTitle,
            inquiryMessage
          })
        : null;

    const subject = copy.subject;
    const intro = `Dobrý den ${safeName},`;
    const body = aiContent?.body || copy.body;
    const bullets = inquiryMessage ? [`Vaše zpráva: ${inquiryMessage}`] : [];
    const closing =
      'Pokud budete potřebovat cokoli doplnit, odpovězte na tento e-mail nebo nás kontaktujte přes web.';
    const footerText = contactUrl
      ? `Tento e-mail souvisí s vaší poptávkou. Kontakt: ${contactUrl}`
      : 'Tento e-mail souvisí s vaší poptávkou.';
    const footerHtml = contactUrl
      ? `Tento e-mail souvisí s vaší poptávkou. Kontakt: <a href="${this.escapeHtml(contactUrl)}">${this.escapeHtml(contactUrl)}</a>`
      : 'Tento e-mail souvisí s vaší poptávkou.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets,
        closing: `${closing}\n\n${footerText}`
      }),
      html: this.renderShell({
        eyebrow: 'Potvrzení poptávky',
        title: this.escapeHtml(subject),
        intro: this.escapeHtml(intro),
        body: this.formatMessageHtml(body),
        bullets: bullets.map((item) => this.escapeHtml(item)),
        closing: `${this.escapeHtml(closing)}<br><br><span style="color:#64748b; font-size:13px;">${footerHtml}</span>`
      })
    });
  }

  // Internal notification sent to the team on every new inquiry, regardless
  // of type, so no lead sits unnoticed in the database.
  async sendAdminInquiryNotification({ type = 'property', name, email, phone, message, propertyTitle }) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
    if (!adminEmail) {
      return {
        success: false,
        provider: 'none',
        error: 'ADMIN_NOTIFY_EMAIL is not configured'
      };
    }

    const typeLabels = {
      general: 'General contact',
      property: 'Property inquiry',
      call_booking: 'Call booking',
      concierge: 'Concierge request'
    };
    const typeLabel = typeLabels[type] || 'Inquiry';
    const safeName = this.sanitizeHeaderValue(name) || 'website visitor';
    const inquiriesUrl = this.buildUrl('/admin/inquiries');
    const subject = `New ${typeLabel.toLowerCase()}: ${safeName}`;

    const details = [
      `Type: ${typeLabel}`,
      `Name: ${name || '—'}`,
      `Email: ${email || '—'}`,
      phone ? `Phone: ${phone}` : null,
      propertyTitle ? `Property: ${propertyTitle}` : null
    ].filter(Boolean);

    const intro = `A new ${typeLabel.toLowerCase()} was just submitted on the website.`;
    const messageBody = message ? `Message: ${message}` : 'No message was provided.';
    const closing = 'Open the admin inquiries dashboard to respond.';

    return this.sendEmail({
      to: adminEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body: messageBody,
        bullets: details,
        url: inquiriesUrl || '',
        closing
      }),
      html: this.renderShell({
        eyebrow: 'Admin notification',
        title: this.escapeHtml(subject),
        intro: this.escapeHtml(intro),
        body: this.formatMessageHtml(messageBody),
        bullets: details.map((item) => this.escapeHtml(item)),
        ctaLabel: inquiriesUrl ? 'Open admin inquiries' : null,
        ctaUrl: inquiriesUrl,
        closing
      })
    });
  }

  async sendInquiryResponse({ userEmail, userName, propertyTitle, inquiryMessage, responseMessage }) {
    const safePropertyTitle = propertyTitle || 'your property inquiry';
    const subject = `Response to your inquiry about ${safePropertyTitle}`;
    const intro = `Hi ${userName || 'there'},`;
    const body = responseMessage;
    const originalInquiry = inquiryMessage ? `Original inquiry: ${inquiryMessage}` : '';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: originalInquiry ? [originalInquiry] : [],
        closing: 'Best regards,\nDomy v Italii'
      }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
          <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Inquiry response</p>
          <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 16px;">${this.escapeHtml(subject)}</h1>
          <p>${this.escapeHtml(intro)}</p>
          <p>${this.formatMessageHtml(body)}</p>
          ${originalInquiry ? `<div style="margin: 24px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;"><strong>Original inquiry:</strong><br>${this.formatMessageHtml(inquiryMessage)}</div>` : ''}
          <p>Best regards,<br>Domy v Italii</p>
        </div>
      `
    });
  }

  async sendWelcomeEmail({ userEmail, userName }) {
    const aiContent = await this.generateAIContent('welcome', {
      userName
    });

    const dashboardUrl = this.buildUrl('/dashboard');
    const subject = aiContent?.subject || 'Welcome to Domy v Itálii';
    const intro = `Hi ${userName}, welcome to Domy v Itálii.`;
    const body =
      aiContent?.body ||
      'Your account is ready. You can now save searches, track favorite properties, manage inquiries, and keep your buying process organized in one place.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: [
          'save searches and activate alerts',
          'keep interesting properties in your favorites',
          'track inquiries and next steps from your dashboard'
        ],
        url: dashboardUrl || 'Log in to your dashboard to get started.',
        closing: 'If you need help understanding the buying process in Italy, the guides and contact section are the best place to continue.'
      }),
      html: this.renderShell({
        eyebrow: 'Welcome',
        title: 'Your account is ready',
        intro,
        body,
        bullets: [
          'save searches and activate alerts',
          'keep interesting properties in your favorites',
          'track inquiries and next steps from your dashboard'
        ],
        ctaLabel: dashboardUrl ? 'Open your dashboard' : null,
        ctaUrl: dashboardUrl,
        closing: 'If you need help understanding the buying process in Italy, the guides and contact section are the best place to continue.'
      })
    });
  }

  async sendFreePdfUpsellEmail({
    userEmail,
    userName,
    language = 'it',
    freePdfKey = 'inspections-guide',
    premiumProductKey = 'premium-domy'
  }) {
    const safeLanguage = language === 'cs' || language === 'en' ? language : 'it';
    const followUpUrl = PREMIUM_PDFS_ENABLED
      ? `${this.getBaseUrl()}/premium?product=${encodeURIComponent(premiumProductKey)}`
      : this.buildUrl('/contact');
    const promotePremium = PREMIUM_PDFS_ENABLED;

    const freePdfTopicByLanguage = {
      'inspections-guide': {
        it: 'sulle visite immobiliari in Italia',
        en: 'for property viewings in Italy',
        cs: 'pro prohlídky nemovitostí v Itálii'
      },
      'mistakes-guide': {
        it: 'sugli errori comuni da evitare quando si acquista in Italia',
        en: 'about common mistakes to avoid when buying in Italy',
        cs: 'o častých chybách, kterým je dobré se při koupi v Itálii vyhnout'
      }
    };

    const freePdfTopic =
      freePdfTopicByLanguage[freePdfKey] || freePdfTopicByLanguage['inspections-guide'];

    const copy = {
      it: {
        subject: 'Grazie per aver scaricato il PDF gratuito',
        title: promotePremium ? 'Più chiarezza oggi, meno sorprese domani' : 'Continuiamo da qui',
        greeting: `Ciao ${userName},`,
        intro: `Grazie per aver scaricato la nostra guida gratuita ${freePdfTopic.it}.`,
        body: promotePremium
          ? 'Più informazioni dettagliate ricevi, più diventa semplice e trasparente acquistare casa in Italia. Per questo offriamo anche documenti premium con contenuti approfonditi e pratici, pensati per chi vuole procedere con metodo.'
          : 'Se vuoi capire quali controlli abbiano davvero senso nel tuo caso, puoi continuare con le guide gratuite oppure scriverci direttamente.',
        bullets: promotePremium
          ? [
              'controlli essenziali prima dei passaggi vincolanti',
              'spiegazioni chiare su costi, rischi e priorità',
              'struttura operativa concreta, passo dopo passo'
            ]
          : [
              'guida gratuita su costi e imposte',
              'approfondimento gratuito sul ruolo del notaio',
              'contatto diretto per orientarti sui prossimi passi'
            ],
        cta: promotePremium ? 'Apri il PDF premium' : 'Contattaci',
        closing: promotePremium
          ? 'Puoi accedere al materiale di approfondimento quando vuoi.'
          : 'Se vuoi, rispondi a questa email o contattaci dal sito e ti aiutiamo a capire i prossimi passi.'
      },
      en: {
        subject: 'Thank you for downloading the free PDF',
        title: promotePremium ? 'More clarity today, fewer surprises tomorrow' : 'Let us continue from here',
        greeting: `Hi ${userName},`,
        intro: `Thank you for downloading our free guide ${freePdfTopic.en}.`,
        body: promotePremium
          ? 'The more detailed information you have, the easier and more transparent buying a home in Italy becomes. That is why we also offer deeper practical material for people who want to move forward with a clear method.'
          : 'If you want to understand which next checks make sense in your case, continue with the free guides or contact us directly.',
        bullets: promotePremium
          ? [
              'essential checks before binding steps',
              'clear explanations of costs, risks, and priorities',
              'a practical step-by-step structure'
            ]
          : [
              'free guide about costs and taxes',
              'free guide about the notary role',
              'direct contact for the next steps'
            ],
        cta: promotePremium ? 'Open the premium PDF' : 'Contact us',
        closing: promotePremium
          ? 'You can access the deeper material whenever it suits you.'
          : 'If you want, reply to this email or contact us through the site and we will help you identify the next steps.'
      },
      cs: {
        subject: 'Děkujeme, že jste si stáhli PDF zdarma',
        title: promotePremium ? 'Více jasnosti dnes, méně překvapení zítra' : 'Můžeme pokračovat odsud',
        greeting: `Dobrý den ${userName},`,
        intro: `Děkujeme, že jste si stáhli náš bezplatný průvodce ${freePdfTopic.cs}.`,
        body: promotePremium
          ? 'Čím více detailních informací máte, tím snazší je koupit nemovitost v Itálii s větším klidem. Proto nabízíme i hlubší praktické materiály pro lidi, kteří chtějí postupovat systémově.'
          : 'Pokud chcete pochopit, které další kontroly dávají smysl ve vašem případě, pokračujte bezplatnými průvodci nebo nám napište přímo.',
        bullets: promotePremium
          ? [
              'základní kontroly před důležitými kroky',
              'přehledné vysvětlení nákladů, rizik a priorit',
              'konkrétní postup krok za krokem'
            ]
          : [
              'bezplatný průvodce o nákladech a daních',
              'bezplatný průvodce o roli notáře',
              'přímý kontakt pro další kroky'
            ],
        cta: promotePremium ? 'Otevřít premium PDF' : 'Kontaktujte nás',
        closing: promotePremium
          ? 'K materiálu se můžete vrátit kdykoli později.'
          : 'Když budete chtít, odpovězte na tento e-mail nebo nás kontaktujte přes web a pomůžeme vám určit další kroky.'
      }
    }[safeLanguage];

    return this.sendEmail({
      to: userEmail,
      subject: copy.subject,
      text: this.formatPlainText({
        intro: copy.greeting,
        body: `${copy.intro}\n\n${copy.body}`,
        bullets: copy.bullets,
        url: followUpUrl || '',
        closing: copy.closing
      }),
      html: this.renderShell({
        eyebrow: 'Free PDF follow-up',
        title: copy.title,
        intro: copy.greeting,
        body: `${copy.intro} ${copy.body}`,
        bullets: copy.bullets,
        ctaLabel: followUpUrl ? copy.cta : null,
        ctaUrl: followUpUrl,
        closing: copy.closing
      })
    });
  }

  async sendFollowUpEmail({ userEmail, userName, daysSinceRegistration }) {
    const propertiesUrl = this.buildUrl('/properties');
    const subject = 'How is your Italy property search going?';
    const intro = `Hi ${userName}, it has been ${daysSinceRegistration} days since you joined Domy v Itálii.`;
    const body =
      'If you want to keep moving, review the latest properties, refine your criteria, and shortlist only the listings worth deeper checks.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: [
          'review the newest listings',
          'save or refine your search criteria',
          'shortlist only the properties worth closer checks'
        ],
        url: propertiesUrl || 'Log in to continue your search.',
        closing: 'If you need help evaluating the next step, write to us and we will point you in the right direction.'
      }),
      html: this.renderShell({
        eyebrow: `Follow-up after ${daysSinceRegistration} days`,
        title: 'Keep your search moving',
        intro,
        body,
        bullets: [
          'review the newest listings',
          'save or refine your search criteria',
          'shortlist only the properties worth closer checks'
        ],
        ctaLabel: propertiesUrl ? 'Continue your search' : null,
        ctaUrl: propertiesUrl,
        closing: 'If you need help evaluating the next step, write to us and we will point you in the right direction.'
      })
    });
  }

  async sendLeadConfirmEmail({ userEmail, confirmUrl, unsubscribeUrl, assetLabel }) {
    const subject = 'Potvrďte svůj e-mail a stáhněte si PDF zdarma';
    const safeUnsubscribeUrl = this.escapeHtml(unsubscribeUrl);
    const closingHtml = `Pokud jste o PDF nežádali nebo už další e-maily nechcete, <a href="${safeUnsubscribeUrl}">odhlaste se jedním klikem</a>.`;

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro: 'Děkujeme za váš zájem.',
        body: `Kliknutím na odkaz potvrďte svůj e-mail a stáhněte si PDF „${assetLabel}“.`,
        url: confirmUrl,
        closing: `Odhlášení jedním klikem: ${unsubscribeUrl}`
      }),
      html: this.renderShell({
        eyebrow: 'PDF zdarma',
        title: subject,
        intro: 'Děkujeme za váš zájem.',
        body: `Kliknutím níže potvrďte svůj e-mail a stáhněte si PDF „${this.escapeHtml(assetLabel)}“.`,
        ctaLabel: 'Potvrdit e-mail a stáhnout PDF',
        ctaUrl: this.escapeHtml(confirmUrl),
        closing: closingHtml
      })
    });
  }

  async sendLeadAssetEmail({ userEmail, downloadUrl, unsubscribeUrl, assetLabel }) {
    const subject = 'Vaše PDF zdarma je připravené ke stažení';
    const safeUnsubscribeUrl = this.escapeHtml(unsubscribeUrl);
    const closingHtml = `Odkaz je platný 1 hodinu. Z odběru se můžete <a href="${safeUnsubscribeUrl}">odhlásit jedním klikem</a>.`;

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro: 'Váš e-mail je potvrzený.',
        body: `PDF „${assetLabel}“ si stáhněte pomocí odkazu níže. Odkaz je platný 1 hodinu.`,
        url: downloadUrl,
        closing: `Odhlášení jedním klikem: ${unsubscribeUrl}`
      }),
      html: this.renderShell({
        eyebrow: 'PDF zdarma',
        title: subject,
        intro: 'Váš e-mail je potvrzený.',
        body: `PDF „${this.escapeHtml(assetLabel)}“ si stáhněte pomocí tlačítka níže.`,
        ctaLabel: 'Stáhnout PDF',
        ctaUrl: this.escapeHtml(downloadUrl),
        closing: closingHtml
      })
    });
  }
}

export default new EmailService();
