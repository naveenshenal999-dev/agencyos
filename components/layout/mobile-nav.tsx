"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

interface MobileNavProps {
  open: boolean
  onClose: () => void
  user?: { email?: string; full_name?: string }
  agencyName?: string
  plan?: string
}

export function MobileNav({ open, onClose, user, agencyName, plan }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-64 border-r border-border/40">
        <Sidebar user={user} agencyName={agencyName} plan={plan} />
      </SheetContent>
    </Sheet>
  )
}
