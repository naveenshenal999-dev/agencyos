import { NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"

// Finds companies using SerpAPI (free 100/month) or Google Custom Search (free 100/day)
// Falls back to AI-generated list if no API key is configured
export async function POST(request: NextRequest) {
  try {
    const { niche, location, count = 10 } = await request.json()
    if (!niche) return NextResponse.json({ error: "niche required" }, { status: 400 })

    const query = `${niche} ${location || ""}`.trim()
    let companies: { name: string; website: string; description: string }[] = []

    // Try SerpAPI first (free 100/month — get key at serpapi.com)
    if (process.env.SERPAPI_KEY) {
      const params = new URLSearchParams({
        q: query,
        api_key: process.env.SERPAPI_KEY,
        num: String(count),
        hl: "en",
      })
      const res = await fetch(`https://serpapi.com/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        const results = data.organic_results || []
        companies = results
          .filter((r: { link?: string }) => r.link && !r.link.includes("yelp") && !r.link.includes("facebook") && !r.link.includes("google"))
          .slice(0, count)
          .map((r: { title?: string; link?: string; snippet?: string }) => ({
            name: r.title || r.link || "Unknown",
            website: r.link || "",
            description: r.snippet || "",
          }))
      }
    }
    // Try Google Custom Search (free 100/day — get keys at console.cloud.google.com)
    else if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
      const params = new URLSearchParams({
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_CX,
        q: query,
        num: String(Math.min(count, 10)),
      })
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)
      if (res.ok) {
        const data = await res.json()
        companies = (data.items || []).map((item: { title?: string; link?: string; snippet?: string }) => ({
          name: item.title || "",
          website: item.link || "",
          description: item.snippet || "",
        }))
      }
    }
    // Fallback: Use Groq AI to generate plausible company names + websites to research
    else {
      const prompt = `Generate a list of ${count} real-sounding small/medium businesses in the "${niche}" industry${location ? ` located in ${location}` : ""}.

For each company provide:
- A realistic business name
- A plausible website URL (like businessname.com)
- A one-line description

Format as JSON array: [{"name": "...", "website": "...", "description": "..."}]
Only respond with the JSON array, nothing else.`

      const text = await generateText(prompt)
      try {
        const match = text.match(/\[[\s\S]*\]/)
        if (match) companies = JSON.parse(match[0])
      } catch { /* fallback empty */ }
    }

    return NextResponse.json({ companies, query, source: process.env.SERPAPI_KEY ? "serpapi" : process.env.GOOGLE_API_KEY ? "google" : "ai" })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
