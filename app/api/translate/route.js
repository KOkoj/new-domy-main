import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// OpenAI Translation API
export async function POST(request) {
  try {
    const { text, sourceLang, targetLang, context } = await request.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        hint: 'Add OPENAI_API_KEY to your environment variables'
      }, { status: 503 })
    }

    const languageNames = {
      en: 'English',
      cs: 'Czech',
      it: 'Italian'
    }

    const systemPrompt = `You are a professional translator specializing in real estate property descriptions. Translate the following text from ${languageNames[sourceLang]} to ${languageNames[targetLang]}. 

Context: ${context || 'Real estate property listing'}

Guidelines:
- Maintain the professional and appealing tone
- Preserve any specific measurements, numbers, or proper nouns
- Adapt idioms and expressions naturally to the target language
- Keep the same paragraph structure
- Focus on accuracy and natural flow in the target language

Provide ONLY the translation, no explanations or additional text.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json({ 
        error: 'Translation failed',
        details: process.env.NODE_ENV !== 'production' ? errorData.error?.message : undefined
      }, { status: 500 })
    }

    const data = await response.json()
    const translatedText = data.choices[0].message.content.trim()

    return NextResponse.json({ 
      translatedText,
      sourceLang,
      targetLang,
      usage: data.usage
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ 
      error: 'Translation failed',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    }, { status: 500 })
  }
}

