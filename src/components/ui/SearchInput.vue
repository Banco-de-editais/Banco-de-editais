<template>
  <label class="block">
    <span v-if="label" class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{{ label }}</span>
    <span class="relative block">
      <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-navy-400 dark:focus:bg-slate-900 dark:focus:ring-navy-950"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </span>
  </label>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  modelValue: { type: String, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar...' },
})
defineEmits(['update:modelValue'])
</script>
