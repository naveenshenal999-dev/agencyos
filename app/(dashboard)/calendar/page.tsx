"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { demoPosts, demoClients } from "@/lib/demo-data"
import type { Post } from "@/types"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  linkedin: "bg-blue-600/10 text-blue-500 border-blue-600/20",
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-400",
  pending_approval: "bg-orange-500/10 text-orange-400",
  approved: "bg-blue-500/10 text-blue-400",
  scheduled: "bg-purple-500/10 text-purple-400",
  published: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  function getPostsForDay(day: number): (Post & { clientName: string })[] {
    const date = new Date(year, month, day)
    return demoPosts
      .filter(p => {
        const d = new Date(p.scheduled_at || p.published_at || p.created_at)
        return d.getFullYear() === date.getFullYear() &&
               d.getMonth() === date.getMonth() &&
               d.getDate() === date.getDate()
      })
      .map(p => ({
        ...p,
        clientName: demoClients.find(c => c.id === p.client_id)?.name || "Unknown",
      }))
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const upcomingPosts = demoPosts
    .filter(p => p.scheduled_at && new Date(p.scheduled_at) > today)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Content Calendar" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{monthName}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 border-border/60" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-border/60 text-xs" onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}>
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-border/60" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border/40">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7">
                {blanks.map(i => (
                  <div key={`blank-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border/20 bg-muted/5" />
                ))}
                {days.map(day => {
                  const posts = getPostsForDay(day)
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-1.5 border-b border-r border-border/20 ${isToday ? "bg-violet-500/5" : "hover:bg-muted/20"} transition-colors`}
                    >
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-violet-600 text-white" : "text-muted-foreground"}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {posts.slice(0, 2).map(post => (
                          <div
                            key={post.id}
                            className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium ${PLATFORM_COLORS[post.platform] || ""}`}
                          >
                            {post.clientName.split(" ")[0]}
                          </div>
                        ))}
                        {posts.length > 2 && (
                          <div className="text-[9px] text-muted-foreground px-1">+{posts.length - 2}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Upcoming posts sidebar */}
          <div className="w-full lg:w-72 space-y-4">
            <h3 className="font-semibold text-sm">Scheduled Posts</h3>
            {upcomingPosts.length === 0 ? (
              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming scheduled posts</p>
                </CardContent>
              </Card>
            ) : (
              upcomingPosts.map(post => {
                const clientName = demoClients.find(c => c.id === post.client_id)?.name || "Unknown"
                const date = new Date(post.scheduled_at!)
                return (
                  <Card key={post.id} className="border-border/60 bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 capitalize ${PLATFORM_COLORS[post.platform]}`}>
                          {post.platform.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{clientName}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{post.caption?.slice(0, 60)}...</div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                            <Badge className={`text-[9px] h-4 px-1 capitalize ${STATUS_COLORS[post.status]}`}>{post.status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}

            <div className="pt-2">
              <h3 className="font-semibold text-sm mb-3">Platform Legend</h3>
              <div className="space-y-2">
                {[
                  { label: "Instagram", color: "bg-pink-500" },
                  { label: "Facebook", color: "bg-blue-500" },
                  { label: "LinkedIn", color: "bg-blue-600" },
                  { label: "Twitter / X", color: "bg-sky-500" },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
