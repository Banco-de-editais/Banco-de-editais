<template>
  <div>
    <PageHeader title="Revistas" description="Gerencie periódicos, Qualis e suas bases de indexação." icon="journal" eyebrow="Administração">
      <template #actions>
        <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="openCreate"><AppIcon name="plus" class="h-5 w-5" />Nova revista</button>
      </template>
    </PageHeader>

    <p v-if="message" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ message }}</p>
    <p v-if="loadError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ loadError }}</p>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900" aria-label="Filtros de revistas">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SearchInput v-model="search" label="Buscar revista" placeholder="Nome ou ISSN..." />
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Qualis</span>
          <select v-model="qualisFilter" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-navy-500 focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-navy-950">
            <option value="">Todos</option>
            <option v-for="qualis in qualisOptions" :key="qualis" :value="qualis">{{ qualis }}</option>
          </select>
        </label>
        <MultiSelect v-model="indexerFilter" :options="indexers" label="Indexadores" placeholder="Todos os indexadores" />
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ordenação</span>
          <select v-model="sort" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-navy-500 focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-navy-950">
            <option value="name-asc">Nome: A–Z</option>
            <option value="name-desc">Nome: Z–A</option>
            <option value="qualis-asc">Qualis: B4–A1</option>
            <option value="qualis-desc">Qualis: A1–B4</option>
          </select>
        </label>
      </div>
      <div v-if="activeFilters" class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span class="text-xs font-semibold text-navy-700 dark:text-navy-300">{{ activeFilters }} filtro(s) ativo(s)</span>
        <button type="button" class="text-xs font-bold text-slate-500 hover:text-navy-700 dark:hover:text-navy-300" @click="clearFilters">Limpar filtros</button>
      </div>
    </section>

    <div class="mt-6">
      <LoadingCards v-if="isLoading" :count="6" wide />
      <EmptyState v-else-if="!filteredJournals.length" icon="journal" title="Nenhuma revista encontrada" description="Altere a busca ou os filtros, ou cadastre uma nova revista." />
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="journal in filteredJournals" :key="journal.id" class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-navy-400 to-navy-700"></div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300"><AppIcon name="journal" class="h-5 w-5" /></div>
              <div class="min-w-0">
                <h2 class="font-bold leading-5 text-slate-950 dark:text-white">{{ journal.name }}</h2>
                <p class="mt-1 text-xs text-slate-500">{{ journal.issn ? `ISSN ${journal.issn}` : 'ISSN não informado' }}</p>
              </div>
            </div>
            <span class="shrink-0 rounded-full bg-navy-100 px-2.5 py-1 text-xs font-bold text-navy-800 dark:bg-navy-950 dark:text-navy-200">{{ journal.qualis ?? 'Sem Qualis' }}</span>
          </div>
          <div class="mt-5 min-h-14">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Indexadores</p>
            <div v-if="journal.indexers.length" class="mt-2 flex flex-wrap gap-2">
              <span v-for="indexer in journal.indexers" :key="indexer.id" class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ indexer.name }}</span>
            </div>
            <p v-else class="mt-2 text-sm text-slate-500">Nenhum associado</p>
          </div>
          <div class="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-navy-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="openEdit(journal)"><AppIcon name="edit" class="h-4 w-4" />Editar</button>
            <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" @click="openDelete(journal)"><AppIcon name="trash" class="h-4 w-4" />Excluir</button>
          </div>
        </article>
      </div>
    </div>

    <BaseModal :open="formOpen" :title="editing ? 'Editar revista' : 'Nova revista'" description="Informe os dados do periódico. O ISSN, o Qualis e os indexadores são opcionais." :busy="isSaving" size="lg" @close="closeForm">
      <form class="space-y-5 p-5 sm:p-6" @submit.prevent="save">
        <p v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ formError }}</p>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label class="block sm:col-span-2">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</span>
            <input v-model.trim="form.name" type="text" required autofocus class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSaving" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">ISSN <span class="font-normal text-slate-400">(opcional)</span></span>
            <input v-model.trim="form.issn" type="text" placeholder="0000-0000" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSaving" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Qualis <span class="font-normal text-slate-400">(opcional)</span></span>
            <select v-model="form.qualis" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" :disabled="isSaving">
              <option value="">Sem Qualis</option>
              <option v-for="qualis in qualisOptions" :key="qualis" :value="qualis">{{ qualis }}</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend class="text-sm font-semibold text-slate-700 dark:text-slate-200">Indexadores</legend>
          <p class="mt-1 text-xs text-slate-500">Selecione todas as bases nas quais esta revista está indexada.</p>
          <div class="mt-3 grid max-h-60 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800/60">
            <label v-for="indexer in indexers" :key="indexer.id" class="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
              <input v-model="form.indexerIds" type="checkbox" :value="indexer.id" class="h-4 w-4 accent-navy-600" :disabled="isSaving" />{{ indexer.name }}
            </label>
            <p v-if="!indexers.length" class="p-3 text-sm text-slate-500 sm:col-span-2">Cadastre indexadores antes de associá-los.</p>
          </div>
        </fieldset>
        <footer class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isSaving" @click="closeForm">Cancelar</button>
          <button type="submit" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-60" :disabled="isSaving || !isFormValid">{{ isSaving ? 'Salvando...' : 'Salvar revista' }}</button>
        </footer>
      </form>
    </BaseModal>

    <ConfirmDialog :open="Boolean(deleting)" title="Excluir revista?" description="A revista e suas associações com indexadores serão removidas." resource-label="Revista" :resource-name="deleting?.name ?? ''" confirm-label="Excluir revista" :busy="isDeleting" :error="deleteError" @close="closeDelete" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingCards from '@/components/ui/LoadingCards.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { compareOptionalQualis, isQualisLevel, QUALIS_LEVELS } from '@/domain/qualis'
import { normalizeText } from '@/lib/formatters'
import { indexersService } from '@/services/simpleEntities'
import { createJournal, deleteJournal, listJournals, updateJournal } from '@/services/journals'

const journals = ref([])
const indexers = ref([])
const isLoading = ref(true)
const loadError = ref('')
const message = ref('')
const search = ref('')
const qualisFilter = ref('')
const indexerFilter = ref([])
const sort = ref('name-asc')
const formOpen = ref(false)
const editing = ref(null)
const isSaving = ref(false)
const formError = ref('')
const deleting = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')
const form = reactive({ name: '', issn: '', qualis: '', indexerIds: [] })

const qualisOptions = QUALIS_LEVELS
const activeFilters = computed(() => Number(Boolean(search.value)) + Number(Boolean(qualisFilter.value)) + indexerFilter.value.length)
const isFormValid = computed(() => form.name.trim() && (!form.qualis || isQualisLevel(form.qualis)))
const filteredJournals = computed(() => {
  const term = normalizeText(search.value)
  const [field, direction] = sort.value.split('-')
  const multiplier = direction === 'asc' ? 1 : -1
  return journals.value
    .filter((item) => (!term || normalizeText(`${item.name} ${item.issn ?? ''}`).includes(term))
      && (!qualisFilter.value || item.qualis === qualisFilter.value)
      && (!indexerFilter.value.length || indexerFilter.value.every((id) => item.indexerIds.includes(id))))
    .sort((a, b) => (field === 'qualis'
      ? compareOptionalQualis(a.qualis, b.qualis, direction)
      : a.name.localeCompare(b.name, 'pt-BR') * multiplier))
})

async function load() {
  isLoading.value = true
  loadError.value = ''
  try { [journals.value, indexers.value] = await Promise.all([listJournals(), indexersService.list()]) } catch (error) { loadError.value = error.message } finally { isLoading.value = false }
}
function clearFilters() { search.value = ''; qualisFilter.value = ''; indexerFilter.value = [] }
function resetForm(journal = null) {
  editing.value = journal
  Object.assign(form, { name: journal?.name ?? '', issn: journal?.issn ?? '', qualis: journal?.qualis ?? '', indexerIds: [...(journal?.indexerIds ?? [])] })
  formError.value = ''
}
function openCreate() { resetForm(); formOpen.value = true }
function openEdit(journal) { resetForm(journal); formOpen.value = true }
function closeForm() { if (!isSaving.value) formOpen.value = false }
async function save() {
  if (isSaving.value || !isFormValid.value) return
  isSaving.value = true
  formError.value = ''
  const payload = { name: form.name.trim(), issn: form.issn.trim(), qualis: form.qualis, indexerIds: [...form.indexerIds] }
  try {
    if (editing.value) { await updateJournal(editing.value.id, payload); message.value = 'Revista atualizada com sucesso.' }
    else { await createJournal(payload); message.value = 'Revista cadastrada com sucesso.' }
    formOpen.value = false
    await load()
  } catch (error) { formError.value = error.message } finally { isSaving.value = false }
}
function openDelete(journal) { deleting.value = journal; deleteError.value = '' }
function closeDelete() { if (!isDeleting.value) deleting.value = null }
async function confirmDelete() {
  if (!deleting.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try { await deleteJournal(deleting.value.id); deleting.value = null; message.value = 'Revista excluída com sucesso.'; await load() }
  catch (error) { deleteError.value = error.message } finally { isDeleting.value = false }
}
onMounted(load)
</script>
