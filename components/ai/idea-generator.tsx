"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Brain, Lightbulb, Loader2, Copy, Check } from "lucide-react"

interface PostIdea {
  title: string
  concept: string
  platform: string
  format: string
  hook: string
}

interface IdeaGeneratorProps {
  clientName?: string
  industry?: string
  targetAudience?: string
  brandVoice?: string
  platforms?: string[]
  onSelectIdea?: (idea: PostIdea) => void
}

export function IdeaGenerator({
  clientName,
  industry,
  targetAudience,
  brandVoice,
  platforms,
  onSelectIdea,
}: IdeaGeneratorProps) {
  const [ideas, setIdeas] = useState<PostIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function generate() {
    setIsLoading(true)
    setIdeas([])
    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, industry, targetAudience, brandVoice, platforms }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setIdeas(data.ideas)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Generation failed"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const formatColors: Record<string, string> = {
    Reel: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Carousel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Story: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Static: "bg-green-500/10 text-green-400 border-green-500/20",
    Thread: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={generate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating ideas...</>
        ) : (
          <><Lightbulb className="w-4 h-4 mr-2" /> Generate 10 Post Ideas</>
        )}
      </Button>

      {ideas.length > 0 && (
        <>
          <Separator />
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">Post Ideas</span>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
              {ideas.length} ideas
            </Badge>
          </div>
          <div className="space-y-3">
            {ideas.map((idea, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="font-medium text-sm">{idea.title}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge className={`text-[10px] ${formatColors[idea.format] || "bg-muted text-muted-foreground"}`}>
                      {idea.format}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-border/40">
                      {idea.platform}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 pl-7">{idea.concept}</p>
                <div className="pl-7 rounded bg-violet-500/10 border border-violet-500/20 p-2">
                  <p className="text-xs text-violet-300">
                    <span className="font-medium">Hook: </span>"{idea.hook}"
                  </p>
                </div>
                {onSelectIdea && (
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0"
                      onClick={() => { onSelectIdea(idea); toast.success("Idea selected!") }}
                    >
                      Use this idea
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
