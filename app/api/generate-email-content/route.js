import { NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request) {
  try {
    const { 
      recipientName, 
      emailType, 
      propertyDetails, 
      additionalContext,
      tone = "professional"
    } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const prompt = `
      Generate a personalized email body for a ${emailType} email to ${recipientName}.
      ${propertyDetails ? `The email is about a property: ${propertyDetails}` : ''}
      ${additionalContext ? `Additional context: ${additionalContext}` : ''}
      The tone should be ${tone}.
      The email should be concise, engaging, and include a clear call to action.
      This is for an Italian property platform called "Domy v Itálii" targeting Czech and international buyers.
      Include relevant Italian property context and make it sound authentic.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert email copywriter who creates personalized, engaging email content for Italian real estate targeting Czech and international buyers." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const emailContent = response.choices[0].message.content.trim();
    
    return NextResponse.json({ emailContent });
  } catch (error) {
    console.error('Error generating email content:', error);
    return NextResponse.json(
      { error: 'Failed to generate email content' },
      { status: 500 }
    );
  }
}