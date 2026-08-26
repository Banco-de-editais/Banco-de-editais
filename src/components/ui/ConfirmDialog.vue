<template>
  <BaseModal :open="open" :title="title" :description="description" :busy="busy" size="sm" @close="$emit('close')">
    <div class="p-5 sm:p-6">
      <div v-if="resourceName" class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ resourceLabel }}</p>
        <p class="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white">{{ resourceName }}</p>
      </div>
      <p v-if="error" class="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ error }}</p>
    </div>
    <footer class="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/40">
      <button type="button" class="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" :disabled="busy" @click="$emit('close')">Cancelar</button>
      <button type="button" class="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60" :disabled="busy" @click="$emit('confirm')">{{ busy ? busyLabel : confirmLabel }}</button>
    </footer>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
defineProps({
  open: Boolean, title: { type: String, required: true }, description: { type: String, required: true },
  resourceLabel: { type: String, default: 'Registro' }, resourceName: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Excluir' }, busyLabel: { type: String, default: 'Excluindo...' },
  busy: Boolean, error: { type: String, default: '' },
})
defineEmits(['close', 'confirm'])
</script>
