<template>
  <div>
    <PageHeader title="Editais" description="Gerencie editais, instituições e critérios de compatibilidade." icon="edict" eyebrow="Administração">
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-navy-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-navy-300 dark:hover:bg-slate-800" @click="importOpen = true"><AppIcon name="plus" class="h-5 w-5" />Importar CSV</button>
          <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="openCreate"><AppIcon name="plus" class="h-5 w-5" />Novo edital</button>
        </div>
      </template>
    </PageHeader>

    <p v-if="message" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">{{ message }}</p>
    <p v-if="loadError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ loadError }}</p>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900" aria-label="Filtros de editais">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SearchInput v-model="filters.search" label="Buscar edital" placeholder="Pesquisar por nome..." />
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Instituição</span>
          <select v-model="filters.institutionId" :class="controlClasses"><option value="">Todas</option><option v-for="institution in institutions" :key="institution.id" :value="String(institution.id)">{{ institution.name }}</option></select>
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
          <select v-model="filters.active" :class="controlClasses"><option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select>
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ordenação</span>
          <select v-model="filters.sort" :class="controlClasses"><option value="deadline-asc">Deadline: mais próximo</option><option value="deadline-desc">Deadline: mais distante</option><option value="published-desc">Publicação: mais recente</option><option value="published-asc">Publicação: mais antiga</option><option value="name-asc">Nome: A–Z</option></select>
        </label>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 lg:grid-cols-2 dark:border-slate-800">
        <fieldset class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <legend class="px-1 text-sm font-bold text-slate-700 dark:text-slate-200">Data de publicação</legend>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-500">A partir de</span><input v-model="filters.publishedFrom" type="date" :class="controlClasses" /></label>
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-500">Até</span><input v-model="filters.publishedTo" type="date" :class="controlClasses" /></label>
          </div>
        </fieldset>
        <fieldset class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <legend class="px-1 text-sm font-bold text-slate-700 dark:text-slate-200">Deadline para aplicação</legend>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-500">A partir de</span><input v-model="filters.deadlineFrom" type="date" :class="controlClasses" /></label>
            <label class="block"><span class="mb-1.5 block text-xs font-semibold text-slate-500">Até</span><input v-model="filters.deadlineTo" type="date" :class="controlClasses" /></label>
          </div>
        </fieldset>
      </div>
      <div v-if="activeFilterCount" class="mt-4 flex items-center justify-between">
        <span class="text-xs font-semibold text-navy-700 dark:text-navy-300">{{ activeFilterCount }} filtro(s) ativo(s)</span>
        <button type="button" class="text-xs font-bold text-slate-500 hover:text-navy-700 dark:hover:text-navy-300" @click="clearFilters">Limpar filtros</button>
      </div>
    </section>

    <div class="mt-6">
      <LoadingCards v-if="isLoading" :count="6" wide />
      <EmptyState v-else-if="!filteredEdicts.length" icon="edict" title="Nenhum edital encontrado" description="Revise a busca, os períodos selecionados ou cadastre um novo edital." />
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="edict in filteredEdicts" :key="edict.id" class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div class="absolute inset-x-0 top-0 h-1" :class="edict.active ? 'bg-linear-to-r from-navy-400 to-navy-700' : 'bg-slate-400'"></div>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-wide text-navy-600 dark:text-navy-300">{{ edict.institution?.name ?? 'Instituição não encontrada' }}</p>
              <h2 class="mt-2 font-bold leading-5 text-slate-950 dark:text-white">{{ edict.name }}</h2>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold" :class="edict.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">{{ edict.active ? 'Ativo' : 'Inativo' }}</span>
          </div>

          <dl class="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div><dt class="text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Publicação</dt><dd class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ formatDate(edict.published_at) }}</dd></div>
            <div><dt class="text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Deadline</dt><dd class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ formatDate(edict.application_deadline) }}</dd></div>
          </dl>

          <div class="mt-4 min-h-20">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Critérios</p>
              <span class="rounded-md bg-navy-50 px-2 py-1 text-xs font-bold text-navy-700 dark:bg-navy-950 dark:text-navy-200">Qualis mínimo: {{ edict.minimum_qualis ?? 'não exigido' }}</span>
            </div>
            <div v-if="edict.indexers.length" class="mt-2 flex flex-wrap gap-1.5">
              <span v-for="indexer in edict.indexers" :key="indexer.id" class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ indexer.name }}</span>
            </div>
            <p v-else class="mt-2 text-xs text-slate-500">Sem exigência de indexador</p>
          </div>

          <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <a v-if="safeExternalUrl(edict.source_url)" :href="safeExternalUrl(edict.source_url)" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs font-bold text-navy-700 hover:underline dark:text-navy-300">Fonte<AppIcon name="external" class="h-3.5 w-3.5" /></a><span v-else></span>
            <div class="flex gap-2">
              <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-navy-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="openEdit(edict)"><AppIcon name="edit" class="h-4 w-4" />Editar</button>
              <button type="button" class="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" @click="openDelete(edict)"><AppIcon name="trash" class="h-4 w-4" />Excluir</button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <BaseModal :open="formOpen" :title="editing ? 'Editar edital' : 'Novo edital'" description="Informe os dados gerais e os critérios opcionais de compatibilidade." :busy="isFormBusy" size="xl" @close="closeForm">
      <form class="space-y-6 p-5 sm:p-6" @submit.prevent="save">
        <p v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ formError }}</p>

        <section aria-labelledby="general-data-title">
          <h3 id="general-data-title" class="text-base font-bold text-slate-950 dark:text-white">Dados gerais</h3>
          <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <div class="mb-2 flex items-center justify-between gap-3">
                <label for="edict-institution" class="text-sm font-semibold text-slate-700 dark:text-slate-200">Instituição</label>
                <button type="button" class="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-navy-700 transition hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-60 dark:text-navy-300 dark:hover:bg-navy-950" :disabled="isFormBusy" @click="newInstitutionOpen ? cancelInstitutionCreation() : openInstitutionCreation()"><AppIcon :name="newInstitutionOpen ? 'close' : 'plus'" class="h-3.5 w-3.5" />{{ newInstitutionOpen ? 'Cancelar cadastro' : 'Nova instituição' }}</button>
              </div>
              <select id="edict-institution" v-model.number="form.institution_id" required autofocus :class="controlClasses" :disabled="isFormBusy" @change="institutionFeedback = ''"><option disabled value="">Selecione uma instituição</option><option v-for="institution in institutions" :key="institution.id" :value="institution.id">{{ institution.name }}</option></select>
              <p v-if="institutionFeedback" class="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300" role="status">{{ institutionFeedback }}</p>

              <div v-if="newInstitutionOpen" class="mt-3 rounded-xl border border-navy-200 bg-navy-50 p-4 dark:border-navy-900 dark:bg-navy-950/40">
                <label for="new-institution-name" class="block text-sm font-semibold text-navy-900 dark:text-navy-100">Nome da nova instituição</label>
                <div class="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input id="new-institution-name" ref="institutionNameInput" v-model="newInstitutionName" type="text" maxlength="255" autocomplete="organization" placeholder="Nome oficial da instituição" :class="[controlClasses, 'px-4']" :disabled="isCreatingInstitution" @keydown.enter.prevent="createInstitution" />
                  <button type="button" class="h-11 shrink-0 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white transition hover:bg-navy-700 disabled:opacity-60" :disabled="isCreatingInstitution || !newInstitutionName.trim()" @click="createInstitution">{{ isCreatingInstitution ? 'Adicionando...' : 'Adicionar' }}</button>
                </div>
                <p v-if="institutionError" class="mt-2 text-xs font-semibold text-red-700 dark:text-red-300" role="alert">{{ institutionError }}</p>
              </div>
            </div>
            <label class="block sm:col-span-2"><span :class="labelClasses">Nome do edital</span><input v-model.trim="form.name" type="text" required :class="[controlClasses, 'px-4']" :disabled="isFormBusy" /></label>
            <label class="block"><span :class="labelClasses">Data de publicação</span><input v-model="form.published_at" type="date" :class="controlClasses" :disabled="isFormBusy" /></label>
            <label class="block"><span :class="labelClasses">Deadline para aplicação</span><input v-model="form.application_deadline" type="date" :min="form.published_at || undefined" :class="controlClasses" :disabled="isFormBusy" /></label>
            <label class="block sm:col-span-2"><span :class="labelClasses">URL da fonte</span><input v-model.trim="form.source_url" type="url" placeholder="https://..." :class="[controlClasses, 'px-4']" :disabled="isFormBusy" /></label>
            <label class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800/60"><input v-model="form.active" type="checkbox" class="mt-0.5 h-5 w-5 accent-navy-600" :disabled="isFormBusy" /><span><span class="block text-sm font-bold text-slate-900 dark:text-white">Edital ativo</span><span class="mt-1 block text-xs text-slate-500">Editais inativos continuam disponíveis para consulta administrativa.</span></span></label>
          </div>
        </section>

        <section class="border-t border-slate-200 pt-6 dark:border-slate-800" aria-labelledby="compatibility-title">
          <div><h3 id="compatibility-title" class="text-base font-bold text-slate-950 dark:text-white">Critérios de compatibilidade</h3><p class="mt-1 text-sm text-slate-500">Deixe um critério em branco quando ele não for exigido pelo edital.</p></div>
          <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label class="block">
              <span :class="labelClasses">Qualis mínimo</span>
              <select v-model="form.minimum_qualis" :class="controlClasses" :disabled="isFormBusy">
                <option value="">Sem exigência</option>
                <option v-for="qualis in qualisOptions" :key="qualis" :value="qualis">{{ qualis }}</option>
              </select>
            </label>
          </div>
          <fieldset class="mt-5">
            <legend class="text-sm font-semibold text-slate-700 dark:text-slate-200">Indexadores aceitos</legend>
            <p class="mt-1 text-xs text-slate-500">Quando houver mais de um, basta o trabalho atender a um dos indexadores selecionados.</p>
            <div class="mt-3 grid max-h-60 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800/60">
              <label v-for="indexer in indexers" :key="indexer.id" class="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200"><input v-model="form.indexerIds" type="checkbox" :value="indexer.id" class="h-4 w-4 accent-navy-600" :disabled="isFormBusy" />{{ indexer.name }}</label>
              <p v-if="!indexers.length" class="p-3 text-sm text-slate-500 sm:col-span-2">Nenhum indexador cadastrado.</p>
            </div>
          </fieldset>
        </section>

        <footer class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isFormBusy" @click="closeForm">Cancelar</button>
          <button type="submit" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-60" :disabled="isFormBusy || newInstitutionOpen || !isFormValid">{{ isSaving ? 'Salvando...' : 'Salvar edital' }}</button>
        </footer>
      </form>
    </BaseModal>

    <ConfirmDialog :open="Boolean(deleting)" title="Excluir edital?" description="O edital e suas associações com indexadores serão removidos permanentemente." resource-label="Edital" :resource-name="deleting?.name ?? ''" confirm-label="Excluir edital" :busy="isDeleting" :error="deleteError" @close="closeDelete" @confirm="confirmDelete" />
    <CsvImportModal :open="importOpen" @close="importOpen = false" @completed="handleImportCompleted" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CsvImportModal from '@/components/admin/CsvImportModal.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingCards from '@/components/ui/LoadingCards.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { QUALIS_LEVELS } from '@/domain/qualis'
import { formatDate, normalizeText, safeExternalUrl } from '@/lib/formatters'
import { createEdict, deleteEdict, listEdicts, updateEdict } from '@/services/edicts'
import { indexersService, institutionsService } from '@/services/simpleEntities'

const edicts = ref([])
const institutions = ref([])
const indexers = ref([])
const isLoading = ref(true)
const loadError = ref('')
const message = ref('')
const formOpen = ref(false)
const editing = ref(null)
const isSaving = ref(false)
const formError = ref('')
const newInstitutionOpen = ref(false)
const newInstitutionName = ref('')
const isCreatingInstitution = ref(false)
const institutionError = ref('')
const institutionFeedback = ref('')
const institutionNameInput = ref(null)
const deleting = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')
const importOpen = ref(false)
const filters = reactive({ search: '', institutionId: '', active: '', publishedFrom: '', publishedTo: '', deadlineFrom: '', deadlineTo: '', sort: 'deadline-asc' })
const form = reactive({ institution_id: '', name: '', published_at: '', application_deadline: '', source_url: '', active: true, minimum_qualis: '', indexerIds: [] })
const qualisOptions = QUALIS_LEVELS
const controlClasses = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950'
const labelClasses = 'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200'

const activeFilterCount = computed(() => ['search', 'institutionId', 'active', 'publishedFrom', 'publishedTo', 'deadlineFrom', 'deadlineTo'].filter((key) => filters[key]).length)
const isFormBusy = computed(() => isSaving.value || isCreatingInstitution.value)
const isFormValid = computed(() => form.institution_id
  && form.name.trim()
  && (!form.published_at || !form.application_deadline || form.application_deadline >= form.published_at)
  && (!form.source_url.trim() || safeExternalUrl(form.source_url)))
const filteredEdicts = computed(() => {
  const term = normalizeText(filters.search)
  const sorters = {
    'deadline-asc': (a, b) => (a.application_deadline || '9999').localeCompare(b.application_deadline || '9999'),
    'deadline-desc': (a, b) => (b.application_deadline || '').localeCompare(a.application_deadline || ''),
    'published-asc': (a, b) => (a.published_at || '9999').localeCompare(b.published_at || '9999'),
    'published-desc': (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
    'name-asc': (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  }
  return edicts.value.filter((edict) => (!term || normalizeText(edict.name).includes(term))
    && (!filters.institutionId || String(edict.institution_id) === filters.institutionId)
    && (!filters.active || String(edict.active) === filters.active)
    && (!filters.publishedFrom || (edict.published_at && edict.published_at >= filters.publishedFrom))
    && (!filters.publishedTo || (edict.published_at && edict.published_at <= filters.publishedTo))
    && (!filters.deadlineFrom || (edict.application_deadline && edict.application_deadline >= filters.deadlineFrom))
    && (!filters.deadlineTo || (edict.application_deadline && edict.application_deadline <= filters.deadlineTo)))
    .sort(sorters[filters.sort])
})

async function load() {
  isLoading.value = true
  loadError.value = ''
  try { [edicts.value, institutions.value, indexers.value] = await Promise.all([listEdicts(), institutionsService.list(), indexersService.list()]) } catch (error) { loadError.value = error.message } finally { isLoading.value = false }
}
function clearFilters() { Object.assign(filters, { search: '', institutionId: '', active: '', publishedFrom: '', publishedTo: '', deadlineFrom: '', deadlineTo: '' }) }
function resetInstitutionCreation() {
  newInstitutionOpen.value = false
  newInstitutionName.value = ''
  institutionError.value = ''
  institutionFeedback.value = ''
}
function resetForm(edict = null) {
  editing.value = edict
  Object.assign(form, {
    institution_id: edict?.institution_id ?? '',
    name: edict?.name ?? '',
    published_at: edict?.published_at ?? '',
    application_deadline: edict?.application_deadline ?? '',
    source_url: edict?.source_url ?? '',
    active: edict?.active ?? true,
    minimum_qualis: edict?.minimum_qualis ?? '',
    indexerIds: [...(edict?.indexerIds ?? [])],
  })
  formError.value = ''
  resetInstitutionCreation()
}
function openCreate() { resetForm(); formOpen.value = true }
function openEdit(edict) { resetForm(edict); formOpen.value = true }
function closeForm() { if (!isFormBusy.value) formOpen.value = false }
async function openInstitutionCreation() {
  newInstitutionOpen.value = true
  newInstitutionName.value = ''
  institutionError.value = ''
  institutionFeedback.value = ''
  await nextTick()
  institutionNameInput.value?.focus()
}
function cancelInstitutionCreation() {
  if (isCreatingInstitution.value) return
  newInstitutionOpen.value = false
  newInstitutionName.value = ''
  institutionError.value = ''
}
async function createInstitution() {
  const name = newInstitutionName.value.trim()
  if (!name || isCreatingInstitution.value) return

  isCreatingInstitution.value = true
  institutionError.value = ''
  try {
    const created = await institutionsService.create(name)
    institutions.value = [...institutions.value, created].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
    form.institution_id = created.id
    newInstitutionOpen.value = false
    newInstitutionName.value = ''
    institutionFeedback.value = `${created.name} foi criada e selecionada.`
  } catch (error) {
    institutionError.value = error.message
  } finally {
    isCreatingInstitution.value = false
  }
}
async function save() {
  if (isFormBusy.value || newInstitutionOpen.value || !isFormValid.value) return
  isSaving.value = true
  formError.value = ''
  try {
    if (editing.value) { await updateEdict(editing.value.id, form); message.value = 'Edital atualizado com sucesso.' }
    else { await createEdict(form); message.value = 'Edital cadastrado com sucesso.' }
    formOpen.value = false
    await load()
  } catch (error) { formError.value = error.message } finally { isSaving.value = false }
}
function openDelete(edict) { deleting.value = edict; deleteError.value = '' }
function closeDelete() { if (!isDeleting.value) deleting.value = null }
async function confirmDelete() {
  if (!deleting.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try { await deleteEdict(deleting.value.id); deleting.value = null; message.value = 'Edital excluído com sucesso.'; await load() }
  catch (error) { deleteError.value = error.message } finally { isDeleting.value = false }
}
async function handleImportCompleted(result) {
  message.value = `Importação concluída: ${result.institutions_created + result.indexers_created + result.journals_created + result.edicts_created} registro(s) criado(s).`
  await load()
}
onMounted(load)
</script>
