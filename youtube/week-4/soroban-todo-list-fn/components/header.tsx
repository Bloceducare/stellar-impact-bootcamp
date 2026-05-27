import { Github } from "lucide-react";
import { STELLAR_EXPERT_CONTRACT_URL } from "@/lib/stellar/config";

export function Header() {
  return (
    <header className="border-b border-border/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Stellar logo-inspired icon */}
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a7 7 0 0 1 0 14" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Soroban Todo</h1>
            <p className="text-xs text-muted-foreground">Decentralized Tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={STELLAR_EXPERT_CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 bg-secondary rounded-md font-mono transition-colors"
          >
            testnet
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
