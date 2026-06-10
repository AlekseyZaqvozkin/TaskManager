<template>
  <transition name="fade">
    <div v-if="visible" class="modal-backdrop" @click.self="close" ref="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref="modal">
        <header class="modal__header">
          <h3 id="modal-title">{{ isEdit ? 'Редактировать задачу' : 'Новая задача' }}</h3>
          <button class="close-btn" @click="close">✕</button>
        </header>

        <form @submit.prevent="submit" class="modal__body" @keydown.enter.prevent="onEnterKey">
          <label>
            <span>Заголовок</span>
            <input ref="firstInput" v-model="form.title" required maxlength="100" />
          </label>

          <label>
            <span>Описание</span>
            <textarea v-model="form.description" rows="4"></textarea>
          </label>

          <label>
            <span>Приоритет</span>
            <select v-model="form.priority">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>

          <label>
            <span>Срок</span>
            <input type="date" v-model="form.completedDate" />
          </label>

          <div class="modal__actions">
            <button type="button" @click="close">Отмена</button>
            <button type="submit">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
            <!-- <button v-if="isEdit" type="button" class="danger" @click="remove">Удалить</button> -->
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Task } from '@/types/global'
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'

// 2. Типизируем пропсы
const props = defineProps<{
  modelValue: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', task: Task): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => !!props.task)

const defaultForm = (): Task => ({
  title: '',
  description: '',
  priority: 'medium',
  completedDate: '',
  id: 0,
  completed: false,
  createdAt: '',
})

const form = ref<Task>(defaultForm())

// watch(
//   () => props.task,
//   (t) => {
//     form.value = t
//       ? {
//           title: t.title ?? '',
//           description: t.description ?? '',
//           priority: t.priority ?? 'medium',
//           completedDate: t.completedDate ? t.completedDate.slice(0, 10) : '',
//         }
//       : defaultForm()
//   },
//   { immediate: true },
// )

watch(
  () => props.task,
  (t) => {
    if (!t) {
      form.value = defaultForm()
      return
    }

    form.value = {
      ...defaultForm(), // берем базу
      ...t, // накладываем данные из пропса
      // форматируем только то, что нужно специфично
      completedDate: t.completedDate?.slice(0, 10) ?? '',
    }
  },
  { immediate: true },
)

function close(): void {
  form.value = defaultForm()
  visible.value = false
}

function submit(): void {
  if (!form.value.title.trim()) {
    alert('Введите заголовок')
    return
  }
  // Передаем id только при редактировании
  emit('save', {
    ...(props.task?.id ? { id: props.task.id } : {}),
    ...form.value,
  })
  close()
}

// function remove(): void {
//   if (!props.task?.id) return
//   if (confirm('Удалить задачу?')) {
//     emit('delete', props.task.id)
//     close()
//   }
// }

/* Keyboard & focus management */
const modal = ref<HTMLElement | null>(null)
const firstInput = ref<HTMLInputElement | null>(null)
let lastFocused: HTMLElement | null = null

watch(visible, async (v) => {
  if (v) {
    lastFocused = document.activeElement as HTMLElement
    await nextTick()
    firstInput.value?.focus()
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focus', enforceFocus, true)
  } else {
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('focus', enforceFocus, true)
    lastFocused?.focus()
  }
})

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
  if (e.key === 'Tab') maintainTabFocus(e)
}

function onEnterKey(e: Event): void {
  const target = e.target as HTMLElement
  if (target.tagName === 'TEXTAREA') return
  submit()
}

function getFocusableElements(): HTMLElement[] {
  if (!modal.value) return []
  const selector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  return Array.from(modal.value.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  )
}

function maintainTabFocus(e: KeyboardEvent): void {
  const focusable = getFocusableElements()
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function enforceFocus(e: FocusEvent): void {
  if (!visible.value || !modal.value) return
  if (!modal.value.contains(e.target as Node)) {
    e.stopPropagation()
    const focusable = getFocusableElements()
    if (focusable.length > 0) focusable[0].focus()
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('focus', enforceFocus, true)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
}
.modal {
  background: #fff;
  width: 420px;
  max-width: 95%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  outline: none;
}
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.modal__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
button.danger {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
