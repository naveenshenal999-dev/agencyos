"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Mail,
  Paintbrush,
  Settings,
  Users,
  UserSquare,
  Zap,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: UserSquare,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Post Designer",
    href: "/design",
    icon: Paintbrush,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: "Pro",
  },
  {
    title: "AI Automation",
    href: "/automation",
    icon: Zap,
    badge: "AI",
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UserSquare,
    badge: "New",
  },
  {
    title: "Email",
    href: "/email",
    icon: Mail,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  user?: { email?: string; full_name?: string }
  agencyName?: string
  plan?: string
}

export function Sidebar({ user, agencyName = "My Agency", plan = "starter" }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    if (IS_DEMO) {
      await fetch("/api/demo/login", { method: "DELETE" })
      router.push("/login")
      router.refresh()
      return
    }
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Error signing out")
    } else {
      router.push("/login")
    }
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U"

  const planColors: Record<string, string> = {
    starter: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    pro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    agency: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-card border-r border-border/40 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            AgencyOS
          </div>
          <div className="text-xs text-muted-foreground truncate">{agencyName}</div>
        </div>
        <Badge className={cn("ml-auto text-xs capitalize flex-shrink-0", planColors[plan] || planColors.starter)}>
          {plan}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-violet-400" : "")} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 h-4 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-border/40 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user?.full_name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground h-8 px-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
