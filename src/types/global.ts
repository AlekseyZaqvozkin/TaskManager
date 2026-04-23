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
  total: number
  completed: number
  active: number
  progress: number
}

export type FilterOption = {
  label: string
  value: string
  count: number
}
export type FilterValue = 'all' | 'active' | 'completed'
export type SortValue = 'date' | 'completedDate' | 'title' | 'priority'
