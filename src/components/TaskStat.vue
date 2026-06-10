<script setup lang="ts">
import type { Stats } from '@/types/global'

defineProps<{
  stats: Stats[]
}>()
</script>

<template>
  <div class="stat">
    <div v-for="stat in stats" :key="stat.label" class="tab stat__tabs">
      <p class="stat__label">
        {{ stat.label }}
      </p>
      <span class="stat__count">
        {{ stat.count }}
        <span v-if="stat.bar" class="stat__bar" :style="{ height: `${stat.count + '%'}` }"> </span>
      </span>
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

  &__tabs {
    gap: var(--gap);
    color: var(--color-text);
    user-select: none;
  }

  &__count {
    position: relative;
    min-width: 32px;
    text-align: center;
    background-color: var(--color-text-opacity-10);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: var(--font-size-minor);
    overflow: hidden;
  }

  &__label {
    font-size: var(--font-size-minor);
    opacity: 0.9;
  }

  &__bar {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: var(--primary);
    width: 32px;
    opacity: 0.5;
    border-radius: 3px 3px 8px 8px;
    transition: height 0.3s ease-in-out;
  }
}
</style>
