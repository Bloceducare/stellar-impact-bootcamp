"use client";

import { useState } from "react";
import { Loader2, ListTodo, RefreshCw } from "lucide-react";
import { TodoItem } from "./todo-item";
import { TodoInput } from "./todo-input";
import { TodoStats } from "./todo-stats";
import { TodoFilters } from "./todo-filters";
import { WalletConnect } from "./wallet-connect";
import { useGetTodos } from "@/hooks/use-get-todos";
import type { FilterType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TodoList() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { todos, isLoading, error, refetch } = useGetTodos();

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.is_completed;
    if (filter === "completed") return todo.is_completed;
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Wallet connection */}
      <div className="mb-8">
        <WalletConnect />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Input area */}
        <div className="p-5 border-b border-border">
          <TodoInput onSuccess={refetch} />
        </div>

        {/* Stats + filters */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-3">
          <TodoStats todos={todos} />
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              title="Refresh from chain"
              className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                isLoading && "animate-spin text-primary"
              )}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <TodoFilters filter={filter} onFilterChange={setFilter} />
          </div>
        </div>

        {/* Todo list */}
        <div className="px-3">
          {isLoading && todos.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Fetching from Soroban…</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button
                onClick={refetch}
                className="text-xs text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onMutated={refetch}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <ListTodo className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === "all"
                  ? "No tasks on-chain yet. Add one above!"
                  : `No ${filter} tasks`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
