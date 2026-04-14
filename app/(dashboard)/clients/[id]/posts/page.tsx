"use client"

import { useEffect, useState, use } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { IS_DEMO, demoClients, demoPosts } from "@/lib/demo-data"
import { PostForm } from "@/components/posts/post-form"
import { CaptionGenerator } from "@/components/ai/caption-generator"
import {
  Plus, Filter, CheckCircle, XCircle, Clock, MessageSquare,
  Heart, Eye, ArrowLeft, Loader2, Brain
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { Post } from "@/types"

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  pending_approval: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function PostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = use(params)
  const [posts, setPosts] = useState<Post[]>([])
  const [client, setClient] = useState<{ name: string; brand_voice?: string; target_audience?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [postFormOpen, setPostFormOpen] = useState(false)
  const [captionOpen, setCaptionOpen] = useState(false)
  useEffect(() => {
    loadData()
  }, [clientId])

  async function loadData() {
    setIsLoading(true)
    if (IS_DEMO) {
      const demoClient = demoClients.find(c => c.id === clientId)
      setClient(demoClient ? { name: demoClient.name, brand_voice: demoClient.brand_voice, target_audience: demoClient.target_audience } : null)
      setPosts(demoPosts.filter(p => p.client_id === clientId))
      setIsLoading(false)
      return
    }
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const [postsRes, clientRes] = await Promise.all([
      supabase.from("posts").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("clients").select("name, brand_voice, target_audience").eq("id", clientId).single(),
    ])
    setPosts(postsRes.data || [])
    setClient(clientRes.data)
    setIsLoading(false)
  }

  async function handleApprove(postId: string) {
    if (IS_DEMO) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "approved" as const } : p)); toast.success("Post approved"); return }
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.from("posts").update({ status: "approved" }).eq("id", postId)
    if (error) { toast.error("Failed to approve post"); return }
    toast.success("Post approved")
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "approved" as const } : p))
  }

  async function handleReject(postId: string) {
    if (IS_DEMO) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "rejected" as const } : p)); toast.success("Post rejected"); return }
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.from("posts").update({ status: "rejected" }).eq("id", postId)
    if (error) { toast.error("Failed to reject post"); return }
    toast.success("Post rejected")
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "rejected" as const } : p))
  }

  const filtered = posts.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    const matchPlatform = platformFilter === "all" || p.platform === platformFilter
    return matchStatus && matchPlatform
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={client ? `${client.name} — Posts` : "Posts"} />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link href={`/clients/${clientId}`}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            </Link>
            <h2 className="text-lg font-semibold">Posts</h2>
            <Badge variant="outline" className="border-border/40">{posts.length} total</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={captionOpen} onOpenChange={setCaptionOpen}>
              <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 text-sm font-medium h-8 px-3 hover:bg-accent transition-colors cursor-pointer">
                <Brain className="w-3.5 h-3.5" />
                AI Captions
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>AI Caption Generator</DialogTitle>
                </DialogHeader>
                <CaptionGenerator
                  clientId={clientId}
                  brandVoice={client?.brand_voice}
                  targetAudience={client?.target_audience}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={postFormOpen} onOpenChange={setPostFormOpen}>
              <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium h-8 px-3 transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                New Post
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <PostForm clientId={clientId} onSuccess={() => { setPostFormOpen(false); loadData() }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-36 h-8 border-border/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={(v) => v && setPlatformFilter(v)}>
            <SelectTrigger className="w-36 h-8 border-border/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">No posts found</h3>
            <p className="text-sm text-muted-foreground">
              {posts.length === 0 ? "Create your first post for this client." : "No posts match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(post => (
              <Card key={post.id} className="border-border/60 bg-card/50 hover:bg-card transition-colors">
                <CardContent className="p-4 space-y-3">
                  {post.image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs capitalize ${statusColors[post.status]}`}>
                      {post.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize border-border/40">
                      {post.platform}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-3 text-muted-foreground">
                    {post.caption || "No caption"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.reach}</span>
                    <span className="ml-auto">{formatDate(post.created_at)}</span>
                  </div>
                  {post.scheduled_at && (
                    <div className="flex items-center gap-1 text-xs text-purple-400">
                      <Clock className="w-3 h-3" />
                      Scheduled: {formatDate(post.scheduled_at)}
                    </div>
                  )}
                  {post.status === "pending_approval" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
                        onClick={() => handleApprove(post.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleReject(post.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
