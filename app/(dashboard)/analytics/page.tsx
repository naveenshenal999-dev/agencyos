import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IS_DEMO, demoClients, demoMetrics, demoPosts } from "@/lib/demo-data"
import { TrendingUp, Users, Eye, Heart, BarChart3, ArrowUpRight } from "lucide-react"
import { EngagementChart } from "@/components/analytics/engagement-chart"
import { PlatformComparison } from "@/components/analytics/platform-comparison"
import { formatNumber } from "@/lib/utils"
import Link from "next/link"
import type { Metrics } from "@/types"

export default async function AgencyAnalyticsPage() {
  const metrics: Metrics[] = IS_DEMO ? demoMetrics : []
  const clients = IS_DEMO ? demoClients : []
  const posts = IS_DEMO ? demoPosts : []

  const totalFollowers = metrics.reduce((s, m) => s + m.followers, 0)
  const avgEngagement = metrics.length > 0
    ? (metrics.reduce((s, m) => s + Number(m.engagement_rate), 0) / metrics.length).toFixed(1)
    : "0.0"
  const totalReach = metrics.reduce((s, m) => s + m.reach, 0)
  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0)

  // Chart data for agency overview
  const chartData = metrics.reduce((acc: Record<string, { date: string; instagram: number; facebook: number; linkedin: number; twitter: number }>, m) => {
    const date = new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short" })
    if (!acc[date]) acc[date] = { date, instagram: 0, facebook: 0, linkedin: 0, twitter: 0 }
    ;(acc[date] as Record<string, number | string>)[m.platform] = Number(m.engagement_rate)
    return acc
  }, {})
  const engagementChartData = Object.values(chartData)

  const platformData = ["instagram", "facebook", "linkedin", "twitter"].map(platform => {
    const pm = metrics.filter(m => m.platform === platform)
    return {
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      followers: pm.reduce((s, m) => s + m.followers, 0),
      engagement: pm.length > 0 ? Number((pm.reduce((s, m) => s + Number(m.engagement_rate), 0) / pm.length).toFixed(1)) : 0,
      reach: pm.reduce((s, m) => s + m.reach, 0),
    }
  }).filter(p => p.followers > 0)

  // Top performing clients
  const clientPerformance = clients.map(client => {
    const cm = metrics.filter(m => m.client_id === client.id)
    const totalReach = cm.reduce((s, m) => s + m.reach, 0)
    const avgEng = cm.length > 0 ? (cm.reduce((s, m) => s + Number(m.engagement_rate), 0) / cm.length).toFixed(1) : "0.0"
    const postCount = posts.filter(p => p.client_id === client.id).length
    return { ...client, totalReach, avgEngagement: avgEng, postCount }
  }).sort((a, b) => b.health_score - a.health_score)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Analytics" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Agency-wide stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Followers", value: formatNumber(totalFollowers), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Engagement", value: `${avgEngagement}%`, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
            { label: "Total Reach", value: formatNumber(totalReach), icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Total Impressions", value: formatNumber(totalImpressions), icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map(s => (
            <Card key={s.label} className="border-border/60 bg-card/50">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/60 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Engagement Rate by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementChart data={engagementChartData} />
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Platform Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformComparison data={platformData} />
            </CardContent>
          </Card>
        </div>

        {/* Client performance table */}
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Client Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Reach</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Engagement</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Posts</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {clientPerformance.map(client => (
                    <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/clients/${client.id}`} className="flex items-center gap-2 group">
                          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium group-hover:text-violet-400 transition-colors text-sm">{client.name}</div>
                            <div className="text-[10px] text-muted-foreground">{client.industry}</div>
                          </div>
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-violet-400 transition-colors ml-auto" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatNumber(client.totalReach)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge className={`text-xs ${Number(client.avgEngagement) >= 5 ? "bg-green-500/10 text-green-400 border-green-500/20" : Number(client.avgEngagement) >= 3 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {client.avgEngagement}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{client.postCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${client.health_score >= 70 ? "bg-green-400" : client.health_score >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                              style={{ width: `${client.health_score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${client.health_score >= 70 ? "text-green-400" : client.health_score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                            {client.health_score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Connect Supabase to sync real social media metrics via API integrations
        </p>
      </div>
    </div>
  )
}
