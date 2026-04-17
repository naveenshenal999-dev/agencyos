"use client"

import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { MobileMenuProvider, useMobileMenu } from "./mobile-menu-context"

interface DashboardShellProps {
  children: React.ReactNode
  user?: { email?: string; full_name?: string }
  agencyName?: string
  plan?: string
}

function ShellInner({ children, user, agencyName, plan }: DashboardShellProps) {
  const { isOpen, close } = useMobileMenu()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} agencyName={agencyName} plan={plan} />
      </div>

      {/* Mobile nav drawer */}
      <MobileNav open={isOpen} onClose={close} user={user} agencyName={agencyName} plan={plan} />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

export function DashboardShell({ children, user, agencyName, plan }: DashboardShellProps) {
  return (
    <MobileMenuProvider>
      <ShellInner user={user} agencyName={agencyName} plan={plan}>
        {children}
      </ShellInner>
    </MobileMenuProvider>
  )
}
