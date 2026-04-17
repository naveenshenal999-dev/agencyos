"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface MobileMenuContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <MobileMenuContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  return useContext(MobileMenuContext)
}
