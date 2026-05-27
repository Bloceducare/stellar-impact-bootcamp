"use client";

import { ExternalLink, Loader2, Wallet, WifiOff } from "lucide-react";
import { useWallet } from "@/lib/stellar/wallet-context";
import { STELLAR_EXPERT_URL } from "@/lib/stellar/config";
import { cn } from "@/lib/utils";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletConnect() {
  const { status, account, error, connect, disconnect } = useWallet();

  const isConnected = status === "connected" && !!account;
  const isConnecting = status === "connecting" || status === "checking";
  const isNotInstalled = status === "not_installed";

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: status indicator */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            isConnected && "bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse",
            !isConnected && !isConnecting && "bg-muted-foreground/30",
            isConnecting && "bg-amber-400 animate-pulse"
          )}
        />
        <span className="text-xs text-muted-foreground font-mono">
          {isConnected && account ? (
            <span className="flex items-center gap-2">
              <span>{truncateAddress(account.publicKey)}</span>
              <a
                href={`${STELLAR_EXPERT_URL}/account/${account.publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 transition-colors"
              >
                View <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </span>
          ) : isConnecting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting…
            </span>
          ) : isNotInstalled ? (
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <WifiOff className="w-3 h-3" />
              Install Freighter
            </a>
          ) : (
            "Wallet not connected"
          )}
        </span>
      </div>

      {/* Right: action button */}
      {isNotInstalled ? null : (
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            isConnected
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_var(--primary)] hover:shadow-[0_0_18px_var(--primary)]"
          )}
        >
          <Wallet className="w-3.5 h-3.5" />
          {isConnected ? "Disconnect" : "Connect Freighter"}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive truncate max-w-[200px]">{error}</p>
      )}
    </div>
  );
}
