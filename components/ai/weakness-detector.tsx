"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AlertTriangle, ArrowRight, Brain, Loader2, Zap } from "lucide-react"

interface Weakness {
  weakness: string
  impact: string
  action: string
}

interface WeaknessDetectorProps {
  clientName?: string
  industry?: string
  metrics?: {
    avgEngagement?: number
    totalFollowers?: number
  }
  seoScore?: number
  platforms?: string[]
  brandVoice?: string
}

export function WeaknessDetector({
  clientName,
  industry,
  metrics,
  seoScore,
  platforms,
  brandVoice,
}: WeaknessDetectorProps) {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function analyze() {
    setIsLoading(true)
    setWeaknesses([])
    try {
      const res = await fetch("/api/ai/weakness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, industry, metrics, seoScore, platforms, brandVoice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      setWeaknesses(data.weaknesses)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Analysis failed"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const priorityColors = ["border-red-500/40 bg-red-500/5", "border-orange-500/40 bg-orange-500/5", "border-yellow-500/40 bg-yellow-500/5", "border-blue-500/40 bg-blue-500/5", "border-slate-500/40 bg-slate-500/5"]
  const priorityLabels = ["Critical", "High", "Medium", "Low", "Minor"]
  const priorityBadgeColors = ["bg-red-500/10 text-red-400 border-red-500/20", "bg-orange-500/10 text-orange-400 border-orange-500/20", "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", "bg-blue-500/10 text-blue-400 border-blue-500/20", "bg-slate-500/10 text-slate-400 border-slate-500/20"]

  return (
    <div className="space-y-4">
      <Button
        onClick={analyze}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing account...</>
        ) : (
          <><Brain className="w-4 h-4 mr-2" /> Detect Top 5 Weaknesses</>
        )}
      </Button>

      {weaknesses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">Weakness Analysis</span>
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
              {weaknesses.length} found
            </Badge>
          </div>
          {weaknesses.map((w, i) => (
            <Card key={i} className={`border ${priorityColors[i]}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="font-medium text-sm">{w.weakness}</p>
                  </div>
                  <Badge className={`text-[10px] flex-shrink-0 ${priorityBadgeColors[i]}`}>
                    {priorityLabels[i]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-7">{w.impact}</p>
                <div className="flex items-start gap-2 pl-7 rounded-lg bg-green-500/10 border border-green-500/20 p-2">
                  <Zap className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-300">
                    <span className="font-medium">Action: </span>{w.action}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
