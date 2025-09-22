import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">SF</span>
              </div>
              <span className="font-bold text-foreground">SolFund</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized crowdfunding platform powered by Solana blockchain technology.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Platform</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Discover Campaigns
              </Link>
              <Link href="/create" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Create Campaign
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 SolFund. Built on Solana blockchain by <a className="underline" href="https://x.com/rohanBuilds" target="_blank"> <b>Rohan Singla</b></a>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
