import type { Todo } from "@/lib/types";

interface TodoStatsProps {
  todos: Todo[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.is_completed).length;
  const pending = total - completed;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary/60" />
        <span>{total} total</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
        <span>{completed} done</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        <span>{pending} pending</span>
      </div>
    </div>
  );
}
