import { cookies } from "next/headers"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { IS_DEMO, demoAgency } from "@/lib/demo-data"

async function getRealUserData() {
  const { createClient } = await import("@/lib/supabase/server")
  const { redirect } = await import("next/navigation")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: userData } = await supabase
    .from("users").select("*, agencies(*)").eq("id", user!.id).single()
  return {
    userProfile: { email: user!.email, full_name: userData?.full_name || user!.user_metadata?.full_name },
    agencyName: userData?.agencies?.name || "My Agency",
    plan: userData?.agencies?.plan || "starter",
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userProfile, agencyName, plan

  if (IS_DEMO) {
    // Read the actual logged-in user from the demo session cookie
    const cookieStore = await cookies()
    const raw = cookieStore.get("demo_session")?.value
    let sessionEmail = "demo@agencyos.com"
    let sessionName = "Demo User"
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        sessionEmail = parsed.email || sessionEmail
        sessionName = parsed.name || sessionName
      } catch {}
    }
    userProfile = { email: sessionEmail, full_name: sessionName }
    agencyName = demoAgency.name
    plan = demoAgency.plan
  } else {
    ;({ userProfile, agencyName, plan } = await getRealUserData())
  }

  return (
    <DashboardShell user={userProfile} agencyName={agencyName} plan={plan}>
      {children}
    </DashboardShell>
  )
}
