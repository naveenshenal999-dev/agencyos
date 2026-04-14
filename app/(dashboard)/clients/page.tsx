import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { ClientTable } from "@/components/clients/client-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClientForm } from "@/components/clients/client-form"
import { Plus, Users } from "lucide-react"

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from("users")
    .select("*, agencies(*)")
    .eq("id", user!.id)
    .single()

  const agencyId = userData?.agency_id

  let clients = []
  if (agencyId) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
    clients = data || []
  }

  const userProfile = { email: user?.email, full_name: userData?.full_name }

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
            <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white border-0" size="sm" />}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Client
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <ClientForm agencyId={agencyId || ""} />
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
              <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white border-0" />}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <ClientForm agencyId={agencyId || ""} />
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
