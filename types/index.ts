export type Plan = 'starter' | 'pro' | 'agency'
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type ClientStatus = 'active' | 'inactive' | 'paused'
export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'rejected'
export type Platform = 'instagram' | 'facebook' | 'linkedin' | 'twitter'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Agency {
  id: string
  name: string
  plan: Plan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole
  agency_id?: string
  created_at: string
}

export interface Client {
  id: string
  agency_id: string
  name: string
  industry?: string
  website?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  twitter?: string
  brand_colors?: string[]
  target_audience?: string
  brand_voice?: string
  status: ClientStatus
  health_score: number
  created_at: string
}

export interface Post {
  id: string
  client_id: string
  platform: Platform
  caption?: string
  image_url?: string
  design_data?: Record<string, unknown>
  scheduled_at?: string
  published_at?: string
  status: PostStatus
  likes: number
  comments: number
  reach: number
  approved_by?: string
  created_by?: string
  created_at: string
  clients?: Client
}

export interface Metrics {
  id: string
  client_id: string
  platform: Platform
  followers: number
  engagement_rate: number
  reach: number
  impressions: number
  recorded_at: string
}

export interface SeoData {
  id: string
  client_id: string
  score: number
  keywords?: KeywordData[]
  competitors?: CompetitorData[]
  recommendations?: string[]
  recorded_at: string
}

export interface KeywordData {
  keyword: string
  volume: number
  ranking?: number
  difficulty?: number
}

export interface CompetitorData {
  name: string
  website: string
  score?: number
  strengths?: string[]
}

export interface Report {
  id: string
  client_id: string
  month: string
  content?: ReportContent
  pdf_url?: string
  sent_at?: string
  created_at: string
}

export interface ReportContent {
  summary: string
  highlights: string[]
  metrics_overview: string
  top_posts: string
  recommendations: string
  next_month_goals: string
}

export interface Task {
  id: string
  client_id: string
  assigned_to?: string
  title: string
  description?: string
  due_date?: string
  status: TaskStatus
  created_at: string
  users?: User
}

export interface DashboardStats {
  total_clients: number
  total_posts_this_month: number
  avg_engagement_rate: number
  clients_needing_attention: Client[]
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'unsubscribed'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type EmailLogStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'

export interface Lead {
  id: string
  agency_id: string
  email: string
  full_name?: string
  company?: string
  phone?: string
  website?: string
  source: string
  status: LeadStatus
  tags?: string[]
  notes?: string
  last_contacted_at?: string
  created_at: string
}

export interface EmailCampaign {
  id: string
  agency_id: string
  name: string
  subject: string
  body: string
  template: string
  status: CampaignStatus
  daily_limit: number
  sent_count: number
  scheduled_at?: string
  created_by?: string
  created_at: string
}

export interface EmailLog {
  id: string
  campaign_id: string
  lead_id: string
  agency_id: string
  email: string
  status: EmailLogStatus
  resend_id?: string
  opened_at?: string
  clicked_at?: string
  sent_at?: string
  error?: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: Post & { client_name: string; client_color: string }
}
