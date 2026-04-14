"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient as createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Client } from "@/types"

interface ClientFormProps {
  agencyId: string
  client?: Client
  onSuccess?: () => void
}

const industries = [
  "E-commerce", "Fashion", "Food & Beverage", "Health & Wellness",
  "Real Estate", "Technology", "Finance", "Education", "Entertainment",
  "Sports", "Travel", "Beauty", "Automotive", "Hospitality", "Other"
]

export function ClientForm({ agencyId, client, onSuccess }: ClientFormProps) {
  const isEdit = !!client
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: client?.name || "",
    industry: client?.industry || "",
    website: client?.website || "",
    instagram: client?.instagram || "",
    facebook: client?.facebook || "",
    linkedin: client?.linkedin || "",
    twitter: client?.twitter || "",
    target_audience: client?.target_audience || "",
    brand_voice: client?.brand_voice || "",
    status: client?.status || "active",
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("clients")
          .update(formData)
          .eq("id", client.id)
        if (error) throw error
        toast.success("Client updated successfully")
      } else {
        const { error } = await supabase
          .from("clients")
          .insert({ ...formData, agency_id: agencyId, health_score: 50 })
        if (error) throw error
        toast.success("Client added successfully")
      }
      onSuccess?.()
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save client"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Client Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Acme Corp"
            required
            className="border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={formData.industry} onValueChange={v => v && handleChange("industry", v)}>
            <SelectTrigger className="border-border/60">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={e => handleChange("website", e.target.value)}
          placeholder="https://acmecorp.com"
          className="border-border/60"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram Handle</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={e => handleChange("instagram", e.target.value)}
            placeholder="@acmecorp"
            className="border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook Page</Label>
          <Input
            id="facebook"
            value={formData.facebook}
            onChange={e => handleChange("facebook", e.target.value)}
            placeholder="acmecorp"
            className="border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={e => handleChange("linkedin", e.target.value)}
            placeholder="acme-corp"
            className="border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X Handle</Label>
          <Input
            id="twitter"
            value={formData.twitter}
            onChange={e => handleChange("twitter", e.target.value)}
            placeholder="@acmecorp"
            className="border-border/60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_audience">Target Audience</Label>
        <Textarea
          id="target_audience"
          value={formData.target_audience}
          onChange={e => handleChange("target_audience", e.target.value)}
          placeholder="E.g., millennials aged 25-35 interested in sustainable fashion..."
          className="border-border/60 min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_voice">Brand Voice</Label>
        <Textarea
          id="brand_voice"
          value={formData.brand_voice}
          onChange={e => handleChange("brand_voice", e.target.value)}
          placeholder="E.g., Friendly, energetic, and inspiring. Uses casual language with occasional humor..."
          className="border-border/60 min-h-[80px]"
        />
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={v => v && handleChange("status", v)}>
            <SelectTrigger className="border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0"
        disabled={isLoading}
      >
        {isLoading ? (
          <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          isEdit ? "Update Client" : "Add Client"
        )}
      </Button>
    </form>
  )
}
