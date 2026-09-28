<template>
  <div class="min-h-screen flex items-center justify-center px-4">

    <!-- Card -->
    <div class="surface-banner w-full max-w-md p-10">

      <!-- Logo / Titel -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold tracking-tight text-fg">SIX7</h1>
        <p class="text-fg-muted mt-2">
          Click'n Deploy
        </p>
      </div>

      <!-- Seiteninhalt -->
      <slot />

    </div>
  </div>
</template>
