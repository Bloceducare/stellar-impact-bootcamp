"use client"

import { cn } from "@/lib/utils"

export type FilterType = "all" | "active" | "completed"

interface TodoFiltersProps {
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
]

export function TodoFilters({ filter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
            filter === f.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
