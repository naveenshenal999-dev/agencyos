"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Mail, Send, Users, CheckCircle2, MousePointerClick,
  Play, Loader2, Plus, Zap, TrendingUp, Eye
} from "lucide-react"
import { toast } from "sonner"

const DAILY_LIMIT = 30

const demoCampaigns = [
  { id: "c1", name: "Q1 Agency Outreach", subject: "Grow your brand with expert social media management", status: "active", sent: 24, opened: 18, clicked: 7, leads: 42 },
  { id: "c2", name: "SaaS Companies Pitch", subject: "How we helped TechVault 3x their LinkedIn engagement", status: "draft", sent: 0, opened: 0, clicked: 0, leads: 15 },
  { id: "c3", name: "Ecommerce Follow-up", subject: "Still thinking about growing your Instagram?", status: "completed", sent: 30, opened: 22, clicked: 11, leads: 30 },
]

export default function EmailPage() {
  const [campaigns] = useState(demoCampaigns)
  const [showCompose, setShowCompose] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", subject: "", body: "", ctaText: "Book a Free Call", ctaUrl: ""
  })

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0)
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0)
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0

  async function runCampaign(campaignId: string) {
    setRunning(campaignId)
    await new Promise(r => setTimeout(r, 2000))
    toast.success("Campaign batch sent! 30 emails queued.")
    setRunning(null)
  }

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Email Campaigns" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Emails Sent", value: totalSent, icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Open Rate", value: `${openRate}%`, icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Click Rate", value: `${clickRate}%`, icon: MousePointerClick, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Daily Limit", value: `${DAILY_LIMIT}/day`, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
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

        {/* Daily limit bar */}
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Today&apos;s send budget</span>
              <span className="text-sm text-muted-foreground">8 / {DAILY_LIMIT} sent today</span>
            </div>
            <Progress value={(8 / DAILY_LIMIT) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">Resets at midnight · Rate limited to 1 email/sec</p>
          </CardContent>
        </Card>

        {/* Campaigns list */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white border-0"
            size="sm"
            onClick={() => setShowCompose(!showCompose)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Campaign
          </Button>
        </div>

        {/* Compose form */}
        {showCompose && (
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g. Q2 Outreach" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-card/50 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Subject</Label>
                  <Input placeholder="Compelling subject line..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="bg-card/50 border-border/60" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email Body</Label>
                <Textarea
                  placeholder="Hi {first_name},&#10;&#10;I noticed your brand and wanted to reach out..."
                  rows={5}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  className="bg-card/50 border-border/60"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CTA Button Text</Label>
                  <Input placeholder="Book a Free Call" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className="bg-card/50 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label>CTA URL</Label>
                  <Input placeholder="https://calendly.com/..." value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} className="bg-card/50 border-border/60" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border/60" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0" onClick={() => { toast.success("Campaign saved as draft"); setShowCompose(false) }}>
                  Save Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign cards */}
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="border-border/60 bg-card/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{campaign.name}</h3>
                      <Badge className={`text-xs capitalize ${statusColors[campaign.status]}`}>{campaign.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-3">{campaign.subject}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                          <Send className="w-3 h-3" />
                          <span className="text-sm font-bold">{campaign.sent}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-400 mb-0.5">
                          <Eye className="w-3 h-3" />
                          <span className="text-sm font-bold">{campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Open rate</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-violet-400 mb-0.5">
                          <MousePointerClick className="w-3 h-3" />
                          <span className="text-sm font-bold">{campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Click rate</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-xs text-muted-foreground">Leads</div>
                      <div className="text-sm font-bold flex items-center gap-1 text-orange-400">
                        <Users className="w-3 h-3" />
                        {campaign.leads}
                      </div>
                    </div>
                    {campaign.status !== "completed" && (
                      <Button
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white border-0"
                        onClick={() => runCampaign(campaign.id)}
                        disabled={running === campaign.id}
                      >
                        {running === campaign.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Play className="w-3.5 h-3.5 mr-1" />}
                        {running === campaign.id ? "Sending..." : "Run"}
                      </Button>
                    )}
                    {campaign.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}
