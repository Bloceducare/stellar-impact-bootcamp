"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { contractGetTodos, type ContractTodo } from "@/lib/stellar/contract";

export interface UseGetTodosReturn {
  todos: ContractTodo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useGetTodos
 *
 * Fetches the todo list from the Soroban contract by simulation
 * (no wallet required). Polls every `pollInterval` ms while mounted.
 */
export function useGetTodos(pollInterval = 0): UseGetTodosReturn {
  const [todos, setTodos] = useState<ContractTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    setError(null);
    try {
      const result = await contractGetTodos();
      setTodos(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();

    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetch, pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, pollInterval]);

  return { todos, isLoading, error, refetch: fetch };
}
