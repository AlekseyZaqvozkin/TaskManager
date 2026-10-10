import type { FilterOption, FilterValue, SortValue, Stats, Task } from '@/types/global'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Описание интерфейсов данных
// export interface Task {
//   id: string
//   title: string
//   description?: string
//   isCompleted: boolean
//   priority: 'low' | 'medium' | 'high'
//   category: string
//   createdAt: number
// }

// export type FilterType = 'all' | 'active' | 'completed'

export const useTaskStore = defineStore('taskStore', () => {
  // --- STATE ---
  const tasks = ref<Task[]>([])
  const currentFilter = ref<FilterValue>('all')
  const currentSort = ref<SortValue>('date')

  // --- GETTERS (Вычисляемые свойства) ---

  const filterOption = computed<FilterOption[]>(() => [
    { label: 'Все', value: 'all', count: tasks.value.length },
    { label: 'В работе', value: 'active', count: tasks.value.filter((t) => !t.completed).length },
    {
      label: 'Выполненые',
      value: 'completed',
      count: tasks.value.filter((t) => t.completed).length,
    },
  ])

  // Статистика
  const stats = computed(() => {
    const list = tasks.value
    const total = list.length
    const completed = list.reduce((s, t) => s + (t.completed ? 1 : 0), 0)
    const active = total - completed
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, active, progress }
  })

  const statsArr = computed<Stats[]>(() => [
    { label: 'Всего', count: stats.value.total },
    { label: 'Выполнено', count: stats.value.completed },
    { label: 'Активных', count: stats.value.total - stats.value.completed },
    { label: 'Прогресс', count: stats.value.progress, bar: true },
  ])
  // Фильтрация и сортировка
  const filterAndSortedTasks = computed(() => {
    let filtered = [...tasks.value]

    // 1. Фильтрация
    if (currentFilter.value === 'active') {
      filtered = filtered.filter((t) => !t.completed)
    } else if (currentFilter.value === 'completed') {
      filtered = filtered.filter((t) => t.completed)
    }

    // 2. Сортировка
    filtered.sort((a, b) => {
      // Сортировка по названию
      if (currentSort.value === 'title') {
        return a.title.localeCompare(b.title)
      }

      // Сортировка по приоритету
      if (currentSort.value === 'priority') {
        const priorityOrder: Record<Task['priority'], number> = { high: 3, medium: 2, low: 1 }
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      }

      // Сортировка по дате завершения (возрастание)
      if (currentSort.value === 'completedDate') {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : null
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : null

        if (dateA === dateB) return 0
        if (dateA === null) return 1
        if (dateB === null) return -1

        return dateA - dateB
      }

      // По умолчанию (дата создания, убывание)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  })

  // --- ACTIONS (Методы) ---

  function onSave(taskData: Task) {
    if (taskData.id) {
      const i = tasks.value.findIndex((x) => x.id === taskData.id)
      if (i !== -1) {
        // Обновляем существующую задачу
        tasks.value[i] = { ...tasks.value[i], ...taskData }
      }
    } else {
      // Добавляем новую с генерацией ID
      if (!taskData.completedDate) {
        taskData.completedDate = ''
      }
      tasks.value.push({
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      })
    }
  }

  const toggleTask = (id: number) => {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  const eraseAll = () => {
    tasks.value = []
    currentFilter.value = 'all'
    currentSort.value = 'date'
    localStorage.clear()
  }

  const deleteTask = (id: number) => {
    tasks.value = tasks.value.filter((t) => t.id !== id)
    // saveToLocalStorage()
  }

  const handleSortChange = (sort: SortValue) => {
    currentSort.value = sort
  }

  const handleFilterChange = (filter: FilterValue) => {
    currentFilter.value = filter
  }

  return {
    tasks,
    currentFilter,
    currentSort,
    filterOption,
    filterAndSortedTasks,
    stats,
    statsArr,
    onSave,
    toggleTask,
    eraseAll,
    deleteTask,
    handleSortChange,
    handleFilterChange,
    // clearCompleted,
  }
})
