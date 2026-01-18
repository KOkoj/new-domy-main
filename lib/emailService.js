import sgMail from '@sendgrid/mail';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if SendGrid is properly configured with a real API key
const isSendGridConfigured = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');

// Initialize SendGrid only if properly configured
if (isSendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Google Gemini AI with fallback models
let genAI = null;
let geminiModel = null;
let modelName = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try Gemini 2.x models in order (1.5 series deprecated in 2026)
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  
  for (const model of modelsToTry) {
    try {
      geminiModel = genAI.getGenerativeModel({ model });
      modelName = model;
      console.log(`[EMAIL SYSTEM] Using Gemini model: ${model}`);
      break; // Successfully initialized
    } catch (error) {
      console.log(`[EMAIL SYSTEM] Model ${model} not available, trying next...`);
    }
  }
  
  if (!geminiModel) {
    console.log('[EMAIL SYSTEM] No Gemini models available');
  }
}

class EmailService {
  constructor() {
    this.isConfigured = isSendGridConfigured;
    this.isAIConfigured = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder' && geminiModel !== null;
  }

  /**
   * Generate AI-powered email content with Google Gemini
   * Falls back to static templates if Gemini is not configured
   */
  async generateAIContent(type, data) {
    // If AI is not configured, return null to fall back to static templates
    if (!this.isAIConfigured) {
      console.log('[EMAIL SYSTEM] Gemini not configured - using static templates for:', type);
      return null;
    }

    // Define models to try (Gemini 2.x series for 2026)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[EMAIL SYSTEM] Generating content with ${modelName} for type:`, type);
        
        let prompt = '';
        const systemContext = 'You are a warm, professional real estate agent assistant for "Domy v Itálii", a platform helping Czech buyers find properties in Italy. Write in a friendly but professional tone.';

        switch (type) {
          case 'welcome':
            prompt = `${systemContext}

Generate a warm welcome email for a new user named ${data.userName}. 
Include:
- A friendly greeting
- Brief introduction to our Italian property platform
- Key features they can use (browse properties, save searches, get alerts)
- Encouraging call-to-action

Keep it concise (3-4 paragraphs) and welcoming. 

Return ONLY a valid JSON object with this exact format:
{
  "subject": "your subject line here",
  "body": "your email body here"
}`;
            break;

          case 'inquiry-response':
            prompt = `${systemContext}

Generate a professional inquiry confirmation email for ${data.userName} who asked about "${data.propertyTitle}".
Their message was: "${data.inquiryMessage}"

Include:
- Thank them for their interest
- Confirm we received their inquiry
- Mention we'll respond within 24 hours
- Include a link to track inquiries in their dashboard

Keep it professional and reassuring.

Return ONLY a valid JSON object with this exact format:
{
  "subject": "your subject line here",
  "body": "your email body here"
}`;
            break;

          case 'property-alert':
            prompt = `${systemContext}

Generate an exciting property alert email for ${data.userName}.
We found ${data.properties.length} new properties matching their criteria:
${JSON.stringify(data.searchCriteria, null, 2)}

Include:
- Attention-grabbing opening about new matches
- Brief mention of their search criteria
- Encouraging call-to-action to view the properties

Keep it exciting but not too pushy.

Return ONLY a valid JSON object with this exact format:
{
  "subject": "your subject line here",
  "body": "your email body here"
}`;
            break;

          default:
            console.log('[EMAIL SYSTEM] Unknown email type:', type);
            return null;
        }

        // Try with current model
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        const result = await currentModel.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // Clean up the response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const content = JSON.parse(cleanText);
        console.log(`[EMAIL SYSTEM] ✅ ${modelName} generated content:`, { type, subject: content.subject });
        
        return {
          subject: content.subject,
          body: content.body
        };

      } catch (error) {
        lastError = error;
        console.error(`[EMAIL SYSTEM] ⚠️ Error with ${modelName}:`, error.message);
        // Continue to next model
      }
    }

    // All models failed, log final error and fall back to static templates
    console.error('[EMAIL SYSTEM] ❌ All Gemini models failed, using static templates. Last error:', lastError?.message);
    return null;
  }

  async sendEmail({ to, subject, text, html, from = 'noreply@domy-v-italii.com' }) {
    // Simulation Mode: If SendGrid is not configured, log to console instead
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('[EMAIL SYSTEM] 📧 SIMULATION MODE - Email NOT sent');
      console.log('========================================');
      console.log('From:', from);
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('---');
      console.log('Text Content:');
      console.log(text);
      console.log('---');
      console.log('HTML Content:');
      console.log(html);
      console.log('========================================\n');
      
      // Return success in simulation mode (no actual email sent)
      return { 
        success: true, 
        provider: 'simulation',
        message: 'Email logged to console (SendGrid not configured)'
      };
    }

    // Real Mode: Send via SendGrid
    try {
      const msg = {
        to,
        from,
        subject,
        text,
        html
      };

      const result = await sgMail.send(msg);
      console.log('[EMAIL SYSTEM] ✅ Email sent successfully via SendGrid:', result[0].statusCode);
      return { 
        success: true, 
        provider: 'sendgrid',
        statusCode: result[0].statusCode 
      };
    } catch (error) {
      console.error('[EMAIL SYSTEM] ❌ Error sending email via SendGrid:', error.message);
      return { 
        success: false, 
        provider: 'sendgrid',
        error: error.message 
      };
    }
  }

  async sendPropertyAlert({ userEmail, userName, properties, searchCriteria }) {
    // Try to generate AI content first
    const aiContent = await this.generateAIContent('property-alert', {
      userName,
      properties,
      searchCriteria
    });

    let subject, text, html;

    if (aiContent) {
      // Use AI-generated content
      subject = aiContent.subject;
      text = aiContent.body;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="white-space: pre-line;">${aiContent.body.replace(/\n/g, '<br>')}</div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Search Criteria:</strong><br>
            ${searchCriteria.type ? `Type: ${searchCriteria.type}<br>` : ''}
            ${searchCriteria.city ? `City: ${searchCriteria.city}<br>` : ''}
            ${searchCriteria.priceMin ? `Min Price: €${searchCriteria.priceMin}<br>` : ''}
            ${searchCriteria.priceMax ? `Max Price: €${searchCriteria.priceMax}<br>` : ''}
          </div>

          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Matches</a></p>
        </div>
      `;
    } else {
      // Fall back to static template
      subject = `New Properties Found: ${properties.length} matches your search`;
      text = `Hi ${userName},\n\nWe found ${properties.length} new properties that match your saved search criteria.\n\nView your matches at: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Properties Found!</h2>
          <p>Hi ${userName},</p>
          <p>We found ${properties.length} new properties that match your saved search criteria:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Search Criteria:</strong><br>
            ${searchCriteria.type ? `Type: ${searchCriteria.type}<br>` : ''}
            ${searchCriteria.city ? `City: ${searchCriteria.city}<br>` : ''}
            ${searchCriteria.priceMin ? `Min Price: €${searchCriteria.priceMin}<br>` : ''}
            ${searchCriteria.priceMax ? `Max Price: €${searchCriteria.priceMax}<br>` : ''}
          </div>

          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Matches</a></p>
          
          <p>Best regards,<br>Domy v Itálii Team</p>
        </div>
      `;
    }

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  async sendInquiryConfirmation({ userEmail, userName, propertyTitle, inquiryMessage }) {
    // Try to generate AI content first
    const aiContent = await this.generateAIContent('inquiry-response', {
      userName,
      propertyTitle,
      inquiryMessage
    });

    let subject, text, html;

    if (aiContent) {
      // Use AI-generated content
      subject = aiContent.subject;
      text = aiContent.body;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="white-space: pre-line;">${aiContent.body.replace(/\n/g, '<br>')}</div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Message:</strong><br>
            ${inquiryMessage}
          </div>

          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/inquiries" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Inquiries</a></p>
        </div>
      `;
    } else {
      // Fall back to static template
      subject = `Inquiry Confirmation - ${propertyTitle}`;
      text = `Hi ${userName},\n\nThank you for your inquiry about "${propertyTitle}". We have received your message and will get back to you soon.\n\nYour message: ${inquiryMessage}\n\nBest regards,\nDomy v Itálii Team`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Inquiry Confirmation</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for your inquiry about "<strong>${propertyTitle}</strong>". We have received your message and will get back to you soon.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Message:</strong><br>
            ${inquiryMessage}
          </div>

          <p>We typically respond within 24 hours. You can track all your inquiries in your dashboard.</p>
          
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/inquiries" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Inquiries</a></p>
          
          <p>Best regards,<br>Domy v Itálii Team</p>
        </div>
      `;
    }

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  async sendWelcomeEmail({ userEmail, userName }) {
    // Try to generate AI content first
    const aiContent = await this.generateAIContent('welcome', {
      userName
    });

    let subject, text, html;

    if (aiContent) {
      // Use AI-generated content
      subject = aiContent.subject;
      text = aiContent.body;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h1 style="color: #007bff;">Welcome to Domy v Itálii!</h1>
          <div style="white-space: pre-line;">${aiContent.body.replace(/\n/g, '<br>')}</div>
          
          <h3 style="margin-top: 30px;">Get Started:</h3>
          <ul>
            <li>Browse our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/properties">property listings</a></li>
            <li>Save your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/searches">search preferences</a></li>
            <li>Add properties to your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/favorites">favorites</a></li>
            <li>Get personalized <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations">recommendations</a></li>
          </ul>

          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Your Dashboard</a></p>
        </div>
      `;
    } else {
      // Fall back to static template
      subject = `Welcome to Domy v Itálii - Your Italian Property Journey Begins!`;
      text = `Welcome ${userName}!\n\nThank you for joining Domy v Itálii, your trusted partner for finding properties in Italy.\n\nGet started: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard\n\nBest regards,\nDomy v Itálii Team`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007bff;">Welcome to Domy v Itálii!</h1>
          <p>Hi ${userName},</p>
          <p>Thank you for joining <strong>Domy v Itálii</strong>, your trusted partner for finding beautiful properties in Italy.</p>
          
          <h3>Get Started:</h3>
          <ul>
            <li>Browse our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/properties">property listings</a></li>
            <li>Save your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/searches">search preferences</a></li>
            <li>Add properties to your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/favorites">favorites</a></li>
            <li>Get personalized <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations">recommendations</a></li>
          </ul>

          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Your Dashboard</a></p>
          
          <p>If you have any questions, don't hesitate to contact us!</p>
          
          <p>Best regards,<br>The Domy v Itálii Team</p>
        </div>
      `;
    }

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  async sendFollowUpEmail({ userEmail, userName, daysSinceRegistration }) {
    const subject = `How's your Italian property search going, ${userName}?`;
    
    const text = `Hi ${userName},\n\nIt's been ${daysSinceRegistration} days since you joined Domy v Itálii. How's your property search going?\n\nExplore more: ${process.env.NEXT_PUBLIC_BASE_URL}/properties\n\nBest regards,\nDomy v Itálii Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>How's your Italian property search going?</h2>
        <p>Hi ${userName},</p>
        <p>It's been ${daysSinceRegistration} days since you joined Domy v Itálii. We hope you're enjoying exploring our beautiful Italian properties!</p>
        
        <h3>Here are some helpful tips:</h3>
        <ul>
          <li><strong>Save searches:</strong> Set up alerts for properties that match your criteria</li>
          <li><strong>Favorite properties:</strong> Keep track of properties you love</li>
          <li><strong>Contact agents:</strong> Don't hesitate to ask questions about properties</li>
          <li><strong>Explore regions:</strong> Discover different areas of Italy</li>
        </ul>

        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/properties" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue Your Search</a></p>
        
        <p>Need help? Feel free to reach out to us anytime!</p>
        
        <p>Best regards,<br>The Domy v Itálii Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }
}

export default new EmailService();