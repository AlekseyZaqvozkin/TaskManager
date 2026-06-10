export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedDate: string
}

export type Stats = {
  label: string
  count: number
  bar?: boolean
}

export type FilterOption = {
  label: string
  value: string
  count: number
}
export type FilterValue = 'all' | 'active' | 'completed'
export type SortValue = 'date' | 'completedDate' | 'title' | 'priority'
