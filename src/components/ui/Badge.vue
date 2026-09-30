<script setup lang="ts">
defineProps<{
  variant?: 'green' | 'red' | 'gray' | 'blue' | 'purple' | 'yellow'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      variant === 'green'
        ? 'bg-status-successLight text-status-success'
        : variant === 'red'
        ? 'bg-red-100 text-red-700'
        : variant === 'blue'
        ? 'bg-blue-100 text-blue-700'
        : variant === 'purple'
        ? 'bg-purple-100 text-purple-700'
        : variant === 'yellow'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-surface-input text-content-secondary'
    ]"
  >
    <slot />
  </span>
</template>
