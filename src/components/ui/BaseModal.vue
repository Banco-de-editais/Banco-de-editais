<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[2px] sm:p-5"
      @mousedown.self="requestClose"
    >
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="description ? descriptionId : undefined"
        class="relative max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        :class="sizeClasses"
        @keydown="trapFocus"
      >
        <div class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-navy-400 to-navy-700" aria-hidden="true"></div>
        <header class="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6 dark:border-slate-800">
          <div>
            <h2 :id="titleId" class="text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{{ title }}</h2>
            <p v-if="description" :id="descriptionId" class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 dark:hover:bg-slate-800 dark:hover:text-navy-300"
            aria-label="Fechar modal"
            :disabled="busy"
            @click="requestClose"
          >
            <AppIcon name="close" class="h-5 w-5" />
          </button>
        </header>
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  busy: Boolean,
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['close'])
const panel = ref(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `${titleId}-description`
const sizeClasses = computed(() => ({ sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[props.size]))
let previousActiveElement = null
let previousOverflow = ''

const focusableSelector = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'

function requestClose() {
  if (!props.busy) emit('close')
}

function handleEscape(event) {
  if (props.open && event.key === 'Escape') requestClose()
}

function trapFocus(event) {
  if (event.key !== 'Tab') return
  const focusable = [...(panel.value?.querySelectorAll(focusableSelector) ?? [])]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    previousActiveElement = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    ;(panel.value?.querySelector('[autofocus]') ?? panel.value?.querySelector(focusableSelector))?.focus()
  } else {
    document.body.style.overflow = previousOverflow
    previousActiveElement?.focus?.()
  }
})

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = previousOverflow
})
</script>
