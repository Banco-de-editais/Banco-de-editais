<template>
  <div>
    <PageHeader title="Usuários" description="Contas autenticadas e permissões de acesso à aplicação." icon="users" eyebrow="Administração">
      <template #actions>
        <button v-if="isAdmin" type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="openCreate"><AppIcon name="plus" class="h-5 w-5" />Novo usuário</button>
      </template>
    </PageHeader>

    <p v-if="successMessage" class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ successMessage }}</p>

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
import { computed, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { createUser } from '@/services/auth'

const { isAdmin } = useAuth()
const formOpen = ref(false)
const isSaving = ref(false)
const formError = ref('')
const successMessage = ref('')
const form = reactive({ name: '', email: '', isAdmin: false })
const controlClasses = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950'
const isFormValid = computed(() => form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))

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
  } catch (error) {
    formError.value = error.message
  } finally {
    isSaving.value = false
  }
}
</script>
