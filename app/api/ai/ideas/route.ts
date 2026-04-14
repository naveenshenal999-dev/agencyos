import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { clientName, industry, targetAudience, brandVoice, recentTopics, platforms } = await request.json()

    const systemPrompt = `You are a creative social media strategist who generates viral, engaging content ideas.
You understand platform algorithms, trends, and audience psychology deeply.`

    const prompt = `Generate 10 fresh, creative post ideas for ${clientName || "this brand"} in the ${industry || "general"} industry.

CONTEXT:
- Target audience: ${targetAudience || "general social media users"}
- Brand voice: ${brandVoice || "friendly and authentic"}
- Active platforms: ${platforms?.join(", ") || "Instagram, Facebook"}
- Recent topics covered: ${recentTopics || "general brand content"}

For each idea provide:
- title: catchy post title (5-8 words)
- concept: what the post is about (1-2 sentences)
- platform: best platform for this idea
- format: content format (Reel, Carousel, Story, Static, Thread)
- hook: the opening line to grab attention

Return as JSON array. Return ONLY valid JSON, no markdown code blocks.`

    const result = await generateText(prompt, systemPrompt)

    let ideas
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      ideas = [
        { title: "Behind the scenes of our process", concept: "Show your audience what happens behind the scenes of creating your product or service", platform: "Instagram", format: "Reel", hook: "You've seen the final result. Now here's what it actually takes..." },
        { title: "Customer transformation story", concept: "Feature a real customer result with before/after context", platform: "Instagram", format: "Carousel", hook: "Meet [Name]. 3 months ago they were struggling with..." },
        { title: "Industry myth busted", concept: "Debunk a common misconception in your industry", platform: "LinkedIn", format: "Thread", hook: "Everyone in [industry] is telling you [myth]. Here's why that's wrong." },
        { title: "Quick tip Tuesday series", concept: "Share a fast, actionable tip your audience can use immediately", platform: "Instagram", format: "Reel", hook: "30-second tip that will save you hours every week:" },
        { title: "Team member spotlight", concept: "Introduce a team member and their expertise", platform: "LinkedIn", format: "Static", hook: "The person behind [result] — meet our..." },
      ]
    }

    return NextResponse.json({ ideas: ideas.slice(0, 10) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate ideas"
    console.error("Idea generation error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
