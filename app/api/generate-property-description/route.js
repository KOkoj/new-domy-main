import { NextResponse } from 'next/server';
import openai from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { 
      propertyType, 
      bedrooms, 
      bathrooms, 
      squareFeet, 
      location, 
      features,
      targetAudience,
      price
    } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const featuresText = Array.isArray(features) ? features.join(', ') : features || '';
    
    const prompt = `
      Generate an engaging property description for a ${propertyType} with ${bedrooms} bedrooms, 
      ${bathrooms} bathrooms, ${squareFeet} square meters, located in ${location}, Italy.
      ${price ? `Price: €${price}.` : ''}
      Key features include: ${featuresText}.
      The target audience is: ${targetAudience}.
      The description should highlight the property's unique selling points and appeal to the target audience.
      Focus on the Italian lifestyle, location benefits, and investment potential.
      Make it sound authentic and compelling for international buyers interested in Italian real estate.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert Italian real estate copywriter who creates compelling property descriptions that appeal to Czech and international buyers. Focus on lifestyle benefits, location advantages, and investment potential." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    const propertyDescription = response.choices[0].message.content.trim();
    
    return NextResponse.json({ propertyDescription });
  } catch (error) {
    console.error('Error generating property description:', error);
    return NextResponse.json(
      { error: 'Failed to generate property description' },
      { status: 500 }
    );
  }
}