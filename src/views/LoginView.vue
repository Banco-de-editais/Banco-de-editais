<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-navy-200/45 blur-3xl dark:bg-navy-900/25"></div>
      <div class="absolute -bottom-36 -right-24 h-[30rem] w-[30rem] rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-950/20"></div>
    </div>

    <section class="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_0.95fr] dark:border-slate-800 dark:bg-slate-900">
      <div class="hidden bg-linear-to-br from-navy-600 to-navy-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><AppIcon name="journal" class="h-6 w-6" /></div>
          <span class="text-lg font-black tracking-tight">Banco de Editais</span>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-navy-200">Residência médica</p>
          <h1 class="mt-4 text-4xl font-black leading-tight tracking-tight">Encontre onde seu trabalho científico pode pontuar.</h1>
          <p class="mt-5 max-w-md text-sm leading-7 text-navy-100">Consulte critérios cadastrados e compare seu artigo com clareza, segurança e rastreabilidade.</p>
        </div>
        <p class="text-xs text-navy-200">Acesso restrito a usuários cadastrados.</p>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="mb-8 flex items-center justify-between lg:justify-end">
          <div class="flex items-center gap-3 lg:hidden">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-600 text-white"><AppIcon name="journal" class="h-5 w-5" /></div>
            <span class="font-black">Banco de Editais</span>
          </div>
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'" @click="toggleTheme"><AppIcon :name="isDark ? 'sun' : 'moon'" class="h-5 w-5" /></button>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-navy-600 dark:text-navy-300">Bem-vindo</p>
          <h2 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Acesse sua conta</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Use as credenciais fornecidas pelo administrador.</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="submit">
          <p v-if="displayError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ displayError }}</p>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
            <input v-model.trim="email" type="email" required autocomplete="email" placeholder="voce@exemplo.com" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSubmitting || Boolean(configError)" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Senha</span>
            <input v-model="password" type="password" required autocomplete="current-password" placeholder="Sua senha" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSubmitting || Boolean(configError)" />
          </label>
          <button type="submit" class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSubmitting || Boolean(configError)">
            <span v-if="isSubmitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
            {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const { login, configError } = useAuth()
const { isDark, toggleTheme } = useTheme()
const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)
const displayError = computed(() => configError.value || error.value)

async function submit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    isSubmitting.value = false
  }
}
</script>
