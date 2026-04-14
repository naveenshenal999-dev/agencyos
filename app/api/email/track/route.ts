import { NextRequest, NextResponse } from "next/server"

// 1x1 transparent GIF for open tracking
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const campaignId = searchParams.get("campaignId")
  const leadId = searchParams.get("leadId")

  // Log the open/click event (fire and forget)
  if (campaignId && leadId) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl?.startsWith("http") && supabaseKey) {
        const field = type === "click" ? "clicked_at" : "opened_at"
        await fetch(
          `${supabaseUrl}/rest/v1/email_logs?campaign_id=eq.${campaignId}&lead_id=eq.${leadId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ [field]: new Date().toISOString(), status: type === "click" ? "clicked" : "opened" }),
          }
        )
      }
    } catch {
      // Non-blocking
    }
  }

  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
