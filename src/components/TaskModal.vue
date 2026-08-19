<template>
  <transition name="fade">
    <div v-if="visible" class="modal-backdrop" @click.self="close" ref="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref="modal">
        <header class="modal__header">
          <h3 class="modal__title" id="modal-title">
            {{ isEdit ? 'Редактировать задачу' : 'Новая задача' }}
          </h3>
        </header>

        <form @submit.prevent="submit" class="modal__form" @keydown.enter.prevent="onEnterKey">
          <label class="modal__label">
            <span class="modal__heading">Задача</span>
            <input
              class="modal__input"
              name="title"
              ref="firstInput"
              v-model="form.title"
              required
              maxlength="100"
            />
          </label>

          <label class="modal__label">
            <span class="modal__heading">Описание</span>
            <textarea
              class="modal__input"
              name="description"
              v-model="form.description"
              rows="4"
            ></textarea>
          </label>

          <!-- <label class="modal__label">
            <span>Приоритет</span>


            <select v-model="form.priority" name="priority">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label> -->

          <div class="modal__select">
            <label for="priority" class="modal__label"> <span class="modal__heading">Приоритет</span> </label>

            <div>
              <input
                class="modal__select-toggle"
                v-model="form.priority"
                id="priority-low"
                type="radio"
                name="priority"
                value="low"

              />
              <label class="btn tab modal__select-btn" for="priority-low" :class="{' modal__select-btn--isActive' : form.priority == 'low'}">
                 Низкий</label>
            </div>
            <div>
              <input
                class="modal__select-toggle"
                v-model="form.priority"
                id="priority-medium"
                type="radio"
                name="priority"
                value="medium"

              />
              <label class="btn tab  modal__select-btn" for="priority-medium"
              :class="{' modal__select-btn--isActive' : form.priority == 'medium'}">
              Средний</label>
            </div>
            <div>
              <input
                class="modal__select-toggle"
                v-model="form.priority"
                id="priority-high"
                type="radio"
                name="priority"
                value="high"

              />
              <label class="btn tab  modal__select-btn" for="priority-high" :class="{' modal__select-btn--isActive' : form.priority == 'high'}">
                Высокий</label>
            </div>
            <!-- </fieldset> -->
          </div>

          <label class="modal__label">
            <span class="modal__heading">Срок</span>
            <input class="modal__select-date" type="date" v-model="form.completedDate" name="completedDate" />
          </label>

          <div class="modal__actions">
            <button class="btn tab" type="button" @click="close">Отмена</button>
            <button class="btn tab" type="submit">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
            <!-- <button v-if="isEdit" type="button" class="danger" @click="remove">Удалить</button> -->
          </div>
        </form>
        <button class="modal__close-btn" @click="close">Х</button>
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

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
  backdrop-filter: blur(1px);
}
.modal {
  position: relative;
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
  padding: var(--gap);
  width: 450px;
  max-width: 95%;
  overflow: hidden;
  outline: none;

  &__close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: var(--color-text);
    border: none;
    background: none;
  }

  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
  }

  &__title {
    color: var(--color-text);
    font-size: var(--font-size-header);
  }

  &__heading  {
    // font-weight: bold;
  }

  &__form {
    padding: var(--gap);
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    font-size: var(--font-size-text);
  }

  &__select {
    position: relative;
    display: flex;
    justify-content: space-between;
    &-toggle {
      display: none;

    }

    &-btn {
      opacity: 0.5;
      &--isActive {
        opacity: 1;
      }
    }

    &-date {
      padding: 8px 16px;
      font-size: inherit;
      font-family: inherit;
      outline: none;
      border: none;
      border-radius: var(--border-radius-small);
    }

    &-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
      transition: border-color 0.2s;
      &:hover {
        border-color: #999;
      }
    }
    // &-arrow {
    //   border: solid #666;
    //   border-width: 0 2px 2px 0;
    //   display: inline-block;
    //   transform: rotate(45deg);
    //   transition: transform 0.2s;
    // }
    &-option {
      display: flex;
      justify-content: space-between;
      // position: absolute;
      // top: 100%;
      // left: 0;
      // right: 0;
      // margin: 4px 0 0 0;
      // padding: 0;
      // list-style: none;
      // background-color: rgba(0, 0, 0, 0.45);
      // border: 2px solid #666;
      // box-shadow: rgba(0, 0, 0, 0.45);
      // opacity: 0;
      // visibility: hidden;
      // transform: translateY(-10px);
      // transition:
      //   opacity 0.2s,
      //   transform 0.2s,
      //   visibility 0.2s;
      // z-index: 10;
      & li label {
        display: block;
        padding: 12px;
        cursor: pointer;
        &:hover {
          background-color: #f0f6ff;
          color: #0066ff;
        }
      }
    }
  }

  &__label {
    display: flex;
    justify-content: space-between;
  }

  &__input {
    width: 77%;
    padding: var(--gap);
    outline: none;
    border: none;
    border-radius: var(--border-radius-small);
    font-family: inherit;
    font-size: var(--font-size-text);

    &:focus {
      box-shadow: 0 3px 3px var(--color-shadow);
    }
  }

  &__actions {
    display: flex;
    gap: var(--gap);
    justify-content: flex-end;
    margin-top: 8px;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
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
