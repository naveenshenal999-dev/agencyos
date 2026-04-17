import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"
import type { WebsiteAnalysis } from "../analyze-website/route"

export async function POST(request: NextRequest) {
  try {
    const { company, website, analysis, senderName, agencyName, niche }: {
      company: string
      website: string
      analysis: WebsiteAnalysis
      senderName?: string
      agencyName?: string
      niche?: string
    } = await request.json()

    const issuesList = analysis.issues.slice(0, 3).join("\n- ")
    const score = analysis.score

    const prompt = `You are ${senderName || "Alex"} from ${agencyName || "a social media and web agency"}.

Write a short, professional, personalized cold email to the owner of "${company}" (website: ${website}).

Their website has a performance score of ${score}/100. Key issues found:
- ${issuesList}

The email should:
- Be 3-4 short paragraphs max
- Mention 1-2 SPECIFIC issues you found (use real numbers/metrics from above)
- NOT be generic — reference their actual business type: ${niche || "their industry"}
- Lead naturally to a free audit or call offer
- Sound human, not salesy
- End with a clear but soft CTA
- NO subject line in the body
- Sign off with ${senderName || "Alex"} from ${agencyName || "the agency"}

Write only the email body, no subject line.`

    const body = await generateText(prompt, "You are an expert at writing high-converting cold email outreach for digital agencies. Keep emails concise, specific, and human.")

    // Generate subject line separately
    const subjectPrompt = `Write ONE compelling email subject line for a cold outreach email to "${company}" about their website having a speed score of ${score}/100.
Keep it under 60 characters. Make it curiosity-driven, not clickbait. No quotes. Just the subject line.`

    const subject = await generateText(subjectPrompt)

    return NextResponse.json({
      subject: subject.trim().replace(/^["']|["']$/g, ""),
      body: body.trim(),
      company,
      website,
      score,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
