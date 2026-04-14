import { NextRequest, NextResponse } from "next/server"
import { IS_DEMO } from "@/lib/demo-data"

// Demo leads for testing
const DEMO_LEADS = [
  { id: "lead-1", email: "sarah@techstartup.com", full_name: "Sarah Mitchell", company: "TechStartup Inc", status: "new", source: "website" },
  { id: "lead-2", email: "james@growthco.io", full_name: "James Torres", company: "GrowthCo", status: "new", source: "referral" },
  { id: "lead-3", email: "priya@designstudio.com", full_name: "Priya Nair", company: "Design Studio", status: "contacted", source: "linkedin" },
  { id: "lead-4", email: "marco@ecommerce.shop", full_name: "Marco Rivera", company: "ECommerce Shop", status: "new", source: "cold" },
  { id: "lead-5", email: "lisa@fintech.io", full_name: "Lisa Chen", company: "FinTech Solutions", status: "qualified", source: "website" },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const agencyId = searchParams.get("agencyId")
  const status = searchParams.get("status")
  const limit = parseInt(searchParams.get("limit") || "50")

  if (IS_DEMO) {
    let leads = DEMO_LEADS
    if (status && status !== "all") leads = leads.filter(l => l.status === status)
    return NextResponse.json({ leads: leads.slice(0, limit) })
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    let query = supabase.from("leads").select("*").eq("agency_id", agencyId!).limit(limit)
    if (status && status !== "all") query = query.eq("status", status)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ leads: data || [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agencyId, leads } = body

    if (IS_DEMO) {
      return NextResponse.json({ success: true, inserted: leads?.length || 1, demo: true })
    }

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const records = (Array.isArray(leads) ? leads : [body]).map((l: Record<string, unknown>) => ({
      ...l,
      agency_id: agencyId,
    }))

    const { data, error } = await supabase.from("leads").insert(records).select()
    if (error) throw error
    return NextResponse.json({ success: true, inserted: data?.length, leads: data })
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
