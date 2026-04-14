import { cookies } from "next/headers"
import { IS_DEMO, demoClients, demoPosts, demoMetrics } from "@/lib/demo-data"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Users,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  UserSquare,
} from "lucide-react"
import { formatRelativeTime, getHealthScoreColor, getHealthScoreBg, generateClientColor } from "@/lib/utils"
import type { Client, Post } from "@/types"

async function getDashboardData(agencyId: string) {
  const supabase = await createClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [clientsRes, postsThisMonthRes, recentPostsRes, metricsRes] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agencyId).order("created_at", { ascending: false }),
    supabase.from("posts").select("*").gte("created_at", firstOfMonth)
      .in("client_id", (await supabase.from("clients").select("id").eq("agency_id", agencyId)).data?.map(c => c.id) || []),
    supabase.from("posts").select("*, clients(name, id)").order("created_at", { ascending: false }).limit(5),
    supabase.from("metrics").select("*")
      .in("client_id", (await supabase.from("clients").select("id").eq("agency_id", agencyId)).data?.map(c => c.id) || []),
  ])

  const clients = clientsRes.data || []
  const postsThisMonth = postsThisMonthRes.data || []
  const recentPosts = recentPostsRes.data || []
  const metrics = metricsRes.data || []

  const avgEngagement = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + Number(m.engagement_rate), 0) / metrics.length
    : 0

  const clientsNeedingAttention = clients.filter((c: Client) => c.health_score < 50)

  return {
    totalClients: clients.length,
    postsThisMonth: postsThisMonth.length,
    avgEngagement: avgEngagement.toFixed(1),
    clientsNeedingAttention: clientsNeedingAttention.slice(0, 5),
    recentPosts: recentPosts.slice(0, 5),
    recentClients: clients.slice(0, 5),
    pendingApprovals: postsThisMonth.filter((p: Post) => p.status === "pending_approval").length,
    scheduledPosts: postsThisMonth.filter((p: Post) => p.status === "scheduled").length,
  }
}

export default async function DashboardPage() {
  let userProfile: { email?: string; full_name?: string }
  let data: {
    totalClients: number
    postsThisMonth: number
    avgEngagement: string
    clientsNeedingAttention: Client[]
    recentPosts: (Post & { clients?: { name: string; id: string } })[]
    recentClients: Client[]
    pendingApprovals: number
    scheduledPosts: number
  }

  if (IS_DEMO) {
    const cookieStore = await cookies()
    const raw = cookieStore.get("demo_session")?.value
    let sessionEmail = "demo@agencyos.com"
    let sessionName: string | undefined
    if (raw) {
      try { const p = JSON.parse(raw); sessionEmail = p.email || sessionEmail; sessionName = p.name } catch {}
    }
    userProfile = { email: sessionEmail, full_name: sessionName }
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const postsThisMonth = demoPosts.filter(p => new Date(p.created_at) >= firstOfMonth)
    const avgEng = demoMetrics.length > 0
      ? (demoMetrics.reduce((s, m) => s + Number(m.engagement_rate), 0) / demoMetrics.length).toFixed(1)
      : "0.0"
    data = {
      totalClients: demoClients.length,
      postsThisMonth: postsThisMonth.length,
      avgEngagement: avgEng,
      clientsNeedingAttention: demoClients.filter(c => c.health_score < 50),
      recentPosts: demoPosts.slice(0, 5).map(p => ({
        ...p,
        clients: { name: demoClients.find(c => c.id === p.client_id)?.name || "", id: p.client_id },
      })),
      recentClients: demoClients.slice(0, 5),
      pendingApprovals: demoPosts.filter(p => p.status === "pending_approval").length,
      scheduledPosts: demoPosts.filter(p => p.status === "scheduled").length,
    }
  } else {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from("users").select("*, agencies(*)").eq("id", user!.id).single()
    const agencyId = userData?.agency_id
    userProfile = { email: user?.email, full_name: userData?.full_name }
    data = {
      totalClients: 0, postsThisMonth: 0, avgEngagement: "0.0",
      clientsNeedingAttention: [], recentPosts: [], recentClients: [],
      pendingApprovals: 0, scheduledPosts: 0,
    }
    if (agencyId) data = await getDashboardData(agencyId)
  }

  const statsCards = [
    {
      title: "Total Clients",
      value: data.totalClients,
      description: "Active client accounts",
      icon: UserSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      href: "/clients",
    },
    {
      title: "Posts This Month",
      value: data.postsThisMonth,
      description: "Across all clients",
      icon: MessageSquare,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      href: "/calendar",
    },
    {
      title: "Avg. Engagement",
      value: `${data.avgEngagement}%`,
      description: "Across all platforms",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      href: "/clients",
    },
    {
      title: "Pending Approvals",
      value: data.pendingApprovals,
      description: "Posts awaiting review",
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      href: "/clients",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" user={userProfile} />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-xl bg-gradient-to-br from-violet-950/50 via-purple-950/30 to-indigo-950/50 border border-violet-500/20 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Welcome back, {userProfile?.full_name?.split(" ")[0] || "there"}! 👋
              </h2>
              <p className="text-muted-foreground text-sm">
                Here&apos;s what&apos;s happening across your agency today.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/clients/new">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-0">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Client
                </Button>
              </Link>
              <Link href="/design">
                <Button size="sm" variant="outline" className="border-border/60">
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Create Post
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="border-border/60 bg-card/50 hover:bg-card transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">{stat.description}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients Needing Attention */}
          <Card className="lg:col-span-1 border-border/60 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Needs Attention
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Clients with low health scores</CardDescription>
                </div>
                <Link href="/clients">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.clientsNeedingAttention.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium">All clients healthy!</p>
                  <p className="text-xs text-muted-foreground">No clients need attention right now.</p>
                </div>
              ) : (
                data.clientsNeedingAttention.map((client: Client) => (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: generateClientColor(client.name) }}
                      >
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{client.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Progress value={client.health_score} className="h-1 flex-1" />
                          <span className={`text-xs ${getHealthScoreColor(client.health_score)}`}>
                            {client.health_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
              {data.clientsNeedingAttention.length === 0 && data.recentClients.length > 0 && (
                <div className="space-y-2">
                  {data.recentClients.slice(0, 3).map((client: Client) => (
                    <Link key={client.id} href={`/clients/${client.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: generateClientColor(client.name) }}
                        >
                          {client.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{client.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Progress value={client.health_score} className="h-1 flex-1" />
                            <span className={`text-xs ${getHealthScoreColor(client.health_score)}`}>
                              {client.health_score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {data.totalClients === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No clients yet</p>
                  <p className="text-xs text-muted-foreground mb-3">Add your first client to get started</p>
                  <Link href="/clients/new">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-0">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Client
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-border/60 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Latest posts across all clients</CardDescription>
                </div>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">View calendar</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No posts yet</p>
                  <p className="text-xs text-muted-foreground mb-3">Create your first post to get started</p>
                  <Link href="/design">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-0">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Create Post
                    </Button>
                  </Link>
                </div>
              ) : (
                data.recentPosts.map((post) => {
                  const statusColors: Record<string, string> = {
                    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
                    pending_approval: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                    approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                    published: "bg-green-500/10 text-green-400 border-green-500/20",
                    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
                  }
                  return (
                    <div key={post.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: generateClientColor((post.clients as { name: string })?.name || "") }}
                      >
                        {((post.clients as { name: string })?.name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">{(post.clients as { name: string })?.name}</span>
                          <Badge className={`text-xs capitalize ${statusColors[post.status] || statusColors.draft}`}>
                            {post.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize border-border/40">
                            {post.platform}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{post.caption || "No caption"}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{formatRelativeTime(post.created_at)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Add Client", href: "/clients", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Create Post", href: "/design", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "View Calendar", href: "/calendar", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "Manage Team", href: "/team", icon: Users, color: "text-orange-400", bg: "bg-orange-500/10" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col gap-1.5 text-xs border-border/60 hover:bg-muted/50 font-normal"
                  >
                    <div className={`w-7 h-7 rounded-lg ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
                    </div>
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
