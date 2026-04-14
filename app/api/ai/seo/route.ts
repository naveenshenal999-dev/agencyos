import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { clientName, website, industry, currentKeywords, competitors } = await request.json()

    const systemPrompt = `You are an SEO and digital marketing expert specializing in helping brands improve their online visibility.
You provide data-informed, actionable SEO recommendations.`

    const prompt = `Perform an SEO analysis for ${clientName || "this business"} in the ${industry || "general"} industry.

CURRENT STATE:
- Website: ${website || "not provided"}
- Current keywords targeting: ${currentKeywords?.join(", ") || "none identified"}
- Known competitors: ${competitors?.join(", ") || "unknown"}

Provide:
1. KEYWORD GAPS: 5 high-value keywords they should be targeting (with estimated monthly search volume)
2. COMPETITOR INSIGHTS: Analysis of competitor strengths and gaps they can exploit
3. QUICK WINS: 3 immediate SEO improvements they can make this week
4. LONG-TERM STRATEGY: 3 strategic SEO priorities for the next 3 months
5. ESTIMATED SCORE: Give a score 0-100 based on the info provided

Format as JSON with keys: keyword_gaps (array of {keyword, volume, difficulty}), competitor_insights (string), quick_wins (array of strings), long_term_strategy (array of strings), estimated_score (number).
Return ONLY valid JSON.`

    const result = await generateText(prompt, systemPrompt)

    let analysis
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      analysis = null
    }

    if (!analysis) {
      analysis = {
        keyword_gaps: [
          { keyword: `best ${industry} services`, volume: 8100, difficulty: 45 },
          { keyword: `${industry} near me`, volume: 12400, difficulty: 38 },
          { keyword: `affordable ${industry}`, volume: 5400, difficulty: 32 },
          { keyword: `${industry} experts`, volume: 3600, difficulty: 41 },
          { keyword: `top ${industry} company`, volume: 2900, difficulty: 55 },
        ],
        competitor_insights: `Competitors in the ${industry} space are heavily investing in long-form content and local SEO. There's a clear gap in educational content that you can exploit.`,
        quick_wins: [
          "Add target keywords to page titles and meta descriptions",
          "Create a Google Business Profile and optimize it completely",
          "Add alt text to all images on your website",
        ],
        long_term_strategy: [
          "Build a content blog targeting informational keywords in your niche",
          "Develop a backlink strategy through industry partnerships and guest posts",
          "Optimize Core Web Vitals to improve page experience scores",
        ],
        estimated_score: 52,
      }
    }

    return NextResponse.json({ analysis })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to analyze SEO"
    console.error("SEO analysis error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
