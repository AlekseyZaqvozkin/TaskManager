<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TaskList from './components/TaskList.vue'
import TaskFilter from './components/TaskFilter.vue'
import TaskStat from './components/TaskStat.vue'
import TaskModal from './components/TaskModal.vue'
import type { FilterOption, FilterValue, SortValue, Stats, Task } from './types/global'

import { useHead } from '@unhead/vue'
// import ThemeChange from './components/ThemeChange.vue'

useHead({
  title: 'Менеджер задач',
  meta: [
    {
      name: 'description',
      content: 'Простой и эффективный менеджер задач на Vue 3.',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      property: 'og:title',
      content: 'Менеджер задач',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

// Состояние
const tasks = ref<Task[]>([])
const currentFilter = ref<FilterValue>('all')
const currentSort = ref<SortValue>('date')

// Следим за списком задач
watch(
  tasks,
  (newTasks) => {
    localStorage.setItem('tasks', JSON.stringify(newTasks))
  },
  { deep: true }, // изменения внутри объектов
)

// Реактивное состояние для отслеживания темы
const isDark = ref(false)

// Функция переключения темы
const toggleTheme = () => {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('theme', 'light')
  }
}

// modal

const modalOpen = ref(false)
const editingTask = ref<Task | null>(null)

function openNew() {
  editingTask.value = null
  modalOpen.value = true
}

function openEdit(task: Task) {
  editingTask.value = task
  modalOpen.value = true
}

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

// Фильтр
const filterOption = computed<FilterOption[]>(() => [
  { label: 'Все', value: 'all', count: tasks.value.length },
  { label: 'В работе', value: 'active', count: tasks.value.filter((t) => !t.completed).length },
  { label: 'Выполненые', value: 'completed', count: tasks.value.filter((t) => t.completed).length },
])

// Статистика
const stats = computed(() => {
  const list = tasks.value
  const total = list.length
  const completed = list.reduce((s, t) => s + (t.completed ? 1 : 0), 0)
  const active = total - completed
  const progress = total === 0 ? 0 : Math.round( (completed / total) * 100)
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

// Методы

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

const handleChangeFilter = (filter: FilterValue) => {
  currentFilter.value = filter
}

const loadFromLocalStorage = () => {
  // Инициализация темы при монтировании компонента

  const savedTheme = localStorage.getItem('theme')

  // Проверяем сохраненную тему или системные настройки ОС
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark-theme')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark-theme')
  }

  const savedTask = localStorage.getItem('tasks')
  if (savedTask) {
    try {
      const parsed: unknown = JSON.parse(savedTask)
      if (Array.isArray(parsed)) {
        tasks.value = parsed.map((p) => {
          const obj = p as Record<string, unknown>
          return {
            id: Number(obj.id),
            title: String(obj.title ?? ''),
            description: typeof obj.description === 'string' ? obj.description : '',
            completed: Boolean(obj.completed),
            priority: (['low', 'medium', 'high'].includes(String(obj.priority))
              ? (String(obj.priority) as Task['priority'])
              : 'medium') as Task['priority'],
            createdAt: String(obj.createdAt ?? new Date().toISOString()),
            completedDate: String(obj.completedDate ?? new Date().toISOString()),
          } as Task
        })
      } else {
        tasks.value = []
      }
    } catch {
      tasks.value = []
    }
  }
}

// Загрузка при старте
onMounted(() => {
  loadFromLocalStorage()
})
</script>

<template>
  <div class="app">
    <div class="app__container">
      <section class="header">
        <div class="header__container">
          <img alt="Task manager logo" class="header__logo" src="@/assets/logo_green.png" />
          <button class="btn tab" @click="openNew">Новая задача</button>
          <TaskStat :stats="statsArr" />
          <div class="header__right">
             <button class="btn tab" @click="toggleTheme">{{ isDark ? 'светлая' : 'тёмная' }}</button>
          <button class="btn-alert tab" @click="eraseAll">Х</button>
          </div>

        </div>
        <!-- <ThemeChange/> -->

      </section>

      <h1 class="app__title">Список задач</h1>
      <TaskFilter
        :filter-option="filterOption"
        :active-filter="currentFilter"
        @sort-change="handleSortChange"
        @current-filter="handleChangeFilter"
      />
      <TaskList
        :tasks="filterAndSortedTasks"
        @toggle-task="toggleTask"
        @delete-task="deleteTask"
        @edit-task="openEdit"
      />
    </div>
  </div>
  <TaskModal v-model="modalOpen" :task="editingTask" @save="onSave" />
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  padding: var(--gap);
  background-color: var(--color-background-soft);
  width: 100%;

  &__container {
    max-width: 1800px;
    margin: 0 auto;
    background: var(--color-background);
    border-radius: 20px;
    padding: calc(2 * var(--gap));
    box-shadow: 0 20px 60px var(--color-shadow);
  }

  &__title {
    text-align: center;
    color: var(--color-text);
    font-size: 32px;
    margin-bottom: var(--gap);
  }
}

.header {
  padding: 8px 16px;
  background: var(--color-background);
  box-shadow: 0 1px 3px var(--color-shadow);
  border-radius: 12px;
  margin-bottom: var(--gap);
  position: sticky;
  top: 0;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  &__logo {
    width: 25px;
    height: 25px;
  }

  &__right {
    display: flex;
    gap: var(--gap);
  }
}
</style>
