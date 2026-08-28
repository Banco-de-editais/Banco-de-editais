<template>
  <div>
    <PageHeader title="Usuários" description="Contas autenticadas e permissões de acesso à aplicação." icon="users" eyebrow="Administração">
      <template #actions>
        <button v-if="isAdmin" type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="openCreate"><AppIcon name="plus" class="h-5 w-5" />Novo usuário</button>
      </template>
    </PageHeader>

    <p v-if="successMessage" class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ successMessage }}</p>
    <p v-if="loadError" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ loadError }}</p>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Buscar usuários">
      <SearchInput v-model="search" label="Buscar usuário" placeholder="Nome ou e-mail" />
    </section>

    <div class="mt-6">
      <LoadingCards v-if="isLoading" :count="6" />
      <EmptyState v-else-if="!filteredUsers.length" icon="users" :title="search ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'" :description="search ? 'Tente buscar por outro nome ou e-mail.' : 'Crie a primeira conta para conceder acesso à aplicação.'" />
      <section v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Lista de usuários">
        <div class="hidden grid-cols-[minmax(0,1.4fr)_minmax(13rem,1fr)_9rem_10rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:grid dark:border-slate-800 dark:bg-slate-800/50">
          <span>Usuário</span><span>Último acesso</span><span>Perfil</span><span>Status</span>
        </div>
        <article v-for="account in filteredUsers" :key="account.id" class="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(13rem,1fr)_9rem_10rem] lg:items-center lg:gap-4 dark:border-slate-800">
          <div class="min-w-0">
            <h2 class="truncate font-bold text-slate-950 dark:text-white">{{ account.name || 'Nome não informado' }}</h2>
            <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{{ account.email || 'E-mail não informado' }}</p>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300"><span class="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Último acesso:</span>{{ formatDateTime(account.lastSignInAt) }}</p>
          <p><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" :class="account.role === 'admin' ? 'bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">{{ account.role === 'admin' ? 'Administrador' : 'Usuário' }}</span></p>
          <p><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" :class="account.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'">{{ account.status === 'active' ? 'Ativo' : 'Convite pendente' }}</span></p>
        </article>
      </section>
    </div>

    <BaseModal :open="formOpen" title="Novo usuário" description="O usuário receberá um convite por e-mail para definir a senha." :busy="isSaving" size="md" @close="closeForm">
      <form class="space-y-5 p-5 sm:p-6" @submit.prevent="save">
        <p v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ formError }}</p>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</span>
          <input v-model.trim="form.name" type="text" required autofocus autocomplete="name" :class="controlClasses" :disabled="isSaving" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail</span>
          <input v-model.trim="form.email" type="email" required autocomplete="email" :class="controlClasses" :disabled="isSaving" />
        </label>
        <label class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <input v-model="form.isAdmin" type="checkbox" class="mt-0.5 h-5 w-5 accent-navy-600" :disabled="isSaving" />
          <span><span class="block text-sm font-bold text-slate-900 dark:text-white">Administrador</span><span class="mt-1 block text-xs text-slate-500">Concede acesso às funcionalidades administrativas da aplicação.</span></span>
        </label>
        <footer class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isSaving" @click="closeForm">Cancelar</button>
          <button type="submit" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-60" :disabled="isSaving || !isFormValid">{{ isSaving ? 'Criando...' : 'Criar usuário' }}</button>
        </footer>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingCards from '@/components/ui/LoadingCards.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useAuth } from '@/composables/useAuth'
import { normalizeText } from '@/lib/formatters'
import { createUser, listUsers } from '@/services/auth'

const { isAdmin } = useAuth()
const users = ref([])
const isLoading = ref(true)
const loadError = ref('')
const search = ref('')
const formOpen = ref(false)
const isSaving = ref(false)
const formError = ref('')
const successMessage = ref('')
const form = reactive({ name: '', email: '', isAdmin: false })
const controlClasses = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950'
const isFormValid = computed(() => form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
const filteredUsers = computed(() => {
  const term = normalizeText(search.value)
  return users.value
    .filter((account) => !term || normalizeText(`${account.name ?? ''} ${account.email ?? ''}`).includes(term))
    .sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || '', 'pt-BR'))
})

function formatDateTime(value) {
  if (!value) return 'Nunca acessou'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

async function loadUsers() {
  isLoading.value = true
  loadError.value = ''
  try {
    users.value = await listUsers()
  } catch (error) {
    loadError.value = error.message
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  Object.assign(form, { name: '', email: '', isAdmin: false })
  formError.value = ''
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function closeForm() {
  if (!isSaving.value) formOpen.value = false
}

async function save() {
  if (isSaving.value || !isFormValid.value || !isAdmin.value) return

  isSaving.value = true
  formError.value = ''
  successMessage.value = ''

  try {
    await createUser({ name: form.name.trim(), email: form.email.trim(), isAdmin: form.isAdmin })
    successMessage.value = 'Usuário criado e convite enviado com sucesso.'
    formOpen.value = false
    await loadUsers()
  } catch (error) {
    formError.value = error.message
  } finally {
    isSaving.value = false
  }
}

onMounted(loadUsers)
</script>
