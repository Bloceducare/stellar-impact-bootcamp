/** Mirrors the Soroban contract's Todo struct */
export interface Todo {
  id: number
  title: string
  description: string
  is_completed: boolean
}

export type FilterType = "all" | "active" | "completed"
