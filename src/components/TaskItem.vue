<script setup lang="ts">
import type { Task } from '@/types/global'

defineProps<{
  task: Task
}>()

defineEmits<{
  'toggle-task': [id: number]
  'delete-task': [id: number]
  'edit-task': [task: Task]
}>()

const formatDate = (dateString: string | number | Date, withTime: boolean) => {
  const date = new Date(dateString)
  return withTime
    ? date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
}
</script>

<template>
  <div class="item" :class="{ 'item--completed': task.completed }">
    <div class="item__checkbox">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="$emit('toggle-task', task.id)"
        :id="`task-${task.id}`"
      />
      <label :for="`task-${task.id}`" class="task-item--checkmark">O</label>
    </div>
    <div class="item__content">
      <h3 class="item__title" :class="{ 'item__title--completed': task.completed }">
        {{ task.title }}
      </h3>
      <p v-if="task.description" class="item__deskription">{{ task.description }}</p>
    </div>
    <div class="item__meta">
      <span v-if="task.createdAt" class="item__date"
        >Дата создания {{ formatDate(task.createdAt, true) }}</span
      >
      <span v-if="task.completedDate" class="item__date"
        >Сделать до {{ formatDate(task.completedDate, false) }}</span
      >
      <!-- <span v-if="task.priority" class="item__priority">{{ getPriorityLabel(task.priority) }}</span> -->
      <span v-if="task.priority" class="item__priority">{{ task.priority }}</span>
    </div>
    <div class="item__buttons">
      <button class="btn tab" @click="$emit('edit-task', task)" title="Редактировать">
        Редактировать
      </button>
      <button class="btn-alert tab" @click="$emit('delete-task', task.id)" title="Удалить">
        Удалить
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  animation: slideIn 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &--completed {
    opacity: 0.7;
    background-color: var(--color-background-light);
  }
  &__checkmark {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 2px solid #cbd5e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  &__checkbox {
    position: relative;

    & input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 100%;
      width: 100%;
    }

    & input:checked .item__checkmark {
      background-color: #42b883;
      border-color: #42b883;
      position: relative;
      &::after {
        content: '♦';
        position: absolute;
        color: white;
        font-size: 14px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: 16px;
    font-weight: bold;
    color: var(--color-text);

    &--completed {
      text-decoration: line-through;
      color: var(--color-shadow);
    }
  }

  &__description {
    margin: 0 0 0.5rem 0;
    font-size: 14px;
    color: #718096;
  }

  &__meta {
    display: flex;
    gap: 8px;
    font-size: 0.8rem;
    color: #a0aec0;
  }

  &__priority {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;

    &--hight {
      background-color: #fed7d7;
      color: #c53030;
    }

    &--medium {
      background-color: #feebc8;
      color: #c05621;
    }

    &--low {
      background-color: #c6f6d5;
      color: #2f855a;
    }
  }

  &__action {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  &__buttons{

   display: flex;
   gap: var(--gap);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
