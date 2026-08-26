<template>
  <header class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex items-start gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-navy-500 to-navy-700 text-white shadow-lg shadow-navy-900/10">
        <AppIcon :name="icon" class="h-6 w-6" />
      </div>
      <div>
        <p v-if="eyebrow" class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-navy-600 dark:text-navy-300">{{ eyebrow }}</p>
        <h1 class="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">{{ title }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>
      </div>
    </div>
    <slot name="actions" />
  </header>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  eyebrow: { type: String, default: '' },
})
</script>
