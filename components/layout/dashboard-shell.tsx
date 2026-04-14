"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

interface DashboardShellProps {
  children: React.ReactNode
  user?: { email?: string; full_name?: string }
  agencyName?: string
  plan?: string
}

export function DashboardShell({ children, user, agencyName, plan }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} agencyName={agencyName} plan={plan} />
      </div>

      {/* Mobile nav */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
        agencyName={agencyName}
        plan={plan}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
