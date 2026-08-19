<script setup lang="ts">
import type { Task } from '@/types/global'
import TaskItem from './TaskItem.vue'

const props = defineProps<{ tasks: Task[] }>()

const emits = defineEmits<{
  'toggle-task': [id: number]
  'delete-task': [id: number]
  'edit-task': [task: Task]
}>()
</script>

<template>
  <section class="list">
    <div v-if="tasks.length === 0" class="list__empty">
      <p class="">Нет задач. Добавьте свою первую задачу!</p>
    </div>
    <TransitionGroup name="list" tag="div" class="list__items">
      <TaskItem
        v-for="task in props.tasks"
        :key="task.id"
        :task="task"
        @toggle-task="emits('toggle-task', $event)"
        @delete-task="emits('delete-task', $event)"
        @edit-task="emits('edit-task', $event)"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped lang="scss">
.list {
  margin: 2rem 0;

  &__empty {
    text-align: center;
    padding: 32px;
    background: var(--color-background-light);
    border-radius: var(--border-radius);
    color: var(--color-text);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  /* Базовые переходы для появления и исчезновения */

  &-enter-active,
  &-leave-active {
    transition: all 0.5s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  &-move {
    transition: transform 0.5s ease;
  }

  &-leave-active {
    position: absolute;
  }
}
</style>
