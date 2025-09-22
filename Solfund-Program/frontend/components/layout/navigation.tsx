"use client"

import { useState } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Discover", active: pathname === "/" },
    { href: "/create", label: "Create", active: pathname === "/create" },
    { href: "/completed", label: "Previous Campaigns", active: pathname === "/completed" },

  ]

  const handleWalletConnect = () => {
    // In a real app, this would connect to a Solana wallet
    setIsWalletConnected(!isWalletConnected)
  }

  return (
    <header className={`border-b border-border bg-card ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SF</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">SolFund</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${item.active ? "text-primary font-medium" : "text-foreground hover:text-primary"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isWalletConnected ? (
              <div>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span className="text-sm">7xKX...AqvD</span>
                </Button>
                <Link href="/dashboard" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </div>
            ) : (
              <WalletMultiButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${item.active ? "text-primary font-medium" : "text-foreground hover:text-primary"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {isWalletConnected ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center text-foreground hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleWalletConnect()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center text-foreground hover:text-primary"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      handleWalletConnect()
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <WalletMultiButton />
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header >
  )
}
