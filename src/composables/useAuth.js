import { computed, readonly, ref } from 'vue'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { signInWithPassword, signOut as requestSignOut } from '@/services/auth'

const session = ref(null)
const isReady = ref(false)
const configError = ref('')
let initializationPromise = null
let authSubscription = null

const user = computed(() => session.value?.user ?? null)
// Invitation links create a short-lived Supabase session so the recipient can
// choose a password. That session must not be treated as application access.
const isAccountActive = computed(() => user.value?.app_metadata?.account_status === 'active')
const isAuthenticated = computed(() => Boolean(user.value) && isAccountActive.value)
const isAdmin = computed(() => isAuthenticated.value && user.value?.app_metadata?.role === 'admin')

export function initializeAuth() {
  if (initializationPromise) return initializationPromise

  initializationPromise = (async () => {
    if (!isSupabaseConfigured) {
      configError.value = 'As variáveis públicas do Supabase ainda não foram configuradas.'
      isReady.value = true
      return
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      session.value = data.session

      const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession
      })
      authSubscription = listener.subscription
    } catch {
      session.value = null
      configError.value = 'Não foi possível validar a sessão com o Supabase.'
    } finally {
      isReady.value = true
    }
  })()

  return initializationPromise
}

export function useAuth() {
  const login = async (email, password) => {
    const data = await signInWithPassword(email, password)
    session.value = data.session
    return data
  }

  const logout = async () => {
    await requestSignOut()
    session.value = null
  }

  return {
    session: readonly(session),
    user,
    isReady: readonly(isReady),
    isAccountActive,
    isAuthenticated,
    isAdmin,
    configError: readonly(configError),
    login,
    logout,
  }
}

export function disposeAuth() {
  authSubscription?.unsubscribe()
  authSubscription = null
}
