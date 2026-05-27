"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTodo } from "@/hooks/use-create-todo";
import { useWallet } from "@/lib/stellar/wallet-context";
import { TxStatusBadge } from "./tx-status-badge";

interface TodoInputProps {
  onSuccess?: () => void;
}

export function TodoInput({ onSuccess }: TodoInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expanded, setExpanded] = useState(false);
  const { createTodo, status, txHash, error, reset } = useCreateTodo();
  const { status: walletStatus } = useWallet();

  const isConnected = walletStatus === "connected";
  const isPending = ["building", "signing", "submitting"].includes(status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const hash = await createTodo(title.trim(), description.trim());
    if (hash) {
      setTitle("");
      setDescription("");
      setExpanded(false);
      onSuccess?.();
      setTimeout(reset, 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value && !expanded) setExpanded(true);
            if (!e.target.value) setExpanded(false);
          }}
          placeholder={
            isConnected
              ? "Add a task to the blockchain…"
              : "Connect wallet to add tasks"
          }
          disabled={!isConnected || isPending}
          className={cn(
            "w-full bg-input border border-border rounded-lg py-3 pl-4 pr-12 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50",
            "focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={!title.trim() || !isConnected || isPending}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md",
            "bg-primary text-primary-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "hover:bg-primary/90 transition-all"
          )}
          aria-label="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          disabled={!isConnected || isPending}
          className={cn(
            "w-full bg-input border border-border rounded-lg py-2.5 px-4 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50",
            "focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      </div>

      {status !== "idle" && (
        <div className="flex items-center justify-between">
          <TxStatusBadge status={status} txHash={txHash} />
          {status === "success" && txHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View tx ↗
            </a>
          )}
        </div>
      )}

      {error && status === "error" && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </form>
  );
}
