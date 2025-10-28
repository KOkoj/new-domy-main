import { NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request) {
  try {
    const { recipientName, emailType, propertyDetails, additionalContext } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const prompt = `
      Generate a compelling email subject line for a ${emailType} email to ${recipientName}.
      ${propertyDetails ? `The email is about a property: ${propertyDetails}` : ''}
      ${additionalContext ? `Additional context: ${additionalContext}` : ''}
      The subject line should be attention-grabbing, personalized, and under 50 characters.
      Make it sound professional yet engaging for an Italian property platform.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert email marketer who creates engaging subject lines for Italian real estate." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    const subjectLine = response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
    
    return NextResponse.json({ subjectLine });
  } catch (error) {
    console.error('Error generating subject line:', error);
    return NextResponse.json(
      { error: 'Failed to generate subject line' },
      { status: 500 }
    );
  }
}