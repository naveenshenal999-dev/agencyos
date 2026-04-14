"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { generateClientColor, getHealthScoreColor } from "@/lib/utils"
import { Globe, ArrowRight } from "lucide-react"
import { InstagramIcon, FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/platform-icons"
import type { Client } from "@/types"

interface ClientCardProps {
  client: Client
}

export function ClientCard({ client }: ClientCardProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }

  const platforms = [
    { handle: client.instagram, icon: InstagramIcon, color: "text-pink-400" },
    { handle: client.facebook, icon: FacebookIcon, color: "text-blue-400" },
    { handle: client.linkedin, icon: LinkedinIcon, color: "text-blue-500" },
    { handle: client.twitter, icon: TwitterIcon, color: "text-sky-400" },
  ].filter(p => p.handle)

  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="border-border/60 bg-card/50 hover:bg-card transition-all hover:shadow-md cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: generateClientColor(client.name) }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{client.name}</h3>
                <Badge className={`text-xs capitalize flex-shrink-0 ${statusColors[client.status]}`}>
                  {client.status}
                </Badge>
              </div>
              {client.industry && (
                <p className="text-xs text-muted-foreground mt-0.5">{client.industry}</p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Health Score</span>
              <span className={`text-xs font-medium ${getHealthScoreColor(client.health_score)}`}>
                {client.health_score}%
              </span>
            </div>
            <Progress value={client.health_score} className="h-1.5" />
          </div>

          <div className="flex items-center gap-2">
            {client.website && (
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {platforms.map((p, i) => (
              <p.icon key={i} className={`w-3.5 h-3.5 ${p.color}`} />
            ))}
            {platforms.length === 0 && !client.website && (
              <span className="text-xs text-muted-foreground">No social profiles</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
