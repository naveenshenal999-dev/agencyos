import { NextRequest, NextResponse } from "next/server"
import type { WebsiteAnalysis } from "../analyze-website/route"
import { generateAI, generateEmailVariants, pickBestEmail } from "@/lib/ai-router"

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

    const sender = senderName || "Alex"
    const agency = agencyName || "a web & social media agency"
    const issuesList = [...analysis.issues, ...analysis.aiInsights].slice(0, 4).join("\n- ")
    const score = analysis.score

    const emailPrompt = `You are ${sender} from ${agency}.

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
- Sign off with ${sender} from ${agency}

Write only the email body, no subject line.`

    const emailSystem = "You are an expert at writing high-converting cold email outreach for digital agencies. Keep emails concise, specific, and human."

    // Try to generate A/B variants from multiple AIs simultaneously
    let emailBody: string
    let emailModel: string
    let variantCount = 1

    const variants = await generateEmailVariants(emailPrompt, emailSystem)

    if (variants.length > 1) {
      const { winner, reason } = await pickBestEmail(variants, { company, issues: analysis.issues })
      emailBody = winner.text
      emailModel = `${winner.model} (won A/B vs ${variants.length} variants — ${reason})`
      variantCount = variants.length
    } else if (variants.length === 1) {
      emailBody = variants[0].text
      emailModel = variants[0].model
    } else {
      // Absolute fallback
      const result = await generateAI("email_body", emailPrompt, emailSystem)
      emailBody = result.text
      emailModel = result.model
    }

    // Subject line — use fastest AI
    const subjectPrompt = `Write ONE compelling email subject line for a cold outreach email to "${company}" about their website having a speed score of ${score}/100.
Keep it under 60 characters. Make it curiosity-driven, not clickbait. No quotes. Just the subject line.`

    const subjectResult = await generateAI("email_subject", subjectPrompt)

    return NextResponse.json({
      subject: subjectResult.text.trim().replace(/^["']|["']$/g, ""),
      body: emailBody.trim(),
      company,
      website,
      score,
      aiModel: emailModel,
      subjectModel: subjectResult.model,
      variantCount,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
