<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
    <section class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-600 text-white">
        <AppIcon name="journal" class="h-5 w-5" />
      </div>

      <template v-if="isValidating">
        <h1 class="mt-6 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Validando sua confirmação...</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Aguarde enquanto verificamos o link de ativação.</p>
        <div class="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-full w-1/2 animate-pulse rounded-full bg-navy-600"></div></div>
      </template>

      <template v-else-if="activationError">
        <h1 class="mt-6 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Não foi possível ativar sua conta</h1>
        <p class="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ activationError }}</p>
        <RouterLink :to="{ name: 'login' }" class="mt-6 flex h-11 items-center justify-center rounded-xl bg-navy-600 px-5 text-sm font-bold text-white transition hover:bg-navy-700">Ir para o login</RouterLink>
      </template>

      <template v-else-if="isComplete">
        <h1 class="mt-6 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Conta ativada</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400" role="status">Senha definida com sucesso. Você será redirecionado em instantes.</p>
      </template>

      <template v-else>
        <p class="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-navy-600 dark:text-navy-300">Ativação de conta</p>
        <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Defina sua senha</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Use pelo menos 6 caracteres para concluir o acesso à sua conta.</p>

        <form class="mt-6 space-y-5" @submit.prevent="submit">
          <p v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ formError }}</p>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nova senha</span>
            <input v-model="password" type="password" required minlength="6" autocomplete="new-password" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSubmitting" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Confirmar nova senha</span>
            <input v-model="passwordConfirmation" type="password" required minlength="6" autocomplete="new-password" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSubmitting" />
          </label>
          <button type="submit" class="flex h-12 w-full items-center justify-center rounded-xl bg-navy-600 px-5 text-sm font-bold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSubmitting || !isPasswordValid">{{ isSubmitting ? 'Definindo senha...' : 'Ativar conta' }}</button>
        </form>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { initializeAuth } from '@/composables/useAuth'
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase'
import { updatePassword } from '@/services/auth'

const router = useRouter()
const isValidating = ref(true)
const activationError = ref('')
const isSubmitting = ref(false)
const isComplete = ref(false)
const password = ref('')
const passwordConfirmation = ref('')
const formError = ref('')
const isPasswordValid = computed(() => password.value.length >= 6 && password.value === passwordConfirmation.value)
let redirectTimeout = null

function clearCallbackParameters() {
  if (window.location.search || window.location.hash) window.history.replaceState({}, document.title, window.location.pathname)
}

function invalidLinkMessage() {
  return 'Não foi possível validar este link de ativação. Ele pode estar inválido ou ter expirado. Solicite um novo convite a um administrador.'
}

async function validateActivation() {
  if (!isSupabaseConfigured) {
    activationError.value = 'A configuração de autenticação não está disponível. Tente novamente mais tarde.'
    isValidating.value = false
    return
  }

  try {
    await initializeAuth()
    const client = requireSupabase()
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))

    if (query.has('error') || hash.has('error') || hash.has('error_code')) {
      activationError.value = invalidLinkMessage()
      clearCallbackParameters()
      return
    }

    let { data, error } = await client.auth.getSession()
    if (error) throw error

    if (!data.session && query.get('code')) {
      const result = await client.auth.exchangeCodeForSession(query.get('code'))
      if (result.error) throw result.error
      data = result.data
    }

    if (!data.session) {
      activationError.value = invalidLinkMessage()
      clearCallbackParameters()
      return
    }

    clearCallbackParameters()
  } catch {
    activationError.value = 'Não foi possível validar sua confirmação. Verifique sua conexão e tente novamente ou solicite um novo convite.'
    clearCallbackParameters()
  } finally {
    isValidating.value = false
  }
}

async function submit() {
  if (isSubmitting.value) return
  formError.value = ''

  if (password.value.length < 6) {
    formError.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    formError.value = 'A confirmação de senha não confere.'
    return
  }

  isSubmitting.value = true
  try {
    await updatePassword(password.value)
    password.value = ''
    passwordConfirmation.value = ''
    isComplete.value = true
    redirectTimeout = window.setTimeout(() => router.replace({ name: 'consultation' }), 1500)
  } catch {
    formError.value = 'Não foi possível definir a senha. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(validateActivation)
onBeforeUnmount(() => window.clearTimeout(redirectTimeout))
</script>
