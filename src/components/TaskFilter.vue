<script setup lang="ts">
import type { FilterOption, FilterValue, SortValue } from '@/types/global'
import { ref } from 'vue'

defineProps<{
  filterOption: FilterOption[]
  activeFilter: FilterValue
}>()

const emits = defineEmits<{
  'current-filter': [value: FilterValue]
  'sort-change': [value: SortValue]
}>()

const sortBy = ref('date')

const handleSort = () => {
  emits('sort-change', sortBy.value as SortValue)
}

const handleFilter = (e: string) => {
  emits('current-filter', e as FilterValue)
}
</script>

<template>
  <section class="filter">
    <div class="filter__tabs">
      <button
        v-for="filter in filterOption"
        :key="filter.label"
        :class="['filter__tab', 'tab', 'btn', { 'filter__tab--active': activeFilter === filter.value }]"
        @click="handleFilter(filter.value)"
      >
        {{ filter.label }}
        <span class="filter__count">
          {{ filter.count }}
        </span>
      </button>
    </div>
    <div class="filter__sort">
      <select v-model="sortBy" name="sortBy" @change="handleSort" class="filter__select tab">
        <option value="date">По дате</option>
        <option value="completedDate">Срок выполнения</option>
        <option value="title">По названию</option>
        <option value="priority">По приоритету</option>
      </select>
    </div>
  </section>
</template>

<style scoped lang="scss">
.filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: var(--gap);
  background: var(--color-background-light);
  border-radius: var(--border-radius);
  margin-bottom: var(--gap);

  &__tabs {
    display: flex;
    gap: var(--gap);
    flex-wrap: wrap;
  }

  &__tab {
    color: var(--color-text);

    gap: var(--gap);

    &--active {
      border-color: var(--color-hover);
    }
  }

  &__count {
    background-color: var(--color-background-light);
    padding: 3px 6px;
    border-radius: 100%;
    font-size: var( --font-size-minor);
  }

  &__select {
    color: var(--color-text);
    &:focus {
      outline: none;
    }
    &:hover {
  border-color: var(--color-hover);
  // color: var(--color-hover);
}
  }
}
</style>
