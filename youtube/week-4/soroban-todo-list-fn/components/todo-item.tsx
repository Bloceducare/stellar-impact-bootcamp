"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/types";
import { useDeleteTodo } from "@/hooks/use-delete-todo";
import { useUpdateTodo } from "@/hooks/use-update-todo";
import { useMarkCompleted } from "@/hooks/use-mark-completed";
import { useWallet } from "@/lib/stellar/wallet-context";

interface TodoItemProps {
  todo: Todo;
  onMutated?: () => void;
}

export function TodoItem({ todo, onMutated }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description);

  const { deleteTodo, status: deleteStatus } = useDeleteTodo();
  const { updateTodo, status: updateStatus } = useUpdateTodo();
  const { markCompleted, status: markStatus } = useMarkCompleted();
  const { status: walletStatus } = useWallet();

  const isConnected = walletStatus === "connected";
  const isDeleting = ["building", "signing", "submitting"].includes(
    deleteStatus,
  );
  const isUpdating = ["building", "signing", "submitting"].includes(
    updateStatus,
  );
  const isMarking = ["building", "signing", "submitting"].includes(markStatus);
  const isBusy = isDeleting || isUpdating || isMarking;

  async function handleMarkCompleted() {
    if (todo.is_completed) return; // contract only marks true, no toggle
    await markCompleted(todo.id);
    onMutated?.();
  }

  async function handleDelete() {
    await deleteTodo(todo.id);
    onMutated?.();
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) return;
    await updateTodo(todo.id, editTitle.trim(), editDesc.trim());
    setEditing(false);
    onMutated?.();
  }

  function handleCancelEdit() {
    setEditTitle(todo.title);
    setEditDesc(todo.description);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="py-4 px-2 border-b border-border/50 last:border-0 space-y-2">
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className={cn(
            "w-full bg-input border border-border rounded-md py-2 px-3 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50",
          )}
          placeholder="Title"
        />
        <input
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className={cn(
            "w-full bg-input border border-border rounded-md py-2 px-3 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50",
          )}
          placeholder="Description"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveEdit}
            disabled={!editTitle.trim() || isUpdating}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors",
            )}
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {isUpdating ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-4 py-4 px-2 border-b border-border/50 last:border-0 transition-colors hover:bg-secondary/30">
      {/* Completion checkbox — calls mark_is_completed on chain */}
      <button
        onClick={handleMarkCompleted}
        disabled={!isConnected || todo.is_completed || isMarking || isBusy}
        title={todo.is_completed ? "Already completed" : "Mark as complete"}
        className={cn(
          "flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200",
          todo.is_completed
            ? "bg-primary border-primary cursor-default"
            : "border-muted-foreground/40 hover:border-primary/60 cursor-pointer",
          isMarking && "opacity-60 cursor-wait",
        )}
      >
        {isMarking ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
        ) : todo.is_completed ? (
          <Check className="w-3 h-3 text-primary-foreground" />
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm transition-all duration-200",
            todo.is_completed
              ? "text-muted-foreground line-through"
              : "text-foreground",
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {todo.description}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">
          #{todo.id}
        </p>
      </div>

      {/* Edit / Delete — only when wallet connected */}
      {isConnected && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            disabled={isBusy}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
            aria-label="Edit task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isBusy}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
            aria-label="Delete task"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
