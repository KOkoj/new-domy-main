import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'placeholder_will_be_added_later') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.isConfigured = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'placeholder_will_be_added_later';
  }

  async sendEmail({ to, subject, text, html, from = 'noreply@domy-v-italii.com' }) {
    if (!this.isConfigured) {
      console.log('SendGrid not configured - Email would be sent:', { to, subject, from });
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const msg = {
        to,
        from,
        subject,
        text,
        html
      };

      const result = await sgMail.send(msg);
      console.log('Email sent successfully:', result[0].statusCode);
      return { success: true, statusCode: result[0].statusCode };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPropertyAlert({ userEmail, userName, properties, searchCriteria }) {
    const subject = `New Properties Found: ${properties.length} matches your search`;
    
    const text = `Hi ${userName},\n\nWe found ${properties.length} new properties that match your saved search criteria.\n\nView your matches at: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/recommendations`;
    
    const html = `
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

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  async sendInquiryConfirmation({ userEmail, userName, propertyTitle, inquiryMessage }) {
    const subject = `Inquiry Confirmation - ${propertyTitle}`;
    
    const text = `Hi ${userName},\n\nThank you for your inquiry about "${propertyTitle}". We have received your message and will get back to you soon.\n\nYour message: ${inquiryMessage}\n\nBest regards,\nDomy v Itálii Team`;
    
    const html = `
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

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html
    });
  }

  async sendWelcomeEmail({ userEmail, userName }) {
    const subject = `Welcome to Domy v Itálii - Your Italian Property Journey Begins!`;
    
    const text = `Welcome ${userName}!\n\nThank you for joining Domy v Itálii, your trusted partner for finding properties in Italy.\n\nGet started: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard\n\nBest regards,\nDomy v Itálii Team`;
    
    const html = `
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