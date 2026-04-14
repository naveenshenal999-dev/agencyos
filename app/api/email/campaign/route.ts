import { NextRequest, NextResponse } from "next/server"
import { DAILY_SEND_LIMIT } from "@/lib/resend"

// POST /api/email/campaign — run a campaign batch (up to 30 emails)
export async function POST(request: NextRequest) {
  try {
    const { campaignId, agencyId } = await request.json()

    if (!campaignId || !agencyId) {
      return NextResponse.json({ error: "campaignId and agencyId required" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Fetch campaign details
    const campaignRes = await fetch(`${baseUrl}/api/email/campaign/${campaignId}?agencyId=${agencyId}`)
    if (!campaignRes.ok) return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    const campaign = await campaignRes.json()

    // Fetch queued leads for this campaign (not yet sent today)
    const leadsRes = await fetch(`${baseUrl}/api/email/leads?agencyId=${agencyId}&campaignId=${campaignId}&status=queued&limit=${DAILY_SEND_LIMIT}`)
    const leadsData = await leadsRes.json()
    const leads = leadsData.leads || []

    if (leads.length === 0) {
      return NextResponse.json({ message: "No leads queued", sent: 0 })
    }

    const results = []
    for (const lead of leads.slice(0, DAILY_SEND_LIMIT)) {
      try {
        const sendRes = await fetch(`${baseUrl}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            leadId: lead.id,
            agencyId,
            toEmail: lead.email,
            toName: lead.full_name,
            subject: campaign.subject,
            bodyText: campaign.body,
            ctaText: campaign.cta_text,
            ctaUrl: campaign.cta_url,
            senderName: campaign.sender_name,
            agencyName: campaign.agency_name,
          }),
        })
        const result = await sendRes.json()
        results.push({ leadId: lead.id, email: lead.email, success: result.success, resendId: result.resendId })
      } catch (err) {
        results.push({ leadId: lead.id, email: lead.email, success: false, error: String(err) })
      }

      // Rate limit: 1 email per second
      await new Promise(r => setTimeout(r, 1000))
    }

    const sent = results.filter(r => r.success).length
    return NextResponse.json({ sent, total: leads.length, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Campaign run failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
