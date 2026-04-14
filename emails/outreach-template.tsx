import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface OutreachEmailProps {
  recipientName?: string
  senderName?: string
  senderTitle?: string
  agencyName?: string
  subject?: string
  bodyText?: string
  ctaText?: string
  ctaUrl?: string
  trackingPixelUrl?: string
}

export function OutreachEmail({
  recipientName = "there",
  senderName = "Alex",
  senderTitle = "Social Media Strategist",
  agencyName = "Marko Ra Studio",
  bodyText = "",
  ctaText,
  ctaUrl,
  trackingPixelUrl,
}: OutreachEmailProps) {
  const firstName = recipientName.split(" ")[0]

  return (
    <Html>
      <Head />
      <Preview>{bodyText.slice(0, 120)}...</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>{agencyName}</Heading>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>Hi {firstName},</Text>

            {bodyText.split("\n").filter(Boolean).map((paragraph, i) => (
              <Text key={i} style={paragraph_style}>
                {paragraph}
              </Text>
            ))}

            {ctaText && ctaUrl && (
              <Section style={ctaSection}>
                <Button style={ctaButton} href={ctaUrl}>
                  {ctaText}
                </Button>
              </Section>
            )}
          </Section>

          {/* Signature */}
          <Hr style={divider} />
          <Section style={signature}>
            <Text style={sigName}>{senderName}</Text>
            <Text style={sigTitle}>{senderTitle} · {agencyName}</Text>
            <Text style={sigContact}>
              <Link href={`mailto:info@markorastudio.com`} style={link}>
                info@markorastudio.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you expressed interest in our services.{" "}
              <Link href="{{{UNSUBSCRIBE_URL}}}" style={link}>
                Unsubscribe
              </Link>
            </Text>
          </Section>

          {/* Tracking pixel */}
          {trackingPixelUrl && (
            <Img src={trackingPixelUrl} width="1" height="1" alt="" />
          )}
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = { backgroundColor: "#0a0a0a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { maxWidth: "600px", margin: "0 auto", backgroundColor: "#111111", borderRadius: "12px", overflow: "hidden", border: "1px solid #222" }
const header = { background: "linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)", padding: "32px 40px" }
const logo = { color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0", letterSpacing: "-0.5px" }
const content = { padding: "36px 40px 24px" }
const greeting = { fontSize: "16px", color: "#e5e7eb", marginBottom: "16px", fontWeight: "500" }
const paragraph_style = { fontSize: "15px", lineHeight: "1.7", color: "#9ca3af", marginBottom: "16px" }
const ctaSection = { textAlign: "center" as const, margin: "28px 0" }
const ctaButton = { backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none", display: "inline-block" }
const divider = { borderColor: "#222", margin: "0 40px" }
const signature = { padding: "20px 40px" }
const sigName = { fontSize: "15px", fontWeight: "600", color: "#e5e7eb", margin: "0 0 2px" }
const sigTitle = { fontSize: "13px", color: "#6b7280", margin: "0 0 4px" }
const sigContact = { fontSize: "13px", color: "#6b7280", margin: "0" }
const link = { color: "#7c3aed", textDecoration: "underline" }
const footer = { padding: "16px 40px 24px" }
const footerText = { fontSize: "12px", color: "#4b5563", lineHeight: "1.5", textAlign: "center" as const }

export default OutreachEmail
