// OpenRouter — routes to free open-source models
// Free models (no credits needed): llama-3.1-8b, mistral-7b, gemma-2-9b
// Get key at: openrouter.ai (free signup, no credit card for :free models)

const FREE_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
]

export async function generateWithOpenRouter(
  prompt: string,
  systemPrompt?: string,
  modelIndex = 0
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured")

  const model = FREE_MODELS[modelIndex % FREE_MODELS.length]

  const messages: { role: string; content: string }[] = []
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt })
  messages.push({ role: "user", content: prompt })

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AgencyOS",
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error("OpenRouter returned empty response")
  return text
}

export { FREE_MODELS }
