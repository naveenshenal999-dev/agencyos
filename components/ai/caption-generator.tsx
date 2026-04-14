"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Brain, Copy, Check, Loader2, Sparkles } from "lucide-react"

interface CaptionGeneratorProps {
  clientId?: string
  clientName?: string
  brandVoice?: string
  targetAudience?: string
  onSelectCaption?: (caption: string) => void
}

export function CaptionGenerator({
  clientId,
  clientName,
  brandVoice,
  targetAudience,
  onSelectCaption,
}: CaptionGeneratorProps) {
  const [platform, setPlatform] = useState("instagram")
  const [topic, setTopic] = useState("")
  const [captions, setCaptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function generate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your post")
      return
    }
    setIsLoading(true)
    setCaptions([])
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, brandVoice, targetAudience, clientName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate")
      setCaptions(data.captions)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Generation failed"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  async function copyCaption(caption: string, index: number) {
    await navigator.clipboard.writeText(caption)
    setCopiedIndex(index)
    toast.success("Caption copied!")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Post Topic *</Label>
          <Input
            id="topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. New product launch, summer sale, behind the scenes..."
            className="border-border/60"
            onKeyDown={e => e.key === "Enter" && generate()}
          />
        </div>

        {(brandVoice || targetAudience) && (
          <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 space-y-1">
            {brandVoice && (
              <p className="text-xs text-violet-300">
                <span className="font-medium">Brand voice:</span> {brandVoice}
              </p>
            )}
            {targetAudience && (
              <p className="text-xs text-violet-300">
                <span className="font-medium">Audience:</span> {targetAudience}
              </p>
            )}
          </div>
        )}

        <Button
          onClick={generate}
          disabled={isLoading || !topic.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating captions...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate 5 Captions</>
          )}
        </Button>
      </div>

      {/* Results */}
      {captions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">Generated Captions</span>
              <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                {captions.length} variations
              </Badge>
            </div>
            {captions.map((caption, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs border-border/40">
                    Option {i + 1}
                  </Badge>
                  <div className="flex gap-2">
                    {onSelectCaption && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0"
                        onClick={() => { onSelectCaption(caption); toast.success("Caption applied!") }}
                      >
                        Use this
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-border/60"
                      onClick={() => copyCaption(caption, i)}
                    >
                      {copiedIndex === i ? (
                        <><Check className="w-3 h-3 mr-1 text-green-400" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{caption}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
