import Groq from 'groq-sdk'

export const GROQ_MODEL = 'llama3-70b-8192'

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || 'placeholder',
  })
}

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Add it in your environment variables.')
  }

  const groq = getGroqClient()
  const messages: Groq.Chat.ChatCompletionMessageParam[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    max_tokens: 2048,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || ''
}
