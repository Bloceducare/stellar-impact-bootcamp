"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TxStatus } from "@/hooks/use-create-todo";

interface TxStatusBadgeProps {
  status: TxStatus;
  txHash?: string | null;
  className?: string;
}

const STATUS_LABELS: Record<TxStatus, string> = {
  idle: "",
  building: "Building tx…",
  signing: "Approve in Freighter…",
  submitting: "Submitting…",
  success: "Confirmed on-chain",
  error: "Transaction failed",
};

export function TxStatusBadge({ status, txHash, className }: TxStatusBadgeProps) {
  if (status === "idle") return null;

  const isLoading = ["building", "signing", "submitting"].includes(status);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md",
        status === "success" && "bg-emerald-500/10 text-emerald-400",
        status === "error" && "bg-destructive/10 text-destructive",
        isLoading && "bg-primary/10 text-primary",
        className
      )}
    >
      {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "success" && <CheckCircle2 className="w-3 h-3" />}
      {status === "error" && <XCircle className="w-3 h-3" />}
      <span>{STATUS_LABELS[status]}</span>
    </div>
  );
}
