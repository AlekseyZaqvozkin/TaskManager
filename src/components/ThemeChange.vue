<script setup lang="ts">
type Theme = 'system' | 'dark' | 'white'

defineProps<{
  theme: Theme
}>()
</script>

<template>
  <button class="tab">День</button>
</template>
