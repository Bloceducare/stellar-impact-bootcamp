"use client"

import { useState } from "react"
import { Wallet, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export function WalletStatus() {
  const [connected, setConnected] = useState(false)
  const mockAddress = "GCKF...7XYZ"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            connected ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {connected ? (
            <span className="flex items-center gap-2">
              <span className="font-mono">{mockAddress}</span>
              <a
                href="#"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          ) : (
            "Wallet not connected"
          )}
        </span>
      </div>

      <button
        onClick={() => setConnected(!connected)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200",
          connected
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Wallet className="w-4 h-4" />
        {connected ? "Disconnect" : "Connect Wallet"}
      </button>
    </div>
  )
}
