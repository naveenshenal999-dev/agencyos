import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IS_DEMO, demoTeamMembers, demoAgency } from "@/lib/demo-data"
import { Plus, Mail, Shield, Eye, Edit3, Crown } from "lucide-react"

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  editor: "bg-green-500/10 text-green-400 border-green-500/20",
  viewer: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  editor: Edit3,
  viewer: Eye,
}

const ROLE_PERMS: Record<string, string[]> = {
  owner: ["Full access", "Billing", "Team management", "All features"],
  admin: ["Manage clients", "Approve posts", "View analytics", "Manage team"],
  editor: ["Create posts", "Edit content", "View analytics"],
  viewer: ["View posts", "View analytics", "Read-only"],
}

export default async function TeamPage() {
  const members = IS_DEMO ? demoTeamMembers : []
  const agency = IS_DEMO ? demoAgency : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Team" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{agency?.name || "My Agency"}</h2>
            <p className="text-sm text-muted-foreground">{members.length} team member{members.length !== 1 ? "s" : ""}</p>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Invite Member
          </Button>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map(member => {
            const initials = member.full_name
              ? member.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
              : member.email.slice(0, 2).toUpperCase()
            const RoleIcon = ROLE_ICONS[member.role] || Eye

            return (
              <Card key={member.id} className="border-border/60 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">{member.full_name || "Team Member"}</span>
                        {member.role === "owner" && <Crown className="w-3 h-3 text-violet-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`capitalize text-xs ${ROLE_COLORS[member.role]}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {member.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Since {new Date(member.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(ROLE_PERMS[member.role] || []).map(perm => (
                      <div key={perm} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        {perm}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Invite card */}
          <Card className="border-dashed border-border/40 bg-card/20 hover:bg-card/40 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center min-h-[160px] text-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Invite team member</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">Add editors, admins, or viewers</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles legend */}
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-4">Role Permissions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ROLE_PERMS).map(([role, perms]) => {
                const RoleIcon = ROLE_ICONS[role]
                return (
                  <div key={role}>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 capitalize ${ROLE_COLORS[role]}`}>
                      <RoleIcon className="w-3 h-3" />
                      {role}
                    </div>
                    <ul className="space-y-1">
                      {perms.map(p => (
                        <li key={p} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
