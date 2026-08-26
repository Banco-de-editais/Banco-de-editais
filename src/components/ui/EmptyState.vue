<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300">
      <AppIcon :name="icon" class="h-6 w-6" />
    </div>
    <h3 class="mt-4 font-bold text-slate-900 dark:text-white">{{ title }}</h3>
    <p class="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
defineProps({
  icon: { type: String, default: 'search' },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>
