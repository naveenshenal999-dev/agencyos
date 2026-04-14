"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Plus,
  Search,
  Upload,
  Mail,
  Building2,
  Phone,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react"
import type { Lead } from "@/types"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  qualified: "bg-green-500/10 text-green-400 border-green-500/20",
  converted: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  unsubscribed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  new: Clock,
  contacted: Mail,
  qualified: Star,
  converted: CheckCircle2,
  unsubscribed: XCircle,
}

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-blue-500/10 text-blue-400",
  referral: "bg-green-500/10 text-green-400",
  linkedin: "bg-sky-500/10 text-sky-400",
  cold: "bg-orange-500/10 text-orange-400",
  manual: "bg-slate-500/10 text-slate-400",
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    company: "",
    phone: "",
    website: "",
    source: "manual",
    notes: "",
  })

  useEffect(() => {
    fetchLeads()
  }, [statusFilter])

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: "100" })
      const res = await fetch(`/api/email/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch {
      toast.error("Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/email/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success("Lead added successfully")
      setShowAddModal(false)
      setForm({ email: "", full_name: "", company: "", phone: "", website: "", source: "manual", notes: "" })
      fetchLeads()
    } catch (err) {
      toast.error(String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""))
    const records = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/"/g, ""))
      const rec: Record<string, string> = {}
      headers.forEach((h, i) => { rec[h] = vals[i] || "" })
      return {
        email: rec.email || rec["e-mail"] || "",
        full_name: rec.full_name || rec.name || rec.fullname || "",
        company: rec.company || rec.organization || "",
        phone: rec.phone || rec.telephone || "",
        website: rec.website || rec.url || "",
        source: rec.source || "import",
        notes: rec.notes || "",
      }
    }).filter(r => r.email)

    if (records.length === 0) {
      toast.error("No valid emails found in CSV")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/email/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: records }),
      })
      const data = await res.json()
      toast.success(`Imported ${data.inserted || records.length} leads`)
      setShowImportModal(false)
      fetchLeads()
    } catch (err) {
      toast.error(String(err))
    } finally {
      setSaving(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const filtered = leads.filter(lead => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      lead.email.toLowerCase().includes(q) ||
      lead.full_name?.toLowerCase().includes(q) ||
      lead.company?.toLowerCase().includes(q)
    )
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    converted: leads.filter(l => l.status === "converted").length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Leads" user={undefined} />
      <div className="flex-1 p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "New", value: stats.new, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Qualified", value: stats.qualified, icon: Star, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Converted", value: stats.converted, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map(stat => (
            <Card key={stat.label} className="border-border/60 bg-card/50">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-border/60"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[140px] bg-card/50 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-border/60"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white border-0"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No leads found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add your first lead or import a CSV file</p>
              <Button
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white border-0"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name / Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map(lead => {
                    const StatusIcon = STATUS_ICONS[lead.status] || Clock
                    return (
                      <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(lead.full_name || lead.email).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{lead.full_name || "—"}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.company ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building2 className="w-3.5 h-3.5" />
                              {lead.company}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${SOURCE_COLORS[lead.source] || SOURCE_COLORS.manual}`}>
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`capitalize text-xs ${STATUS_COLORS[lead.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
                Showing {filtered.length} of {leads.length} leads
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLead} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="lead@company.com"
                    required
                    className="pl-9"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    className="pl-9"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1 555 0100"
                    className="pl-9"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://company.com"
                    className="pl-9"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => v && setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional info about this lead..."
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white border-0" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mb-3">
                Required columns: <code className="bg-muted px-1 rounded">email</code>
                <br />
                Optional: <code className="bg-muted px-1 rounded">full_name, company, phone, website, source</code>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportCSV}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Select CSV File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Example: <code>email,full_name,company</code>
              <br />
              <code>john@example.com,John Doe,Acme</code>
            </p>
            <Button variant="outline" className="w-full" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
