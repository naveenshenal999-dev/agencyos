import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { platform, topic, brandVoice, targetAudience, clientName } = await request.json()

    if (!platform || !topic) {
      return NextResponse.json({ error: "platform and topic are required" }, { status: 400 })
    }

    const platformGuidelines: Record<string, string> = {
      instagram: "Instagram (max 2200 chars, use 5-10 hashtags, emojis welcome, storytelling tone, end with CTA)",
      facebook: "Facebook (conversational, can be longer, encourage shares/comments, use 1-3 hashtags)",
      linkedin: "LinkedIn (professional tone, thought leadership, no more than 3 hashtags, no excessive emojis)",
      twitter: "Twitter/X (max 280 chars, punchy, witty, 1-2 hashtags, strong hook)",
    }

    const systemPrompt = `You are an expert social media copywriter for ${clientName || "a brand"}.
You write highly engaging, platform-optimized captions that drive real engagement.
Brand voice: ${brandVoice || "friendly, authentic, and engaging"}.
Target audience: ${targetAudience || "general social media users"}.`

    const prompt = `Write exactly 5 caption variations for a ${platformGuidelines[platform] || platform} post about: "${topic}".

Requirements:
- Each caption must be distinctly different in angle, tone, and structure
- Vary between: storytelling, question-based, list-based, bold statement, and behind-the-scenes angles
- Each must include a clear call-to-action
- Optimize specifically for ${platform} best practices
- Number each caption 1-5

Return ONLY the 5 captions, numbered 1-5, separated by "---". No explanations or headers.`

    const result = await generateText(prompt, systemPrompt)

    const captions = result
      .split("---")
      .map(c => c.replace(/^\s*\d+[\.\)]\s*/m, "").trim())
      .filter(c => c.length > 10)
      .slice(0, 5)

    return NextResponse.json({ captions })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate captions"
    console.error("Caption generation error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
