<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['addTask'])
const newTaskTitle = ref('')
const isSubmiting = ref(false)
const handleSubmit = async () => {
  const title = newTaskTitle.value.trim()
  if (!title) return
  isSubmiting.value = true
  try {
    await emit('addTask', title)
    newTaskTitle.value = ''
  } finally {
    isSubmiting.value = false
  }
}
</script>
<template>
  <div class="input">
    <form @submit.prevent="handleSubmit">
      <input
        v-model="newTaskTitle"
        type="text"
        placeholder="Новая задача"
        class="input__field"
        :disabled="isSubmiting"
      />
      <button type="submit" class="input__button" :disabled="!newTaskTitle.trim() || isSubmiting">
        {{ isSubmiting ? 'Добавляем...' : 'Добавить' }}
      </button>
    </form>
  </div>
</template>
