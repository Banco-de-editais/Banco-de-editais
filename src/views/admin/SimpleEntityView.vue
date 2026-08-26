<template>
  <div>
    <PageHeader :title="title" :description="description" :icon="icon" eyebrow="Administração">
      <template #actions>
        <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="openCreate">
          <AppIcon name="plus" class="h-5 w-5" />
          {{ createLabel }}
        </button>
      </template>
    </PageHeader>

    <p v-if="message" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ message }}</p>
    <p v-if="loadError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ loadError }}</p>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900" aria-label="Filtros">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
        <SearchInput v-model="search" :label="searchLabel" :placeholder="searchPlaceholder" />
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ordenação</span>
          <select v-model="sort" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-navy-950">
            <option value="asc">Nome: A–Z</option>
            <option value="desc">Nome: Z–A</option>
          </select>
        </label>
      </div>
    </section>

    <div class="mt-6">
      <LoadingCards v-if="isLoading" :count="6" />
      <EmptyState v-else-if="!filteredItems.length" :icon="icon" :title="search ? 'Nenhum resultado encontrado' : emptyTitle" :description="search ? 'Tente buscar por outro nome.' : emptyDescription" />
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="item in filteredItems" :key="item.id" class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-navy-400 to-navy-700"></div>
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300"><AppIcon :name="icon" class="h-5 w-5" /></div>
            <div class="min-w-0 flex-1">
              <h2 class="break-words font-bold text-slate-950 dark:text-white">{{ item.name }}</h2>
              <p class="mt-1 text-xs text-slate-500">ID {{ item.id }}</p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-navy-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-navy-300" :aria-label="`Editar ${item.name}`" @click="openEdit(item)"><AppIcon name="edit" class="h-4 w-4" />Editar</button>
            <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" :aria-label="`Excluir ${item.name}`" @click="openDelete(item)"><AppIcon name="trash" class="h-4 w-4" />Excluir</button>
          </div>
        </article>
      </div>
    </div>

    <BaseModal :open="formOpen" :title="editing ? editLabel : createLabel" :description="formDescription" :busy="isSaving" @close="closeForm">
      <form class="p-5 sm:p-6" @submit.prevent="save">
        <p v-if="formError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ formError }}</p>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</span>
          <input v-model.trim="formName" type="text" required autofocus class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSaving" />
        </label>
        <footer class="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isSaving" @click="closeForm">Cancelar</button>
          <button type="submit" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white transition hover:bg-navy-700 disabled:opacity-60" :disabled="isSaving || !formName.trim()">{{ isSaving ? 'Salvando...' : 'Salvar' }}</button>
        </footer>
      </form>
    </BaseModal>

    <ConfirmDialog :open="Boolean(deleting)" :title="deleteTitle" :description="deleteDescription" :resource-label="singular" :resource-name="deleting?.name ?? ''" confirm-label="Excluir" :busy="isDeleting" :error="deleteError" @close="closeDelete" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingCards from '@/components/ui/LoadingCards.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { normalizeText } from '@/lib/formatters'

const props = defineProps({
  title: { type: String, required: true }, description: { type: String, required: true }, icon: { type: String, required: true },
  singular: { type: String, required: true }, service: { type: Object, required: true }, createLabel: { type: String, required: true },
  editLabel: { type: String, required: true }, searchLabel: { type: String, required: true }, searchPlaceholder: { type: String, required: true },
  formDescription: { type: String, required: true }, emptyTitle: { type: String, required: true }, emptyDescription: { type: String, required: true },
  deleteTitle: { type: String, required: true }, deleteDescription: { type: String, required: true },
})
const items = ref([])
const isLoading = ref(true)
const loadError = ref('')
const message = ref('')
const search = ref('')
const sort = ref('asc')
const formOpen = ref(false)
const editing = ref(null)
const formName = ref('')
const formError = ref('')
const isSaving = ref(false)
const deleting = ref(null)
const deleteError = ref('')
const isDeleting = ref(false)

const filteredItems = computed(() => {
  const term = normalizeText(search.value)
  return items.value
    .filter((item) => !term || normalizeText(item.name).includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') * (sort.value === 'asc' ? 1 : -1))
})

async function load() {
  isLoading.value = true
  loadError.value = ''
  try { items.value = await props.service.list() } catch (error) { loadError.value = error.message } finally { isLoading.value = false }
}
function openCreate() { editing.value = null; formName.value = ''; formError.value = ''; formOpen.value = true }
function openEdit(item) { editing.value = item; formName.value = item.name; formError.value = ''; formOpen.value = true }
function closeForm() { if (!isSaving.value) formOpen.value = false }
async function save() {
  if (isSaving.value || !formName.value.trim()) return
  isSaving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await props.service.update(editing.value.id, formName.value.trim())
      message.value = `${props.singular} atualizado(a) com sucesso.`
    } else {
      await props.service.create(formName.value.trim())
      message.value = `${props.singular} cadastrado(a) com sucesso.`
    }
    formOpen.value = false
    await load()
  } catch (error) { formError.value = error.message } finally { isSaving.value = false }
}
function openDelete(item) { deleting.value = item; deleteError.value = '' }
function closeDelete() { if (!isDeleting.value) deleting.value = null }
async function confirmDelete() {
  if (!deleting.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await props.service.remove(deleting.value.id)
    message.value = `${props.singular} excluído(a) com sucesso.`
    deleting.value = null
    await load()
  } catch (error) { deleteError.value = error.message } finally { isDeleting.value = false }
}
onMounted(load)
</script>
