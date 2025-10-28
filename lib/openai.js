import OpenAI from 'openai';

// Initialize the OpenAI client with your API key
// Use a placeholder during build to prevent errors
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
});

export default openai;