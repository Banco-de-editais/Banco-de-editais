<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2" :class="wide ? 'xl:grid-cols-3' : 'xl:grid-cols-4'" aria-label="Carregando dados" aria-live="polite">
    <div v-for="item in count" :key="item" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex gap-3">
        <div class="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div class="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800"></div>
        </div>
      </div>
      <div class="mt-6 h-9 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 6 }, wide: Boolean })
</script>
