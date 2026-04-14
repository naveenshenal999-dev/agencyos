import { Header } from "@/components/layout/header"
import { ClientTable } from "@/components/clients/client-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClientForm } from "@/components/clients/client-form"
import { Plus, Users } from "lucide-react"
import { IS_DEMO, demoClients } from "@/lib/demo-data"

export default async function ClientsPage() {
  let clients: typeof demoClients = []
  let agencyId = ""
  let userProfile: { email?: string; full_name?: string } = {}

  if (IS_DEMO) {
    clients = demoClients
    agencyId = "demo-agency-1"
    userProfile = { email: "demo@agencyos.com" }
  } else {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase
      .from("users").select("*, agencies(*)").eq("id", user!.id).single()
    agencyId = userData?.agency_id || ""
    userProfile = { email: user?.email, full_name: userData?.full_name }
    if (agencyId) {
      const { data } = await supabase
        .from("clients").select("*").eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
      clients = data || []
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Clients" user={userProfile} />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">All Clients</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""} managed</p>
          </div>
          <Dialog>
            <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium h-8 px-3 transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <ClientForm agencyId={agencyId} />
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Add your first client to start managing their social media, analytics, and content.
            </p>
            <Dialog>
              <DialogTrigger className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium h-9 px-4 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                Add First Client
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <ClientForm agencyId={agencyId} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <ClientTable clients={clients} />
        )}
      </div>
    </div>
  )
}
