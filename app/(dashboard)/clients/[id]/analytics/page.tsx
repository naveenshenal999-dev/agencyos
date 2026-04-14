import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Users, Eye, Heart } from "lucide-react"
import { EngagementChart } from "@/components/analytics/engagement-chart"
import { PlatformComparison } from "@/components/analytics/platform-comparison"
import { MetricsCard } from "@/components/analytics/metrics-card"
import { formatNumber } from "@/lib/utils"

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from("users").select("*").eq("id", user!.id).single()

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single()
  if (!client) notFound()

  const { data: metrics } = await supabase
    .from("metrics")
    .select("*")
    .eq("client_id", id)
    .order("recorded_at", { ascending: true })

  const { data: topPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("client_id", id)
    .eq("status", "published")
    .order("reach", { ascending: false })
    .limit(5)

  const metricsData = metrics || []
  const latestMetrics = metricsData.slice(-4)

  const totalFollowers = latestMetrics.reduce((s, m) => s + m.followers, 0)
  const avgEngagement = latestMetrics.length > 0
    ? (latestMetrics.reduce((s, m) => s + Number(m.engagement_rate), 0) / latestMetrics.length).toFixed(1)
    : "0.0"
  const totalReach = latestMetrics.reduce((s, m) => s + m.reach, 0)
  const totalImpressions = latestMetrics.reduce((s, m) => s + m.impressions, 0)

  const userProfile = { email: user?.email, full_name: userData?.full_name }

  // Prepare chart data - group by date
  type ChartRow = { date: string; instagram: number; facebook: number; linkedin: number; twitter: number }
  const chartData = metricsData.reduce((acc: Record<string, ChartRow>, m) => {
    const date = new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    if (!acc[date]) acc[date] = { date, instagram: 0, facebook: 0, linkedin: 0, twitter: 0 }
    ;(acc[date] as Record<string, number | string>)[m.platform] = Number(m.engagement_rate)
    return acc
  }, {})

  const engagementChartData = Object.values(chartData)

  // Platform comparison data
  const platformData = ["instagram", "facebook", "linkedin", "twitter"].map(platform => {
    const platformMetrics = latestMetrics.filter(m => m.platform === platform)
    return {
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      followers: platformMetrics.reduce((s, m) => s + m.followers, 0),
      engagement: platformMetrics.length > 0
        ? Number((platformMetrics.reduce((s, m) => s + Number(m.engagement_rate), 0) / platformMetrics.length).toFixed(1))
        : 0,
      reach: platformMetrics.reduce((s, m) => s + m.reach, 0),
    }
  }).filter(p => p.followers > 0 || p.reach > 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={`${client.name} — Analytics`} user={userProfile} />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href={`/clients/${id}`}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          </Link>
          <h2 className="text-lg font-semibold">Analytics</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Followers"
            value={formatNumber(totalFollowers)}
            icon={Users}
            color="text-blue-400"
            bg="bg-blue-500/10"
            change="+12%"
            changeType="positive"
          />
          <MetricsCard
            title="Avg Engagement"
            value={`${avgEngagement}%`}
            icon={TrendingUp}
            color="text-green-400"
            bg="bg-green-500/10"
            change="+0.3%"
            changeType="positive"
          />
          <MetricsCard
            title="Total Reach"
            value={formatNumber(totalReach)}
            icon={Eye}
            color="text-purple-400"
            bg="bg-purple-500/10"
            change="+8%"
            changeType="positive"
          />
          <MetricsCard
            title="Impressions"
            value={formatNumber(totalImpressions)}
            icon={Heart}
            color="text-orange-400"
            bg="bg-orange-500/10"
            change="+15%"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Chart */}
          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">Engagement Rate Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {engagementChartData.length > 0 ? (
                <EngagementChart data={engagementChartData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No engagement data yet. Add metrics to see charts.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Comparison */}
          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">Platform Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {platformData.length > 0 ? (
                <PlatformComparison data={platformData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No platform data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Posts */}
        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {!topPosts || topPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No published posts with analytics data yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topPosts.map((post, i) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{post.caption || "No caption"}</p>
                      <Badge variant="outline" className="text-[10px] border-border/40 capitalize mt-1">{post.platform}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(post.reach)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
