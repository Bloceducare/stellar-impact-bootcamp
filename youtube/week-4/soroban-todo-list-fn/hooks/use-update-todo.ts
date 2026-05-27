"use client";

import { useCallback, useState } from "react";
import { buildUpdateTodo, submitSignedTransaction } from "@/lib/stellar/contract";
import { useWallet } from "@/lib/stellar/wallet-context";
import type { TxStatus } from "./use-create-todo";

export interface UseUpdateTodoReturn {
  updateTodo: (id: number, newTitle: string, newDescription: string) => Promise<string | null>;
  status: TxStatus;
  txHash: string | null;
  error: string | null;
  reset: () => void;
}

/**
 * useUpdateTodo
 *
 * Calls the contract's update_todo(id, new_title, new_description) function.
 * Note: the contract sets is_completed = false on update.
 */
export function useUpdateTodo(): UseUpdateTodoReturn {
  const { account, signTx } = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateTodo = useCallback(
    async (id: number, newTitle: string, newDescription: string): Promise<string | null> => {
      if (!account) {
        setError("Wallet not connected");
        setStatus("error");
        return null;
      }

      setStatus("building");
      setError(null);
      setTxHash(null);

      try {
        const { transaction } = await buildUpdateTodo(
          id,
          newTitle,
          newDescription,
          account.publicKey
        );
        setStatus("signing");
        const signedXdr = await signTx(transaction);
        setStatus("submitting");
        const hash = await submitSignedTransaction(signedXdr);
        setTxHash(hash);
        setStatus("success");
        return hash;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Update failed";
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

  return { updateTodo, status, txHash, error, reset };
}
