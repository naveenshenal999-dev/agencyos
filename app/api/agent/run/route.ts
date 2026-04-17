import { NextRequest, NextResponse } from "next/server"

// Full pipeline: search → analyze → generate email → add to leads queue
// Streams progress back as NDJSON so the UI can show live updates
export async function POST(request: NextRequest) {
  const { niche, location, maxCompanies = 10, scoreThreshold = 75, senderName, agencyName, autoQueue = false } = await request.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  function send(data: object) {
    writer.write(encoder.encode(JSON.stringify(data) + "\n"))
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  async function run() {
    try {
      // Step 1: Find companies
      send({ step: "search", status: "running", message: `Searching for "${niche}" companies${location ? ` in ${location}` : ""}...` })

      const searchRes = await fetch(`${base}/api/agent/search-companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, location, count: maxCompanies }),
      })
      const { companies = [], source } = await searchRes.json()
      send({ step: "search", status: "done", message: `Found ${companies.length} companies (via ${source})`, count: companies.length })

      if (companies.length === 0) {
        send({ step: "done", status: "done", message: "No companies found. Try a different niche or location.", results: [] })
        writer.close()
        return
      }

      const results = []
      let analyzed = 0
      let qualified = 0

      // Step 2: Analyze each website
      for (const company of companies.slice(0, maxCompanies)) {
        if (!company.website) continue

        send({ step: "analyze", status: "running", message: `Analyzing ${company.name}...`, progress: analyzed / companies.length })

        try {
          const analyzeRes = await fetch(`${base}/api/agent/analyze-website`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: company.website }),
          })
          const { analysis, error } = await analyzeRes.json()

          if (error || !analysis) {
            send({ step: "analyze", status: "skip", message: `Skipped ${company.name} — ${error || "could not analyze"}` })
            analyzed++
            continue
          }

          analyzed++

          // Step 3: Only email companies with poor scores
          if (analysis.score >= scoreThreshold) {
            send({ step: "analyze", status: "skip", message: `${company.name} scored ${analysis.score}/100 — too good, skipping` })
            continue
          }

          qualified++
          send({ step: "email", status: "running", message: `Generating email for ${company.name} (score: ${analysis.score}/100)...` })

          // Step 4: Generate personalized email
          const emailRes = await fetch(`${base}/api/agent/generate-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company: company.name, website: company.website, analysis, senderName, agencyName, niche }),
          })
          const emailData = await emailRes.json()

          const result = {
            company: company.name,
            website: company.website,
            description: company.description,
            score: analysis.score,
            issues: analysis.issues,
            subject: emailData.subject,
            body: emailData.body,
            status: "ready",
          }
          results.push(result)

          // Step 5: Optionally add to leads queue
          if (autoQueue) {
            await fetch(`${base}/api/email/leads`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: `contact@${new URL(company.website).hostname}`,
                full_name: company.name,
                company: company.name,
                website: company.website,
                source: "ai_agent",
                notes: `Score: ${analysis.score}/100. Issues: ${analysis.issues.slice(0, 2).join(", ")}`,
              }),
            })
          }

          send({ step: "email", status: "done", message: `Email ready for ${company.name}`, result })
        } catch (err) {
          send({ step: "analyze", status: "skip", message: `Error with ${company.name}: ${String(err)}` })
          analyzed++
        }
      }

      send({
        step: "done",
        status: "done",
        message: `Done! Analyzed ${analyzed} sites, ${qualified} qualify for outreach.`,
        results,
        stats: { analyzed, qualified, skipped: analyzed - qualified },
      })
    } catch (err) {
      send({ step: "error", status: "error", message: String(err) })
    } finally {
      writer.close()
    }
  }

  run()

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  })
}
