import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const GROQ_MODEL = 'llama3-70b-8192'

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
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
