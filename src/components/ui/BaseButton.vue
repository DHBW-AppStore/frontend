<script setup lang="ts">
/**
 * App-wide primary button.
 *
 * Variants — kept small so all views share the same visual vocabulary:
 *   * ``primary`` / ``yellow`` (default) — main action / create / submit. Logo
 *                                          orange (``accentYellow``); ``primary``
 *                                          is a semantic alias so code needn't
 *                                          pin the colour as part of the contract.
 *   * ``green``                          — confirming secondary action (resume,
 *                                          save in a non-destructive context).
 *   * ``red``                            — destructive action (delete, reject, reset).
 *   * ``ghost``                          — very subtle action (cancel in modals).
 *
 * Disabled: all variants drop the hover effect and switch to
 * ``opacity-50 + cursor-not-allowed``, set centrally here.
 */
withDefaults(defineProps<{
  variant?: 'primary' | 'yellow' | 'green' | 'red' | 'ghost'
}>(), {
  variant: 'primary',
})
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2',
      'px-5 py-2.5 rounded-xl font-medium text-sm transition duration-150 shadow-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:!bg-current',
      // ``primary`` and ``yellow`` share the same style; ``yellow`` is kept as an alias.
      (variant === 'primary' || variant === 'yellow')
        ? 'bg-lightYellow text-accentYellow hover:bg-accentYellow hover:text-white focus:ring-accentYellow/60'
        : variant === 'green'
        ? 'bg-lightGreen text-gray-800 hover:bg-primary hover:text-white focus:ring-primary/60'
        : variant === 'red'
        ? 'bg-lightRed text-accentRed hover:bg-accentRed hover:text-white focus:ring-accentRed/60'
        : variant === 'ghost'
        ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300 shadow-none'
        : ''
    ]"
  >
    <slot />
  </button>
</template>


