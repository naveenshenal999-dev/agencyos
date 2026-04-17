"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Bot, Search, Globe, Zap, Mail, CheckCircle2,
  AlertTriangle, Loader2, Play, Copy, Send,
  TrendingDown, Eye, SkipForward, ChevronDown, ChevronUp
} from "lucide-react"
import { toast } from "sonner"

interface AgentResult {
  company: string
  website: string
  description: string
  score: number
  issues: string[]
  subject: string
  body: string
  status: string
}

interface AgentLog {
  step: string
  status: string
  message: string
  result?: AgentResult
  stats?: { analyzed: number; qualified: number; skipped: number }
}

export default function AutomationPage() {
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [results, setResults] = useState<AgentResult[]>([])
  const [expandedResult, setExpandedResult] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    niche: "restaurants",
    location: "London",
    maxCompanies: "10",
    scoreThreshold: "75",
    senderName: "Info",
    agencyName: "Marko Ra Studio",
    autoQueue: false,
  })
  const abortRef = useRef<AbortController | null>(null)

  async function runAgent() {
    setRunning(true)
    setLogs([])
    setResults([])
    setProgress(0)
    setDone(false)

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: form.niche,
          location: form.location,
          maxCompanies: parseInt(form.maxCompanies),
          scoreThreshold: parseInt(form.scoreThreshold),
          senderName: form.senderName,
          agencyName: form.agencyName,
          autoQueue: form.autoQueue,
        }),
        signal: abort.signal,
      })

      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() || ""
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data: AgentLog = JSON.parse(line)
            setLogs(prev => [...prev, data])
            if (data.result) setResults(prev => [...prev, data.result!])
            if (data.step === "analyze") setProgress(p => Math.min(p + 10, 90))
            if (data.step === "done") { setProgress(100); setDone(true) }
          } catch { /* skip malformed line */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Agent error: " + String(err))
    } finally {
      setRunning(false)
    }
  }

  function stopAgent() {
    abortRef.current?.abort()
    setRunning(false)
    toast.info("Agent stopped")
  }

  async function sendEmail(result: AgentResult) {
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: `contact@${new URL(result.website).hostname}`,
          toName: result.company,
          subject: result.subject,
          bodyText: result.body,
          senderName: form.senderName,
          agencyName: form.agencyName,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`Email sent to ${result.company}!`)
      setResults(prev => prev.map(r => r.company === result.company ? { ...r, status: "sent" } : r))
    } catch (err) {
      toast.error("Send failed: " + String(err))
    }
  }

  function copyEmail(result: AgentResult) {
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)
    toast.success("Email copied to clipboard")
  }

  const scoreColor = (score: number) =>
    score < 50 ? "text-red-400 bg-red-500/10 border-red-500/20"
    : score < 70 ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="AI Automation Agent" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">

        {/* Intro */}
        <div className="rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">AI Lead Hunter</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Searches for companies in any niche → analyzes their website speed & SEO → writes personalized outreach emails → queues 30/day for sending. Fully automated.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Config panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/60 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-violet-400" />
                  Target Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Niche / Industry</Label>
                  <Input
                    placeholder="e.g. restaurants, dentists, plumbers"
                    value={form.niche}
                    onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                    className="bg-card/50 border-border/60 h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location (optional)</Label>
                  <Input
                    placeholder="e.g. London, NYC, Dubai"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="bg-card/50 border-border/60 h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max companies</Label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={form.maxCompanies}
                      onChange={e => setForm(f => ({ ...f, maxCompanies: e.target.value }))}
                      className="bg-card/50 border-border/60 h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Score threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.scoreThreshold}
                      onChange={e => setForm(f => ({ ...f, scoreThreshold: e.target.value }))}
                      className="bg-card/50 border-border/60 h-8 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Only email companies scoring below {form.scoreThreshold}/100</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-400" />
                  Sender Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Your Name</Label>
                  <Input value={form.senderName} onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))} className="bg-card/50 border-border/60 h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Agency Name</Label>
                  <Input value={form.agencyName} onChange={e => setForm(f => ({ ...f, agencyName: e.target.value }))} className="bg-card/50 border-border/60 h-8 text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium">Auto-add to leads queue</div>
                    <div className="text-[10px] text-muted-foreground">Add found companies to Leads automatically</div>
                  </div>
                  <Switch checked={form.autoQueue} onCheckedChange={v => setForm(f => ({ ...f, autoQueue: v }))} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {!running ? (
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0"
                  onClick={runAgent}
                  disabled={!form.niche}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run AI Agent
                </Button>
              ) : (
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={stopAgent}>
                  Stop Agent
                </Button>
              )}
            </div>

            {/* API keys info */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-3 text-xs space-y-1.5">
                <div className="font-medium text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Boost with free API keys
                </div>
                <div className="text-muted-foreground space-y-1">
                  <p>• <strong>SERPAPI_KEY</strong> — real Google results (100/mo free at serpapi.com)</p>
                  <p>• <strong>GOOGLE_API_KEY</strong> — PageSpeed + Search (100/day free)</p>
                  <p>Without keys: uses Groq AI to generate company list + still runs real PageSpeed checks.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live output */}
          <div className="lg:col-span-2 space-y-4">

            {/* Progress */}
            {(running || done) && (
              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {running && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                      {running ? "Agent running..." : "Agent complete"}
                    </span>
                    <span className="text-xs text-muted-foreground">{results.length} emails ready</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {logs.slice(-6).map((log, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${log.status === "error" ? "text-red-400" : log.status === "skip" ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                        {log.status === "running" && <Loader2 className="w-3 h-3 animate-spin mt-0.5 flex-shrink-0" />}
                        {log.status === "done" && <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />}
                        {log.status === "skip" && <SkipForward className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                        {log.status === "error" && <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {results.length} Companies Ready for Outreach
                </h3>
                {results.map((result) => (
                  <Card key={result.company} className="border-border/60 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{result.company}</span>
                            <Badge className={`text-xs ${scoreColor(result.score)}`}>
                              <TrendingDown className="w-2.5 h-2.5 mr-1" />
                              {result.score}/100
                            </Badge>
                            {result.status === "sent" && (
                              <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                Sent
                              </Badge>
                            )}
                          </div>
                          <a href={result.website} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3" />
                            {result.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Button size="sm" variant="outline" className="h-7 px-2 border-border/60 text-xs" onClick={() => setExpandedResult(expandedResult === result.company ? null : result.company)}>
                            <Eye className="w-3 h-3 mr-1" />
                            {expandedResult === result.company ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 border-border/60 text-xs" onClick={() => copyEmail(result)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 bg-violet-600 hover:bg-violet-700 text-white border-0 text-xs"
                            onClick={() => sendEmail(result)}
                            disabled={result.status === "sent"}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>

                      {/* Issues */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {result.issues.slice(0, 3).map((issue, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            {issue.length > 50 ? issue.slice(0, 50) + "…" : issue}
                          </span>
                        ))}
                      </div>

                      {/* Email preview */}
                      {expandedResult === result.company && (
                        <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-1">Subject:</div>
                          <div className="text-sm font-medium mb-3">{result.subject}</div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Body:</div>
                          <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">{result.body}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!running && results.length === 0 && !done && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Bot className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Configure your target and hit Run</p>
                <p className="text-sm mt-1 opacity-60">The agent will search, analyze websites, and write emails automatically</p>
              </div>
            )}

            {done && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="w-10 h-10 text-yellow-400/40 mb-3" />
                <p className="text-muted-foreground font-medium">No qualifying companies found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Try a different niche, location, or raise the score threshold</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
