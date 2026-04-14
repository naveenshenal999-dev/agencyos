import { NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL, FROM_NAME, DAILY_SEND_LIMIT } from "@/lib/resend"
import { render } from "@react-email/render"
import { OutreachEmail } from "@/emails/outreach-template"

export async function POST(request: NextRequest) {
  try {
    const {
      campaignId,
      leadId,
      agencyId,
      toEmail,
      toName,
      subject,
      bodyText,
      ctaText,
      ctaUrl,
      senderName,
      senderTitle,
      agencyName,
    } = await request.json()

    if (!toEmail || !subject || !bodyText) {
      return NextResponse.json({ error: "toEmail, subject, and bodyText are required" }, { status: 400 })
    }

    // Build tracking pixel URL
    const trackingPixelUrl = campaignId && leadId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track?type=open&campaignId=${campaignId}&leadId=${leadId}`
      : undefined

    // Render React Email template
    const html = await render(OutreachEmail({
      recipientName: toName || toEmail.split("@")[0],
      senderName: senderName || "Alex",
      senderTitle: senderTitle || "Social Media Strategist",
      agencyName: agencyName || FROM_NAME,
      bodyText,
      ctaText,
      ctaUrl,
      trackingPixelUrl,
    }))

    const { data, error } = await resend.emails.send({
      from: `${agencyName || FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject,
      html,
    })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, resendId: data?.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send email"
    console.error("Email send error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
