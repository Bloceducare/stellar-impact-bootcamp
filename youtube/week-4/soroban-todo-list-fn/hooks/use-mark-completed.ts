"use client";

import { useCallback, useState } from "react";
import {
  buildMarkCompleted,
  submitSignedTransaction,
} from "@/lib/stellar/contract";
import { useWallet } from "@/lib/stellar/wallet-context";
import type { TxStatus } from "./use-create-todo";

export interface UseMarkCompletedReturn {
  markCompleted: (id: number) => Promise<string | null>;
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  reset: () => void;
}

/**
 * useMarkCompleted
 *
 * Calls mark_is_completed(id) on the contract.
 * Note: the contract sets is_completed = true and does NOT toggle —
 * there is no "unmark" function in the contract.
 */
export function useMarkCompleted(): UseMarkCompletedReturn {
  const { account, signTx } = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markCompleted = useCallback(
    async (id: number): Promise<string | null> => {
      if (!account) {
        setError("Wallet not connected");
        setStatus("error");
        return null;
      }

      setStatus("building");
      setError(null);
      setTxHash(null);

      try {
        const { transaction } = await buildMarkCompleted(id, account.publicKey);
        setStatus("signing");
        const signedXdr = await signTx(transaction);
        setStatus("submitting");
        const hash = await submitSignedTransaction(signedXdr);
        setTxHash(hash);
        setStatus("success");
        return hash;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Mark completed failed";
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [account, signTx],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { markCompleted, status, txHash, error, reset };
}
