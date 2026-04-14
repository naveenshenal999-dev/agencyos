import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

export async function POST(request: NextRequest) {
  try {
    const { clientName, month, metrics, topPosts, seoScore, industry, brandVoice } = await request.json()

    const systemPrompt = `You are a senior social media account manager writing a professional monthly report for a client.
The report should be polished, data-driven, and highlight achievements while providing clear direction for next month.
Write in a confident, professional tone that instills trust and demonstrates expertise.`

    const avgEngagement = metrics?.avgEngagement || 0
    const totalFollowers = metrics?.totalFollowers || 0
    const totalReach = metrics?.totalReach || 0

    const prompt = `Write a professional monthly social media performance report for ${clientName} (${industry || "brand"}).

REPORT MONTH: ${month}

PERFORMANCE DATA:
- Total followers: ${totalFollowers.toLocaleString()}
- Average engagement rate: ${avgEngagement}%
- Total reach: ${totalReach.toLocaleString()}
- Top posts: ${topPosts?.map((p: { caption?: string; platform: string; reach: number }) => `"${p.caption?.slice(0, 50)}" (${p.platform}, ${p.reach} reach)`).join("; ") || "Multiple high-performing posts"}
- SEO score: ${seoScore || "N/A"}/100
- Brand voice: ${brandVoice || "professional and engaging"}

Write the report with these exact sections:
1. EXECUTIVE SUMMARY (2-3 sentences, highlight key wins)
2. KEY HIGHLIGHTS (5 bullet points, specific metrics)
3. METRICS OVERVIEW (paragraph analyzing performance across platforms)
4. TOP PERFORMING CONTENT (what worked and why)
5. RECOMMENDATIONS (4 specific actions for next month)
6. NEXT MONTH GOALS (3 measurable targets)

Be specific with numbers. Sound like a confident expert. Keep each section concise but impactful.`

    const result = await generateText(prompt, systemPrompt)

    // Parse sections from the result
    const sections = {
      summary: extractSection(result, ["EXECUTIVE SUMMARY", "SUMMARY"]),
      highlights: extractSection(result, ["KEY HIGHLIGHTS", "HIGHLIGHTS"]),
      metrics_overview: extractSection(result, ["METRICS OVERVIEW", "METRICS"]),
      top_posts: extractSection(result, ["TOP PERFORMING CONTENT", "TOP CONTENT", "TOP POSTS"]),
      recommendations: extractSection(result, ["RECOMMENDATIONS"]),
      next_month_goals: extractSection(result, ["NEXT MONTH GOALS", "GOALS"]),
    }

    return NextResponse.json({ report: sections, raw: result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate report"
    console.error("Report generation error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function extractSection(text: string, headers: string[]): string {
  for (const header of headers) {
    const regex = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+:|$)`, "i")
    const match = text.match(regex)
    if (match) return match[1].trim()
  }
  return ""
}
