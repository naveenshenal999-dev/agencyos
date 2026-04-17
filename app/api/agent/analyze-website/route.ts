import { NextRequest, NextResponse } from "next/server"

export interface WebsiteAnalysis {
  url: string
  score: number
  issues: string[]
  aiInsights: string[]
  metrics: {
    performance: number
    lcp: string
    fid: string
    cls: string
    ttfb: string
    speedIndex: string
    mobile: number
    desktop: number
  }
  summary: string
  aiModel?: string
}

// Uses Google PageSpeed Insights API — completely free, no key needed for low volume
// With GOOGLE_API_KEY env var it unlocks 10,000 queries/day free
// With GEMINI_API_KEY it adds deep content/SEO analysis on top
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

    const cleanUrl = url.startsWith("http") ? url : `https://${url}`
    const apiKey = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : ""

    const [mobileRes, desktopRes] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=mobile${apiKey}`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=desktop${apiKey}`),
    ])

    if (!mobileRes.ok) {
      return NextResponse.json({ error: `Could not analyze ${cleanUrl} — site may be unreachable` }, { status: 400 })
    }

    const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()])

    const mobileScore = Math.round((mobile.lighthouseResult?.categories?.performance?.score || 0) * 100)
    const desktopScore = Math.round((desktop.lighthouseResult?.categories?.performance?.score || 0) * 100)

    const audits = mobile.lighthouseResult?.audits || {}

    const lcp = audits["largest-contentful-paint"]?.displayValue || "Unknown"
    const fid = audits["total-blocking-time"]?.displayValue || "Unknown"
    const cls = audits["cumulative-layout-shift"]?.displayValue || "Unknown"
    const ttfb = audits["server-response-time"]?.displayValue || "Unknown"
    const speedIndex = audits["speed-index"]?.displayValue || "Unknown"

    const issues: string[] = []

    if (mobileScore < 50) issues.push(`Mobile performance score is critically low (${mobileScore}/100)`)
    else if (mobileScore < 70) issues.push(`Mobile performance score needs improvement (${mobileScore}/100)`)

    if (desktopScore < 70) issues.push(`Desktop performance is slow (${desktopScore}/100)`)

    const lcpSecs = parseFloat(lcp)
    if (lcpSecs > 4) issues.push(`Slow page load — takes ${lcp} to show main content (should be under 2.5s)`)
    else if (lcpSecs > 2.5) issues.push(`Page load is slightly slow — ${lcp} to show main content`)

    const clsNum = parseFloat(cls)
    if (clsNum > 0.25) issues.push(`Layout shifts on load — bad user experience (CLS: ${cls})`)
    else if (clsNum > 0.1) issues.push(`Minor layout shift detected (CLS: ${cls})`)

    const ttfbMs = parseFloat(ttfb)
    if (ttfbMs > 600) issues.push(`Server is slow to respond — ${ttfb} (should be under 200ms)`)

    if (!audits["viewport"]?.score) issues.push("Not optimized for mobile devices — no viewport meta tag")
    if (!audits["meta-description"]?.score) issues.push("Missing meta description — hurts search engine ranking")
    if (!audits["image-alt"]?.score) issues.push("Images missing alt text — bad for SEO and accessibility")

    if (audits["render-blocking-resources"]?.score === 0) {
      issues.push("Render-blocking scripts slowing page load")
    }
    if (audits["uses-optimized-images"]?.score === 0) {
      issues.push("Images are not optimized — wasting bandwidth and slowing load time")
    }
    if (audits["uses-responsive-images"]?.score === 0) {
      issues.push("Images not properly sized for screen — loading oversized images")
    }

    const overallScore = Math.round((mobileScore + desktopScore) / 2)

    let summary = ""
    if (overallScore >= 90) summary = "Website performs well but has minor room for improvement."
    else if (overallScore >= 70) summary = `Website has noticeable performance issues with a ${overallScore}/100 score that are hurting conversions.`
    else if (overallScore >= 50) summary = `Website has serious performance problems (${overallScore}/100) that are likely costing significant business.`
    else summary = `Website is critically slow (${overallScore}/100) — visitors are almost certainly leaving before the page loads.`

    // ── Gemini deep content analysis (if key available) ──────────────────────
    const aiInsights: string[] = []
    let aiModel: string | undefined

    if (process.env.GEMINI_API_KEY) {
      try {
        // Grab the page HTML (5s timeout)
        const pageRes = await Promise.race([
          fetch(cleanUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; AgencyBot/1.0)" } }),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]) as Response

        if (pageRes.ok) {
          const html = await pageRes.text()
          // Extract visible text, strip tags, limit size
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .slice(0, 3000)

          const { generateWithGemini } = await import("@/lib/gemini")
          const geminiPrompt = `Analyze this small business website for SEO, conversion, and trust issues.

URL: ${cleanUrl}
Page content (truncated): ${text}

Find up to 5 specific, actionable problems. Focus on:
- Missing or weak CTAs
- Trust signals (reviews, certifications, phone number, address)
- Content quality (vague, outdated, thin)
- Social proof
- Contact accessibility

Reply ONLY as a JSON array of short issue strings (max 15 words each):
["issue 1", "issue 2", ...]`

          const geminiResponse = await generateWithGemini(geminiPrompt)
          const match = geminiResponse.match(/\[[\s\S]*?\]/)
          if (match) {
            const parsed: string[] = JSON.parse(match[0])
            aiInsights.push(...parsed.slice(0, 5))
            aiModel = "Gemini 1.5 Flash"
          }
        }
      } catch {
        // Silently skip — don't fail the whole analysis if Gemini errors
      }
    }

    const analysis: WebsiteAnalysis = {
      url: cleanUrl,
      score: overallScore,
      issues,
      aiInsights,
      metrics: { performance: overallScore, lcp, fid, cls, ttfb, speedIndex, mobile: mobileScore, desktop: desktopScore },
      summary,
      aiModel,
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
