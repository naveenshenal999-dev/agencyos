import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { clientName, industry, metrics, postingFrequency, seoScore, platforms, brandVoice } = await request.json()

    const systemPrompt = `You are a senior social media strategist and digital marketing expert with 10+ years of experience.
You analyze brand performance data and identify critical weaknesses with specific, actionable solutions.`

    const prompt = `Analyze the following social media account data for ${clientName || "this client"} (${industry || "unknown industry"}) and identify their TOP 5 weaknesses.

DATA:
- Platforms: ${platforms?.join(", ") || "Instagram, Facebook"}
- Posting frequency: ${postingFrequency || "2-3 times per week"}
- Average engagement rate: ${metrics?.avgEngagement || "unknown"}%
- Total followers: ${metrics?.totalFollowers || "unknown"}
- SEO score: ${seoScore || "unknown"}/100
- Brand voice: ${brandVoice || "not defined"}

For each weakness provide:
1. The weakness (specific, not generic)
2. Why it's hurting their growth
3. One concrete action to fix it this week

Format as JSON array with objects: { weakness, impact, action }
Return ONLY valid JSON, no markdown.`

    const result = await generateText(prompt, systemPrompt)

    let weaknesses
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      weaknesses = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      // Fallback parse
      weaknesses = [
        { weakness: "Inconsistent posting schedule", impact: "Algorithm deprioritizes inconsistent accounts, reducing organic reach by up to 40%", action: "Schedule posts for the next 30 days using a content calendar today" },
        { weakness: "Low engagement rate", impact: "Below-average engagement signals low content relevance to your audience", action: "Reply to every comment within 2 hours for the next week to boost engagement signals" },
        { weakness: "Missing SEO optimization", impact: "Profile bios and captions aren't optimized for search, missing discovery traffic", action: "Add 3 high-volume keywords to bio and first caption line of every post" },
        { weakness: "No clear CTA strategy", impact: "Posts don't direct audience action, leading to passive scrollers not converting", action: "Add one specific CTA to every post: 'Link in bio', 'Comment below', or 'Share this'" },
        { weakness: "Underutilizing video content", impact: "Video gets 3x more reach than static images on most platforms", action: "Create one 30-second Reel or short video this week using existing content" },
      ]
    }

    return NextResponse.json({ weaknesses: weaknesses.slice(0, 5) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to analyze weaknesses"
    console.error("Weakness detection error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
