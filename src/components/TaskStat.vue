<script setup lang="ts">
import type { Stats } from '@/types/global'

defineProps<{
  stats: Stats
}>()
</script>

<template>
  <div class="stat">
    <div class="stat__tabs tab">
      <!-- <div class="stat__icon">Iii</div> -->

      <div class="stat__label">Всего</div>
      <div class="stat__count">{{ stats.total }}</div>
    </div>

    <div class="stat__tabs tab">
      <!-- <div class="stat__icon">Iii</div> -->

      <div class="stat__label">Выполнено</div>
      <div class="stat__count">{{ stats.completed }}</div>
    </div>

    <div class="stat__tabs tab">
      <!-- <div class="stat__icon">Iii</div> -->

      <div class="stat__label">Активных</div>
      <div class="stat__count">{{ stats.active }}</div>
    </div>

    <div class="stat__tabs tab">
      <!-- <div class="stat__icon">Iii</div> -->

      <div class="stat__label">Прогресс</div>
      <!-- <div class="stat__value">{{ stats.progress }}</div> -->
      <div class="stat__bar">
        <div class="stat__bar--fill" :style="{ height: `${stats.progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--gap);
  color: var(--color-text);

  &__tabs {
    gap: var(--gap);
    user-select: none;
  }

  &__count {
    background-color: var(--color-text-opacity-10);
    padding: 0.125rem 0.375rem;
    border-radius: 100%;
    font-size: 0.5rem;
  }

  &__label {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  &__value {
    font-size: 1rem;
  }

  &__bar {
    height: 16px;
    width: 16px;
    background: var(--color-hover);
    border-radius: 2px;
    overflow: hidden;

    &--fill {
      width: 100%;
      background: var(--color-background-soft);
      border-radius: 2px;
      transition: width 0.3s ease-in-out;
    }
  }
}
</style>
