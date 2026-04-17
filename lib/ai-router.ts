// Smart AI router — picks best available AI for each task type
// Falls back gracefully when keys aren't set or a provider fails

import { generateText as generateWithGroq } from "./groq"
import { generateWithGemini } from "./gemini"
import { generateWithOpenRouter } from "./openrouter"

export type AITask =
  | "email_body"    // Long-form personalized email writing
  | "email_subject" // Short punchy subject lines
  | "analysis"      // Website / SEO deep analysis
  | "scoring"       // Lead scoring, ranking decisions
  | "variant"       // A/B email variant (intentionally different style)
  | "general"       // Catch-all

// Priority order per task — first available wins
const TASK_PREFERENCES: Record<AITask, string[]> = {
  email_body:    ["groq", "gemini", "openrouter"],
  email_subject: ["groq", "openrouter", "gemini"],
  analysis:      ["gemini", "groq", "openrouter"],
  scoring:       ["gemini", "groq", "openrouter"],
  variant:       ["openrouter", "gemini", "groq"],
  general:       ["groq", "gemini", "openrouter"],
}

const MODEL_LABELS: Record<string, string> = {
  groq:       "Groq Llama3-70b",
  gemini:     "Gemini 1.5 Flash",
  openrouter: "Llama 3.1 8b (OpenRouter)",
}

export async function generateAI(
  task: AITask,
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string; model: string }> {
  const order = TASK_PREFERENCES[task]
  const errors: string[] = []

  for (const provider of order) {
    try {
      if (provider === "groq" && process.env.GROQ_API_KEY) {
        const text = await generateWithGroq(prompt, systemPrompt)
        return { text, model: MODEL_LABELS.groq }
      }
      if (provider === "gemini" && process.env.GEMINI_API_KEY) {
        const text = await generateWithGemini(prompt, systemPrompt)
        return { text, model: MODEL_LABELS.gemini }
      }
      if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
        const text = await generateWithOpenRouter(prompt, systemPrompt)
        return { text, model: MODEL_LABELS.openrouter }
      }
    } catch (err) {
      errors.push(`${provider}: ${String(err)}`)
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(" | ")}`)
}

// Generate A/B variants using DIFFERENT AIs simultaneously
export async function generateEmailVariants(
  prompt: string,
  systemPrompt?: string
): Promise<Array<{ text: string; model: string }>> {
  const providers = [
    {
      id: "groq",
      available: !!process.env.GROQ_API_KEY,
      fn: () => generateWithGroq(prompt, systemPrompt),
      model: MODEL_LABELS.groq,
    },
    {
      id: "gemini",
      available: !!process.env.GEMINI_API_KEY,
      fn: () => generateWithGemini(prompt, systemPrompt),
      model: MODEL_LABELS.gemini,
    },
    {
      id: "openrouter",
      available: !!process.env.OPENROUTER_API_KEY,
      fn: () => generateWithOpenRouter(prompt, systemPrompt, 1), // use mistral for variety
      model: "Mistral 7b (OpenRouter)",
    },
  ].filter((p) => p.available)

  if (providers.length === 0) throw new Error("No AI providers configured")

  const results = await Promise.allSettled(providers.map(async (p) => ({ text: await p.fn(), model: p.model })))

  return results
    .filter((r): r is PromiseFulfilledResult<{ text: string; model: string }> => r.status === "fulfilled")
    .map((r) => r.value)
}

// Use AI to pick the best email from variants
export async function pickBestEmail(
  variants: Array<{ text: string; model: string }>,
  context: { company: string; issues: string[] }
): Promise<{ winner: { text: string; model: string }; reason: string }> {
  if (variants.length === 1) return { winner: variants[0], reason: "Only one variant generated" }

  const variantList = variants
    .map((v, i) => `=== VARIANT ${i + 1} (by ${v.model}) ===\n${v.text}`)
    .join("\n\n")

  const prompt = `You are an expert cold email conversion specialist.

Company: ${context.company}
Issues found: ${context.issues.slice(0, 3).join(", ")}

Here are ${variants.length} cold email variants written by different AI models. Pick the BEST one for converting this prospect.

${variantList}

Reply with ONLY a JSON object: {"winner": 1, "reason": "one sentence why"}
Pick the one that is most specific, human, and compelling. No fluff.`

  try {
    const { text } = await generateAI("scoring", prompt)
    const match = text.match(/\{[\s\S]*?\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      const idx = (parsed.winner || 1) - 1
      return {
        winner: variants[Math.min(idx, variants.length - 1)],
        reason: parsed.reason || "Selected by AI",
      }
    }
  } catch {
    // fallback to first variant
  }

  return { winner: variants[0], reason: "Fallback to primary variant" }
}
