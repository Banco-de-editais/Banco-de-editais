<template>
  <div ref="root" class="relative">
    <label :id="labelId" class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{{ label }}</label>
    <button
      type="button"
      class="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950"
      :aria-expanded="open"
      :aria-labelledby="labelId"
      aria-haspopup="listbox"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="truncate" :class="modelValue.length ? '' : 'text-slate-400'">{{ buttonLabel }}</span>
      <AppIcon name="chevron-down" class="h-4 w-4 shrink-0 transition" :class="open ? 'rotate-180' : ''" />
    </button>
    <div v-if="open" class="absolute z-30 mt-2 max-h-72 w-full min-w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="listbox" aria-multiselectable="true">
      <div v-if="searchable" class="sticky top-0 z-10 bg-white p-1 pb-2 dark:bg-slate-900">
        <label :for="searchId" class="sr-only">Pesquisar em {{ label.toLowerCase() }}</label>
        <input
          :id="searchId"
          ref="searchInput"
          v-model="searchQuery"
          type="search"
          :placeholder="searchPlaceholder"
          class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-navy-950"
        />
      </div>
      <label v-for="option in filteredOptions" :key="option.id" class="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
        <input type="checkbox" class="h-4 w-4 accent-navy-600" :checked="modelValue.includes(option.id)" :disabled="disabled" @change="toggle(option.id)" />
        <span>{{ option.name }}</span>
      </label>
      <p v-if="!filteredOptions.length" class="px-3 py-4 text-center text-sm text-slate-500">{{ searchQuery ? 'Nenhuma opção encontrada.' : 'Nenhuma opção disponível.' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: Array, required: true }, options: { type: Array, required: true },
  label: { type: String, required: true }, placeholder: { type: String, default: 'Selecione...' },
  searchable: Boolean,
  searchPlaceholder: { type: String, default: 'Pesquisar...' },
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const open = ref(false)
const searchInput = ref(null)
const searchQuery = ref('')
const labelId = `multi-${Math.random().toString(36).slice(2)}`
const searchId = `${labelId}-search`
const selectedNames = computed(() => props.options.filter((item) => props.modelValue.includes(item.id)).map((item) => item.name))
const buttonLabel = computed(() => selectedNames.value.length ? selectedNames.value.join(', ') : props.placeholder)
const normalizedSearch = computed(() => normalizeSearchText(searchQuery.value))
const filteredOptions = computed(() => normalizedSearch.value
  ? props.options.filter((option) => normalizeSearchText(option.name).includes(normalizedSearch.value))
  : props.options)

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
}

function toggleOpen() {
  open.value = !open.value
  if (open.value && props.searchable) nextTick(() => searchInput.value?.focus())
}

function toggle(id) {
  if (props.disabled) return
  emit('update:modelValue', props.modelValue.includes(id) ? props.modelValue.filter((item) => item !== id) : [...props.modelValue, id])
}
function handleOutside(event) { if (!root.value?.contains(event.target)) open.value = false }
function handleEscape(event) { if (event.key === 'Escape') open.value = false }
watch(open, (isOpen) => { if (!isOpen) searchQuery.value = '' })
onMounted(() => { document.addEventListener('mousedown', handleOutside); window.addEventListener('keydown', handleEscape) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', handleOutside); window.removeEventListener('keydown', handleEscape) })
</script>
