"use client";

import { useCallback, useState } from "react";
import { buildDeleteTodo, submitSignedTransaction } from "@/lib/stellar/contract";
import { useWallet } from "@/lib/stellar/wallet-context";
import type { TxStatus } from "./use-create-todo";

export interface UseDeleteTodoReturn {
  deleteTodo: (id: number) => Promise<string | null>;
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  reset: () => void;
}

/**
 * useDeleteTodo
 *
 * Calls the contract's delete_todo(id) function.
 * Returns false from the contract if the ID is not found.
 */
export function useDeleteTodo(): UseDeleteTodoReturn {
  const { account, signTx } = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteTodo = useCallback(
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
        const { transaction } = await buildDeleteTodo(id, account.publicKey);
        setStatus("signing");
        const signedXdr = await signTx(transaction);
        setStatus("submitting");
        const hash = await submitSignedTransaction(signedXdr);
        setTxHash(hash);
        setStatus("success");
        return hash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Delete failed";
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

  return { deleteTodo, status, txHash, error, reset };
}
