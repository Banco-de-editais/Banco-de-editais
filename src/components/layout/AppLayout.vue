<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
      <div class="flex h-20 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-navy-500 to-navy-700 text-white shadow-md">
          <AppIcon name="journal" class="h-5 w-5" />
        </div>
        <div>
          <p class="font-black tracking-tight text-slate-950 dark:text-white">Banco de Editais</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Residência médica</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navegação principal">
        <RouterLink v-for="item in navigation" :key="item.name" :to="{ name: item.name }" class="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition" :class="route.name === item.name ? 'bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-navy-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'">
          <AppIcon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>

        <template v-if="isAdmin">
          <p class="px-3 pb-2 pt-6 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">Administração</p>
          <RouterLink v-for="item in adminNavigation" :key="item.name" :to="{ name: item.name }" class="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition" :class="route.name === item.name ? 'bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-navy-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'">
            <AppIcon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <div class="border-t border-slate-200 p-4 dark:border-slate-800">
        <div class="mb-3 min-w-0 px-2">
          <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ user?.email }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ isAdmin ? 'Administrador' : 'Usuário' }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'" @click="toggleTheme">
            <AppIcon :name="isDark ? 'sun' : 'moon'" class="h-4 w-4" />
            Tema
          </button>
          <button type="button" class="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" :disabled="isSigningOut" @click="handleLogout">
            <AppIcon name="logout" class="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>

    <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-600 text-white"><AppIcon name="journal" class="h-5 w-5" /></div>
        <span class="font-black tracking-tight">Banco de Editais</span>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'" @click="toggleTheme"><AppIcon :name="isDark ? 'sun' : 'moon'" class="h-5 w-5" /></button>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Abrir menu" @click="mobileOpen = true"><AppIcon name="menu" class="h-6 w-6" /></button>
      </div>
    </header>

    <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" @mousedown.self="mobileOpen = false">
      <aside class="flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-2xl dark:bg-slate-900" aria-label="Menu móvel">
        <header class="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <span class="font-black">Navegação</span>
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar menu" @click="mobileOpen = false"><AppIcon name="close" class="h-5 w-5" /></button>
        </header>
        <nav class="flex-1 space-y-1 overflow-y-auto p-4">
          <RouterLink v-for="item in navigation" :key="item.name" :to="{ name: item.name }" class="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold" :class="route.name === item.name ? 'bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-navy-200' : 'text-slate-600 dark:text-slate-300'"><AppIcon :name="item.icon" class="h-5 w-5" />{{ item.label }}</RouterLink>
          <template v-if="isAdmin">
            <p class="px-3 pb-2 pt-5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400">Administração</p>
            <RouterLink v-for="item in adminNavigation" :key="item.name" :to="{ name: item.name }" class="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold" :class="route.name === item.name ? 'bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-navy-200' : 'text-slate-600 dark:text-slate-300'"><AppIcon :name="item.icon" class="h-5 w-5" />{{ item.label }}</RouterLink>
          </template>
        </nav>
        <div class="border-t border-slate-200 p-4 dark:border-slate-800">
          <p class="truncate text-sm font-semibold">{{ user?.email }}</p>
          <button type="button" class="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold dark:border-slate-700" :disabled="isSigningOut" @click="handleLogout"><AppIcon name="logout" class="h-5 w-5" />Sair da conta</button>
        </div>
      </aside>
    </div>

    <main class="lg:pl-64">
      <div class="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <p v-if="logoutError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ logoutError }}</p>
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const { user, isAdmin, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
const mobileOpen = ref(false)
const isSigningOut = ref(false)
const logoutError = ref('')
const navigation = [{ name: 'consultation', label: 'Consulta', icon: 'consultation' }]
const adminNavigation = [
  { name: 'admin-users', label: 'Usuários', icon: 'users' },
  { name: 'admin-institutions', label: 'Instituições', icon: 'institution' },
  { name: 'admin-journals', label: 'Revistas', icon: 'journal' },
  { name: 'admin-indexers', label: 'Indexadores', icon: 'indexer' },
  { name: 'admin-edicts', label: 'Editais', icon: 'edict' },
]

async function handleLogout() {
  if (isSigningOut.value) return
  isSigningOut.value = true
  logoutError.value = ''
  try {
    await logout()
    await router.replace({ name: 'login' })
  } catch (error) {
    logoutError.value = error.message
  } finally {
    isSigningOut.value = false
  }
}

watch(() => route.fullPath, () => { mobileOpen.value = false })
watch(mobileOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
</script>
