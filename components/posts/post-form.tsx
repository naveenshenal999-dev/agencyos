"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PostFormProps {
  clientId: string
  onSuccess?: () => void
}

export function PostForm({ clientId, onSuccess }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    platform: "instagram",
    caption: "",
    image_url: "",
    scheduled_at: "",
    status: "draft",
  })
  const supabase = createClient()

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload: Record<string, unknown> = {
        client_id: clientId,
        platform: formData.platform,
        caption: formData.caption,
        image_url: formData.image_url || null,
        status: formData.status,
        created_by: user?.id,
      }
      if (formData.scheduled_at) {
        payload.scheduled_at = new Date(formData.scheduled_at).toISOString()
        payload.status = "scheduled"
      }
      const { error } = await supabase.from("posts").insert(payload)
      if (error) throw error
      toast.success("Post created successfully")
      onSuccess?.()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create post"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Platform *</Label>
        <Select value={formData.platform} onValueChange={v => v && handleChange("platform", v)}>
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
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={formData.caption}
          onChange={e => handleChange("caption", e.target.value)}
          placeholder="Write your post caption..."
          className="border-border/60 min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL (optional)</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={e => handleChange("image_url", e.target.value)}
          placeholder="https://..."
          className="border-border/60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">Schedule Date (optional)</Label>
        <Input
          id="scheduled_at"
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={e => handleChange("scheduled_at", e.target.value)}
          className="border-border/60"
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={v => v && handleChange("status", v)}>
          <SelectTrigger className="border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Submit for Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0"
        disabled={isLoading}
      >
        {isLoading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Creating...</> : "Create Post"}
      </Button>
    </form>
  )
}
