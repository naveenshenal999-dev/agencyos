import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateClientColor, getHealthScoreColor, formatDate } from "@/lib/utils"
import { InstagramIcon, FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/platform-icons"
import {
  Globe, Edit,
  BarChart3, FileText, Search, MessageSquare, TrendingUp,
  Users, ArrowLeft, ExternalLink
} from "lucide-react"
import type { Client, Post, Metrics } from "@/types"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from("users").select("*").eq("id", user!.id).single()

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single()
  if (!client) notFound()

  const [postsRes, metricsRes] = await Promise.all([
    supabase.from("posts").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(6),
    supabase.from("metrics").select("*").eq("client_id", id).order("recorded_at", { ascending: false }).limit(4),
  ])

  const posts: Post[] = postsRes.data || []
  const metrics: Metrics[] = metricsRes.data || []

  const userProfile = { email: user?.email, full_name: userData?.full_name }
  const clientColor = generateClientColor(client.name)

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }

  const postStatusColors: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    pending_approval: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    published: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={client.name} user={userProfile} />
      <div className="flex-1 p-6 space-y-6">
        {/* Back button */}
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Clients
          </Button>
        </Link>

        {/* Client Header */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: clientColor }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <Badge className={`capitalize ${statusColors[client.status]}`}>{client.status}</Badge>
                {client.industry && <Badge variant="outline" className="border-border/40">{client.industry}</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    {client.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {client.instagram && (
                  <span className="flex items-center gap-1">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                    {client.instagram}
                  </span>
                )}
                {client.facebook && (
                  <span className="flex items-center gap-1">
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
                    {client.facebook}
                  </span>
                )}
                {client.linkedin && (
                  <span className="flex items-center gap-1">
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" />
                    {client.linkedin}
                  </span>
                )}
                {client.twitter && (
                  <span className="flex items-center gap-1">
                    <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                    {client.twitter}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Health Score</span>
                    <span className={`text-xs font-bold ${getHealthScoreColor(client.health_score)}`}>
                      {client.health_score}%
                    </span>
                  </div>
                  <Progress value={client.health_score} className="h-2" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/clients/${id}/posts`}>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-0">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Posts
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="border-border/60">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/40 w-fit">
          {[
            { label: "Overview", href: `/clients/${id}` },
            { label: "Posts", href: `/clients/${id}/posts` },
            { label: "Analytics", href: `/clients/${id}/analytics` },
            { label: "SEO", href: `/clients/${id}/seo` },
            { label: "Report", href: `/clients/${id}/report` },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="hidden">

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Posts", value: posts.length, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Avg Engagement", value: metrics.length > 0 ? `${(metrics.reduce((s,m)=>s+Number(m.engagement_rate),0)/metrics.length).toFixed(1)}%` : "—", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Total Reach", value: metrics.reduce((s,m)=>s+m.reach,0).toLocaleString() || "—", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
                { label: "Health Score", value: `${client.health_score}%`, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10" },
              ].map(metric => (
                <Card key={metric.label} className="border-border/60 bg-card/50">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center mb-3`}>
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                    <div className="text-xl font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{metric.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Posts</CardTitle>
                    <Link href={`/clients/${id}/posts`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {posts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No posts yet</p>
                  ) : (
                    posts.slice(0, 4).map(post => (
                      <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{post.caption || "No caption"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-[10px] border-border/40 capitalize">{post.platform}</Badge>
                            <Badge className={`text-[10px] capitalize ${postStatusColors[post.status]}`}>{post.status.replace("_"," ")}</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Client Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.target_audience && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Target Audience</h4>
                      <p className="text-sm">{client.target_audience}</p>
                    </div>
                  )}
                  {client.brand_voice && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Brand Voice</h4>
                      <p className="text-sm">{client.brand_voice}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Client Since</h4>
                    <p className="text-sm">{formatDate(client.created_at)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link href={`/clients/${id}/analytics`}>
                      <Button variant="outline" size="sm" className="w-full border-border/60 text-xs">
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href={`/clients/${id}/seo`}>
                      <Button variant="outline" size="sm" className="w-full border-border/60 text-xs">
                        <Search className="w-3.5 h-3.5 mr-1.5" />
                        SEO
                      </Button>
                    </Link>
                    <Link href={`/clients/${id}/report`}>
                      <Button variant="outline" size="sm" className="w-full border-border/60 text-xs">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Report
                      </Button>
                    </Link>
                    <a href={`/portal/${id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full border-border/60 text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Portal
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
