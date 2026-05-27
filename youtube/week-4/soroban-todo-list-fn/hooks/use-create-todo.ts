"use client";

import { useCallback, useState } from "react";
import { buildCreateTodo, submitSignedTransaction } from "@/lib/stellar/contract";
import { useWallet } from "@/lib/stellar/wallet-context";

export type TxStatus = "idle" | "building" | "signing" | "submitting" | "success" | "error";

export interface UseCreateTodoReturn {
  createTodo: (title: string, description: string) => Promise<string | null>;
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  reset: () => void;
}

/**
 * useCreateTodo
 *
 * Orchestrates the full create_todo flow:
 *   1. Build the unsigned transaction (simulated on RPC)
 *   2. Request wallet signature via Freighter
 *   3. Submit the signed transaction & poll for confirmation
 *
 * Returns the tx hash on success, null on failure.
 */
export function useCreateTodo(): UseCreateTodoReturn {
  const { account, signTx } = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTodo = useCallback(
    async (title: string, description: string): Promise<string | null> => {
      if (!account) {
        setError("Wallet not connected");
        setStatus("error");
        return null;
      }

      setStatus("building");
      setError(null);
      setTxHash(null);

      try {
        // 1. Build
        const { transaction } = await buildCreateTodo(
          title,
          description,
          account.publicKey
        );

        // 2. Sign
        setStatus("signing");
        const signedXdr = await signTx(transaction);

        // 3. Submit
        setStatus("submitting");
        const hash = await submitSignedTransaction(signedXdr);

        setTxHash(hash);
        setStatus("success");
        return hash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [account, signTx]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { createTodo, status, txHash, error, reset };
}
