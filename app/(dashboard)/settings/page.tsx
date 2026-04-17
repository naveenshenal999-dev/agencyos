"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  User, Building2, Bell, Lock, CreditCard,
  Mail, Globe, Palette, Shield, Check, Loader2
} from "lucide-react"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ name: "Info Markorastudio", email: "info@markorastudio.com", title: "Agency Owner" })
  const [agency, setAgency] = useState({ name: "Marko Ra Studio", website: "markorastudio.com", timezone: "UTC+2" })
  const [notifications, setNotifications] = useState({
    postApprovals: true, newLeads: true, campaignResults: true, weeklyReport: false, clientActivity: true,
  })
  const [email, setEmail] = useState({ fromName: "Marko Ra Studio", fromEmail: "info@markorastudio.com", signature: "Best regards,\nInfo @ Marko Ra Studio\nmarkorastudio.com" })

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success("Settings saved")
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "agency", label: "Agency", icon: Building2 },
    { id: "email", label: "Email Sending", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">

          {/* Sidebar */}
          <div className="w-full lg:w-52 flex-shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full text-left flex-shrink-0 ${
                    activeSection === s.id
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">

            {activeSection === "profile" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xl font-bold">
                        {profile.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="border-border/60">Change photo</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Job Title</Label>
                      <Input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                  </div>
                  <Button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white border-0" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "agency" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Agency Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Agency Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={agency.name} onChange={e => setAgency(a => ({ ...a, name: e.target.value }))} className="pl-9 bg-card/50 border-border/60" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={agency.website} onChange={e => setAgency(a => ({ ...a, website: e.target.value }))} className="pl-9 bg-card/50 border-border/60" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Timezone</Label>
                      <Input value={agency.timezone} onChange={e => setAgency(a => ({ ...a, timezone: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Plan</Label>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Pro</Badge>
                      <span className="text-sm text-muted-foreground">$79/month · Renews May 1, 2026</span>
                    </div>
                  </div>
                  <Button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white border-0" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Save Agency
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "email" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Email Sending</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-green-400">Connected: Resend · Sends from <strong>info@markorastudio.com</strong></span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Sender Name</Label>
                      <Input value={email.fromName} onChange={e => setEmail(em => ({ ...em, fromName: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>From Email</Label>
                      <Input value={email.fromEmail} onChange={e => setEmail(em => ({ ...em, fromEmail: e.target.value }))} className="bg-card/50 border-border/60" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Signature</Label>
                    <textarea
                      rows={4}
                      value={email.signature}
                      onChange={e => setEmail(em => ({ ...em, signature: e.target.value }))}
                      className="w-full rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily send limit</span>
                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">30 emails/day</Badge>
                  </div>
                  <Button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white border-0" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "postApprovals", label: "Post approvals needed", desc: "When a post is pending your review" },
                    { key: "newLeads", label: "New leads added", desc: "When leads are imported or added" },
                    { key: "campaignResults", label: "Campaign results", desc: "Daily summary of email campaign performance" },
                    { key: "weeklyReport", label: "Weekly performance report", desc: "Summary sent every Monday" },
                    { key: "clientActivity", label: "Client activity", desc: "When clients interact with the portal" },
                  ].map((item, i) => (
                    <div key={item.key}>
                      {i > 0 && <Separator className="mb-4 bg-border/40" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Change Password</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-card/50 border-border/60" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>New Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-card/50 border-border/60" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Confirm New Password</Label>
                        <Input type="password" placeholder="••••••••" className="bg-card/50 border-border/60" />
                      </div>
                      <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0">Update Password</Button>
                    </div>
                  </div>
                  <Separator className="bg-border/40" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Two-factor authentication</div>
                      <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline" size="sm" className="border-border/60">
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "billing" && (
              <Card className="border-border/60 bg-card/50">
                <CardHeader><CardTitle className="text-base">Billing & Plan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Pro Plan</span>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Active</Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">$79<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {["5 team members", "Up to 25 clients", "All AI features", "Advanced analytics", "Priority support"].map(f => (
                        <li key={f} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-400" />{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="border-border/60 flex-1">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0 flex-1">
                      Upgrade to Agency
                    </Button>
                  </div>
                  <Separator className="bg-border/40" />
                  <div>
                    <div className="text-sm font-medium mb-2">Billing History</div>
                    {[
                      { date: "Apr 1, 2026", amount: "$79.00", status: "Paid" },
                      { date: "Mar 1, 2026", amount: "$79.00", status: "Paid" },
                      { date: "Feb 1, 2026", amount: "$79.00", status: "Paid" },
                    ].map(inv => (
                      <div key={inv.date} className="flex items-center justify-between py-2 text-sm border-b border-border/30 last:border-0">
                        <span className="text-muted-foreground">{inv.date}</span>
                        <span>{inv.amount}</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">{inv.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
