import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const past = new Date(date)
  const diff = now.getTime() - past.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatPercent(num: number) {
  return `${num.toFixed(1)}%`
}

export function getHealthScoreColor(score: number) {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

export function getHealthScoreBg(score: number) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

export function getPlatformColor(platform: string) {
  const colors: Record<string, string> = {
    instagram: '#E1306C',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
  }
  return colors[platform] || '#6B7280'
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateClientColor(name: string) {
  const colors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
    '#F97316', '#EAB308', '#22C55E', '#06B6D4',
    '#3B82F6', '#14B8A6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const PLAN_LIMITS = {
  starter: { users: 1, clients: 5 },
  pro: { users: 5, clients: 25 },
  agency: { users: Infinity, clients: Infinity },
}
