"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Paintbrush, Image, Type, Layers, Download, Wand2, Grid3X3, Monitor } from "lucide-react"
import { toast } from "sonner"

const TEMPLATES = [
  { id: "1", name: "Instagram Post", size: "1080×1080", aspect: "1:1", platform: "instagram", bg: "from-pink-500/20 to-violet-500/20" },
  { id: "2", name: "Instagram Story", size: "1080×1920", aspect: "9:16", platform: "instagram", bg: "from-orange-500/20 to-pink-500/20" },
  { id: "3", name: "Facebook Cover", size: "820×312", aspect: "cover", platform: "facebook", bg: "from-blue-500/20 to-indigo-500/20" },
  { id: "4", name: "LinkedIn Post", size: "1200×627", aspect: "1.91:1", platform: "linkedin", bg: "from-blue-600/20 to-sky-500/20" },
  { id: "5", name: "Twitter Header", size: "1500×500", aspect: "3:1", platform: "twitter", bg: "from-sky-500/20 to-blue-500/20" },
  { id: "6", name: "LinkedIn Banner", size: "1584×396", aspect: "banner", platform: "linkedin", bg: "from-slate-500/20 to-blue-500/20" },
]

const TOOLS = [
  { icon: Image, label: "Images" },
  { icon: Type, label: "Text" },
  { icon: Grid3X3, label: "Shapes" },
  { icon: Layers, label: "Layers" },
  { icon: Wand2, label: "AI Magic" },
]

export default function DesignPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState("Text")

  if (selectedTemplate) {
    const template = TEMPLATES.find(t => t.id === selectedTemplate)!
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Post Designer" />
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Toolbar */}
          <div className="w-full lg:w-16 bg-card border-b lg:border-b-0 lg:border-r border-border/40 flex lg:flex-col items-center p-2 gap-1">
            {TOOLS.map(tool => (
              <button
                key={tool.label}
                onClick={() => setActiveTool(tool.label)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors w-12 ${activeTool === tool.label ? "bg-violet-500/10 text-violet-400" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <tool.icon className="w-4 h-4" />
                <span className="text-[9px]">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Canvas area */}
          <div className="flex-1 bg-muted/20 flex items-center justify-center p-4 sm:p-8 min-h-[400px]">
            <div className="relative">
              <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-xl bg-gradient-to-br ${template.bg} border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-3 shadow-2xl`}>
                <Paintbrush className="w-10 h-10 text-muted-foreground/40" />
                <div className="text-center px-4">
                  <div className="text-sm font-medium text-muted-foreground">{template.name}</div>
                  <div className="text-xs text-muted-foreground/60">{template.size}</div>
                </div>
                <Badge className="bg-background/50 text-muted-foreground border-border/40 text-[10px]">
                  Canvas · Click to add elements
                </Badge>
              </div>
            </div>
          </div>

          {/* Properties panel */}
          <div className="w-full lg:w-64 bg-card border-t lg:border-t-0 lg:border-l border-border/40 p-4 space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{activeTool}</div>
              {activeTool === "Text" && (
                <div className="space-y-2">
                  {["Heading", "Subheading", "Body text", "Caption"].map(t => (
                    <button key={t} onClick={() => toast.info(`Add ${t}`)} className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              )}
              {activeTool === "Shapes" && (
                <div className="grid grid-cols-3 gap-2">
                  {["■", "●", "▲", "◆", "⬡", "⬭"].map(s => (
                    <button key={s} onClick={() => toast.info("Add shape")} className="h-10 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors text-lg">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {activeTool === "AI Magic" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Generate designs with AI</p>
                  <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0" onClick={() => toast.info("AI design generation requires API key")}>
                    <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                    Generate Design
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0" size="sm" onClick={() => toast.success("Design exported!")}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export PNG
              </Button>
              <Button variant="outline" size="sm" className="w-full border-border/60" onClick={() => setSelectedTemplate(null)}>
                Back to templates
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Post Designer" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Choose a Template</h2>
          <p className="text-sm text-muted-foreground">Select a canvas size to start designing</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(template => (
            <Card
              key={template.id}
              className="border-border/60 bg-card/50 hover:border-violet-500/40 transition-colors cursor-pointer group"
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className={`h-32 rounded-lg bg-gradient-to-br ${template.bg} flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform`}>
                  <Monitor className={`w-8 h-8 opacity-60 ${template.platform === "instagram" ? "text-pink-400" : template.platform === "twitter" ? "text-sky-400" : "text-blue-400"}`} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.size}</div>
                  </div>
                  <Badge className="capitalize text-[10px]" variant="outline">{template.aspect}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-border/40 bg-card/20">
          <CardContent className="p-6 text-center">
            <Paintbrush className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <div className="text-sm font-medium text-muted-foreground mb-1">Custom canvas size</div>
            <div className="text-xs text-muted-foreground/60">Set your own dimensions</div>
            <Button variant="outline" size="sm" className="mt-3 border-border/60" onClick={() => toast.info("Custom canvas coming soon")}>
              Custom Size
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
