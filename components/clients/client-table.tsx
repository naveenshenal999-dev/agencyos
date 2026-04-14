"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateClientColor, getHealthScoreColor } from "@/lib/utils"
import { Search, ArrowUpRight } from "lucide-react"
import { InstagramIcon, FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/platform-icons"
import type { Client } from "@/types"

interface ClientTableProps {
  clients: Client[]
}

export function ClientTable({ clients }: ClientTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")

  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean))) as string[]

  const filtered = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesIndustry = industryFilter === "all" || client.industry === industryFilter
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 border-border/60 bg-muted/30"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-36 h-9 border-border/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        {industries.length > 0 && (
          <Select value={industryFilter} onValueChange={(v) => v && setIndustryFilter(v)}>
            <SelectTrigger className="w-full sm:w-40 h-9 border-border/60">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 bg-muted/30">
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Industry</TableHead>
              <TableHead className="text-xs">Platforms</TableHead>
              <TableHead className="text-xs">Health</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  {clients.length === 0 ? "No clients yet. Add your first client!" : "No clients match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(client => (
                <TableRow key={client.id} className="border-border/40 hover:bg-muted/30 cursor-pointer">
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: generateClientColor(client.name) }}
                      >
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{client.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.industry || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {client.instagram && <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />}
                      {client.facebook && <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />}
                      {client.linkedin && <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" />}
                      {client.twitter && <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />}
                      {!client.instagram && !client.facebook && !client.linkedin && !client.twitter && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={client.health_score} className="h-1.5 flex-1" />
                      <span className={`text-xs font-medium ${getHealthScoreColor(client.health_score)} w-8 text-right`}>
                        {client.health_score}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs capitalize ${statusColors[client.status]}`}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {clients.length} clients
      </div>
    </div>
  )
}
