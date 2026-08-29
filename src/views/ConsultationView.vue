<template>
  <div>
    <PageHeader title="Consulta de compatibilidade" description="Compare os dados do trabalho com os critérios dos editais cadastrados." icon="consultation" eyebrow="Consulta principal" />

    <p v-if="route.query.access === 'denied'" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-200" role="alert">Sua conta não possui acesso à área administrativa.</p>
    <p v-if="loadError" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ loadError }}</p>

    <div v-if="isLoading" class="grid grid-cols-1 gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <div class="h-[34rem] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
      <div class="h-[34rem] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
    </div>

    <template v-else>
      <form class="grid grid-cols-1 gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]" @submit.prevent="runConsultation">
        <section class="self-start rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="work-data-title">
          <header class="border-b border-slate-200 p-5 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300"><AppIcon name="journal" class="h-5 w-5" /></div>
              <div><h2 id="work-data-title" class="font-bold text-slate-950 dark:text-white">Dados do trabalho</h2><p class="mt-0.5 text-xs text-slate-500">Todos os campos são opcionais</p></div>
            </div>
          </header>

          <div class="space-y-5 p-5">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de produção</span>
              <select v-model="article.productionType" :class="controlClasses">
                <option value="ARTICLE_PUBLICATION">Artigo / publicação</option>
                <option value="EVENT_PRESENTATION">Apresentação em evento</option>
                <option value="ABSTRACT_PROCEEDINGS">Resumo em anais</option>
                <option value="BOOK">Livro</option>
                <option value="CHAPTER">Capítulo de livro</option>
                <option value="SCIENTIFIC_PRODUCTION">Produção científica ampla</option>
              </select>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Revista / periódico</span>
              <select v-model="article.journalId" :class="controlClasses">
                <option value="">Selecionar revista (opcional)</option>
                <option v-for="journal in journals" :key="journal.id" :value="String(journal.id)">{{ journalOptionLabel(journal) }}</option>
              </select>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Qualis</span>
              <select v-model="article.qualis" :disabled="Boolean(selectedJournal)" :class="controlClasses">
                <option value="">Qualquer Qualis</option>
                <option v-for="qualis in qualisOptions" :key="qualis" :value="qualis">{{ qualis }}</option>
              </select>
            </label>

            <MultiSelect v-model="article.indexerIds" :options="selectableIndexers" label="Indexadores" placeholder="Qualquer indexador" :disabled="Boolean(selectedJournal)" />

            <details class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <summary class="cursor-pointer text-sm font-bold text-navy-800 dark:text-navy-200">Adicionar informações para reduzir incertezas</summary>
              <div class="mt-4 space-y-4">
                <label class="block"><span :class="dateLabelClasses">Papel de autoria</span><select v-model="article.authorshipRole" :class="controlClasses"><option value="">Não informado</option><option value="AUTHOR">Autor</option><option value="COAUTHOR">Coautor</option><option value="FIRST_AUTHOR">Primeiro autor</option><option value="PRESENTER">Apresentador</option></select></label>
                <div class="grid grid-cols-2 gap-3">
                  <label><span :class="dateLabelClasses">Número de autores</span><input v-model="article.authorCount" type="number" min="1" step="1" :class="controlClasses" /></label>
                  <label><span :class="dateLabelClasses">Primeiro autor?</span><select v-model="article.isFirstAuthor" :class="controlClasses"><option value="">Não informado</option><option value="true">Sim</option><option value="false">Não</option></select></label>
                </div>
                <label class="block"><span :class="dateLabelClasses">Data da publicação</span><input v-model="article.publicationDate" type="date" :class="controlClasses" /></label>
                <label class="block"><span :class="dateLabelClasses">Abrangência da publicação</span><select v-model="article.publicationScope" :class="controlClasses"><option value="">Não informada</option><option value="LOCAL">Local</option><option value="REGIONAL">Regional</option><option value="STATE">Estadual</option><option value="NATIONAL">Nacional</option><option value="INTERNATIONAL">Internacional</option></select></label>
              </div>
            </details>

            <div v-if="selectedJournal" class="rounded-xl border border-navy-200 bg-navy-50 p-4 dark:border-navy-900 dark:bg-navy-950/45">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase tracking-wide text-navy-600 dark:text-navy-300">Revista selecionada</p>
                  <p class="mt-1 truncate text-sm font-bold text-navy-900 dark:text-navy-100">{{ selectedJournal.name }}</p>
                  <p class="mt-1 text-xs text-navy-700 dark:text-navy-300">{{ journalMetadataLabel(selectedJournal) }}</p>
                </div>
                <button type="button" class="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-navy-200 bg-white/70 px-2.5 text-xs font-semibold text-navy-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-800 dark:bg-navy-950/60 dark:text-navy-200" aria-label="Remover revista selecionada" @click="removeJournal"><AppIcon name="close" class="h-3.5 w-3.5" />Remover</button>
              </div>
              <div class="mt-3 border-t border-navy-200/70 pt-3 dark:border-navy-800">
                <p class="text-[0.68rem] font-bold uppercase tracking-wide text-navy-600 dark:text-navy-300">Indexadores</p>
                <div v-if="selectedJournal.indexers.length" class="mt-2 flex flex-wrap gap-1.5">
                  <span v-for="indexer in selectedJournal.indexers" :key="indexer.id" class="rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-navy-800 dark:bg-navy-900 dark:text-navy-100">{{ indexer.name }}</span>
                </div>
                <p v-else class="mt-1 text-xs text-navy-700 dark:text-navy-300">Nenhum indexador associado</p>
              </div>
            </div>

            <button type="submit" class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"><AppIcon name="search" class="h-5 w-5" />Consultar editais</button>
          </div>
        </section>

        <div class="min-w-0 space-y-6">
          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="filters-title">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div><h2 id="filters-title" class="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><AppIcon name="filter" class="h-5 w-5 text-navy-600 dark:text-navy-300" />Filtros opcionais</h2><p class="mt-1 text-sm text-slate-500">Combine edital, instituição coordenadora e outros filtros para refinar o resultado.</p></div>
              <button v-if="activeFilterCount" type="button" class="text-xs font-bold text-navy-700 hover:underline dark:text-navy-300" @click="clearFilters">Limpar todos</button>
            </div>
            <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <MultiSelect v-model="filters.edictIds" :options="edictOptions" label="Nome do edital" placeholder="Todos os editais" searchable search-placeholder="Pesquisar nome do edital..." />
              <MultiSelect v-model="filters.institutionIds" :options="coordinatorOptions" label="Instituição coordenadora" placeholder="Todas as instituições coordenadoras" searchable search-placeholder="Pesquisar instituição coordenadora..." />
              <label class="flex min-h-11 items-center gap-3 self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800"><input v-model="filters.activeOnly" type="checkbox" class="h-5 w-5 accent-navy-600" /><span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Somente editais ativos</span></label>
              <details class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-3 dark:border-slate-700 dark:bg-slate-800/60">
                <summary class="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-navy-800 dark:text-navy-200"><span>Filtrar por datas (opcional)</span><span v-if="dateFilterCount" class="rounded-full bg-navy-100 px-2 py-0.5 text-[0.68rem] text-navy-700 dark:bg-navy-950 dark:text-navy-200">{{ dateFilterCount }} selecionado(s)</span></summary>
                <p class="mt-2 text-xs text-slate-500">Abra somente se quiser limitar os editais por prazo ou data de publicação.</p>
                <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <fieldset class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><legend class="px-1 text-sm font-bold text-slate-700 dark:text-slate-200">Prazo para aplicação</legend><div class="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2"><label><span :class="dateLabelClasses">De</span><input v-model="filters.deadlineFrom" type="date" :class="controlClasses" /></label><label><span :class="dateLabelClasses">Até</span><input v-model="filters.deadlineTo" type="date" :class="controlClasses" /></label></div></fieldset>
                  <fieldset class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><legend class="px-1 text-sm font-bold text-slate-700 dark:text-slate-200">Publicação do edital</legend><div class="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2"><label><span :class="dateLabelClasses">De</span><input v-model="filters.publishedFrom" type="date" :class="controlClasses" /></label><label><span :class="dateLabelClasses">Até</span><input v-model="filters.publishedTo" type="date" :class="controlClasses" /></label></div></fieldset>
                </div>
              </details>
            </div>
            <div v-if="filterChips.length" class="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button v-for="chip in filterChips" :key="chip.key" type="button" class="flex min-h-8 items-center gap-1.5 rounded-full bg-navy-50 px-3 text-xs font-semibold text-navy-800 hover:bg-navy-100 dark:bg-navy-950 dark:text-navy-200" :aria-label="`Remover filtro ${chip.label}`" @click="chip.remove">{{ chip.label }}<AppIcon name="close" class="h-3.5 w-3.5" /></button>
            </div>
          </section>

          <section aria-labelledby="results-title">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><h2 id="results-title" class="text-xl font-black text-slate-950 dark:text-white">Resultados da consulta</h2><p class="mt-1 text-sm text-slate-500">{{ resultSummary }}</p><p v-if="hasSearched && coveragePendingCount" class="mt-1 text-xs text-slate-400">Cobertura pendente: {{ coveragePendingBreakdown }}. Isso não significa que o trabalho é aceito.</p></div>
              <span v-if="hasSearched" class="rounded-full bg-navy-100 px-3 py-1.5 text-xs font-bold text-navy-800 dark:bg-navy-950 dark:text-navy-200">{{ visibleEdicts.length }} resultado(s)</span>
            </div>

            <EmptyState v-if="!hasSearched" icon="consultation" title="Consulte os editais" description="Informe os critérios desejados ou consulte sem parâmetros para visualizar todos os editais disponíveis." />
            <EmptyState v-else-if="!visibleEdicts.length" icon="search" title="Nenhum resultado seguro ou potencial" description="Os dados informados não atenderam às regras publicadas, ou os editais filtrados ainda não possuem regra científica normalizada." />
            <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article v-for="edict in visibleEdicts" :key="edict.id" class="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div class="absolute inset-x-0 top-0 h-1" :class="compatibilityAccentClass(edict.compatibility.status)"></div>
                <div class="flex items-start justify-between gap-3">
                  <p class="text-xs font-bold uppercase tracking-wide text-navy-600 dark:text-navy-300">{{ edict.institution?.name }}</p>
                  <span class="shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-bold" :class="compatibilityBadgeClass(edict.compatibility.status)">{{ compatibilityLabel(edict.compatibility.status) }}</span>
                </div>
                <h3 class="mt-2 text-lg font-black leading-6 text-slate-950 dark:text-white">{{ edict.name }}</h3>
                <dl class="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><div><dt class="text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Publicação</dt><dd class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ formatDate(edict.published_at) }}</dd></div><div><dt class="text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Deadline</dt><dd class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ formatDate(edict.application_deadline) }}</dd></div></dl>
                <ul class="mt-4 space-y-2"><li v-for="reason in edict.compatibility.reasons" :key="reason" class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" :class="compatibilityReasonClass(edict.compatibility.status)"><AppIcon :name="edict.compatibility.status === 'compatible' ? 'check' : 'warning'" class="h-3 w-3" /></span>{{ reason }}</li></ul>
                <details v-if="edict.compatibility.matchingRules.length" class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <summary class="cursor-pointer text-xs font-bold uppercase tracking-wide text-navy-700 dark:text-navy-300">Ver {{ edict.compatibility.matchingRules.length }} regra(s) relacionada(s)</summary>
                  <div class="mt-3 space-y-3">
                    <div v-for="rule in edict.compatibility.matchingRules.slice(0, 5)" :key="rule.source_rule_id" class="rounded-lg bg-white p-3 text-xs dark:bg-slate-900">
                      <div class="flex items-start justify-between gap-2"><p class="font-bold text-slate-900 dark:text-white">{{ scientificFamilyLabel(rule.family) }} · {{ rule.source_rule_id }}</p><span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.65rem] text-slate-500 dark:bg-slate-800">{{ rule.mapping_confidence }}</span></div>
                      <p class="mt-1 text-slate-600 dark:text-slate-300">{{ scientificScoreLabel(rule) }}</p>
                      <p class="mt-1 text-slate-500">{{ scientificRequirementLabel(rule) }}</p>
                      <p class="mt-1 font-semibold text-slate-500">{{ scientificScopeLabel(rule) }}</p>
                      <a v-if="safeExternalUrl(rule.evidence?.official_url)" :href="safeExternalUrl(rule.evidence.official_url)" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex font-bold text-navy-700 hover:underline dark:text-navy-300">Fonte oficial<span v-if="rule.evidence?.page"> · pág. {{ rule.evidence.page }}</span></a>
                    </div>
                    <p v-if="edict.compatibility.matchingRules.length > 5" class="text-xs font-semibold text-slate-500">Mais {{ edict.compatibility.matchingRules.length - 5 }} regra(s) no banco.</p>
                  </div>
                </details>
                <a v-if="safeExternalUrl(edict.source_url)" :href="safeExternalUrl(edict.source_url)" target="_blank" rel="noopener noreferrer" class="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-navy-50 text-sm font-bold text-navy-800 transition hover:bg-navy-100 dark:border-navy-900 dark:bg-navy-950 dark:text-navy-200"><AppIcon name="external" class="h-4 w-4" />Ver edital</a>
              </article>
            </div>
          </section>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { coordinatingInstitutionOptions, filterEdicts } from '@/domain/consultationFilters'
import { evaluateEdictCompatibility } from '@/domain/edictCompatibility'
import { journalMetadataLabel, journalOptionLabel } from '@/domain/journals'
import { QUALIS_LEVELS } from '@/domain/qualis'
import { scientificFamilyLabel, scientificRequirementLabel, scientificScopeLabel, scientificScoreLabel } from '@/domain/scientificRules'
import { formatDate, safeExternalUrl } from '@/lib/formatters'
import { loadConsultationData } from '@/services/consultation'

const route = useRoute()
const journals = ref([])
const indexers = ref([])
const institutions = ref([])
const edicts = ref([])
const isLoading = ref(true)
const loadError = ref('')
const hasSearched = ref(false)
const article = reactive({
  productionType: 'ARTICLE_PUBLICATION',
  journalId: '',
  qualis: '',
  indexerIds: [],
  authorshipRole: '',
  authorCount: '',
  isFirstAuthor: '',
  publicationDate: '',
  publicationScope: '',
})
const filters = reactive({ edictIds: [], institutionIds: [], activeOnly: true, deadlineFrom: '', deadlineTo: '', publishedFrom: '', publishedTo: '' })
const qualisOptions = QUALIS_LEVELS
const controlClasses = 'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950'
const dateLabelClasses = 'mb-1.5 block text-xs font-semibold text-slate-500'

const selectedJournal = computed(() => journals.value.find((item) => String(item.id) === article.journalId) ?? null)
const selectableIndexers = computed(() => indexers.value.filter((item) => item.exact_match_allowed !== false))
const edictOptions = computed(() => edicts.value
  .map((edict) => ({ id: edict.id, name: edict.name }))
  .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')))
const coordinatorOptions = computed(() => coordinatingInstitutionOptions(edicts.value))
const dateFilterCount = computed(() => ['deadlineFrom', 'deadlineTo', 'publishedFrom', 'publishedTo'].filter((key) => filters[key]).length)
const activeFilterCount = computed(() => filters.edictIds.length + filters.institutionIds.length + Number(filters.activeOnly) + dateFilterCount.value)

const dateFilteredEdicts = computed(() => filterEdicts(edicts.value, filters))

const workInput = computed(() => ({
  ...article,
  indexerCodes: article.indexerIds
    .map((id) => indexers.value.find((item) => item.id === id)?.code)
    .filter(Boolean),
  indexerCodesKnown: Boolean(selectedJournal.value) || article.indexerIds.length > 0,
  isFirstAuthor: article.isFirstAuthor === '' ? undefined : article.isFirstAuthor === 'true',
}))

const evaluatedEdicts = computed(() => dateFilteredEdicts.value.map((edict) => ({
  ...edict,
  compatibility: evaluateEdictCompatibility(edict, workInput.value),
})))
const visibleEdicts = computed(() => hasSearched.value
  ? evaluatedEdicts.value.filter((edict) => ['compatible', 'insufficient_data', 'review_required'].includes(edict.compatibility.status))
  : [])
const compatibleCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.compatibility.status === 'compatible').length)
const insufficientCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.compatibility.status === 'insufficient_data').length)
const reviewCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.compatibility.status === 'review_required').length)
const noScientificScoringCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.compatibility.status === 'no_scientific_scoring').length)
const noArticleScoringCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.coverage_status === 'NO_ARTICLE_SCORING').length)
const coveragePendingCount = computed(() => evaluatedEdicts.value.filter((edict) => edict.compatibility.status === 'coverage_pending').length)
const coverageStatusLabels = {
  NOT_LOCATED: 'fonte/regra não localizada',
  SOURCE_NOT_LOCATED: 'fonte/regra não localizada',
  SOURCE_PENDING_PUBLICATION: 'edital ainda não publicado',
  NOT_EXTRACTED: 'fonte encontrada, extração pendente',
  EXTRACTION_PENDING: 'fonte encontrada, extração pendente',
  EXTRACTED_NOT_MAPPED: 'extraído, mapeamento pendente',
  MAPPING_PENDING: 'extraído, mapeamento pendente',
  RULES_BLOCKED: 'regra vaga ou conflitante',
  MANUAL_RULE_ONLY: 'regra somente manual',
  PARTIAL: 'cobertura parcial',
  PARTIAL_RULES: 'cobertura parcial',
}
const coveragePendingBreakdown = computed(() => {
  const counts = new Map()
  evaluatedEdicts.value
    .filter((edict) => edict.compatibility.status === 'coverage_pending')
    .forEach((edict) => {
      const label = coverageStatusLabels[edict.coverage_status] ?? 'revisão de cobertura pendente'
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'pt-BR'))
    .map(([label, count]) => `${count} ${label}`)
    .join(', ')
})
const resultSummary = computed(() => hasSearched.value
  ? `${compatibleCount.value} compatível(is), ${insufficientCount.value} precisam de dados, ${reviewCount.value} para conferir, ${noScientificScoringCount.value - noArticleScoringCount.value} sem pontuação científica, ${noArticleScoringCount.value} sem pontuação para artigo e ${coveragePendingCount.value} com cobertura pendente.`
  : 'Os resultados aparecerão após a consulta.')

const filterChips = computed(() => {
  const chips = []
  filters.edictIds.forEach((id) => {
    const name = edicts.value.find((item) => item.id === id)?.name
    if (name) chips.push({ key: `edict-${id}`, label: `Edital: ${name}`, remove: () => { filters.edictIds = filters.edictIds.filter((value) => value !== id) } })
  })
  filters.institutionIds.forEach((id) => {
    const name = institutions.value.find((item) => item.id === id)?.name
    if (name) chips.push({ key: `institution-${id}`, label: `Instituição: ${name}`, remove: () => { filters.institutionIds = filters.institutionIds.filter((value) => value !== id) } })
  })
  if (filters.activeOnly) chips.push({ key: 'active', label: 'Somente ativos', remove: () => { filters.activeOnly = false } })
  ;[['deadlineFrom', 'Deadline a partir de'], ['deadlineTo', 'Deadline até'], ['publishedFrom', 'Publicação a partir de'], ['publishedTo', 'Publicação até']].forEach(([key, label]) => {
    if (filters[key]) chips.push({ key, label: `${label}: ${formatDate(filters[key])}`, remove: () => { filters[key] = '' } })
  })
  return chips
})

function clearFilters() { Object.assign(filters, { edictIds: [], institutionIds: [], activeOnly: false, deadlineFrom: '', deadlineTo: '', publishedFrom: '', publishedTo: '' }) }
function runConsultation() { hasSearched.value = true }
function removeJournal() { article.journalId = '' }
function compatibilityLabel(status) {
  if (status === 'compatible') return 'Compatível'
  if (status === 'insufficient_data') return 'Faltam dados'
  return 'Precisa conferir'
}
function compatibilityBadgeClass(status) {
  if (status === 'compatible') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'insufficient_data') return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
  return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
}
function compatibilityAccentClass(status) {
  if (status === 'compatible') return 'bg-linear-to-r from-emerald-400 to-navy-600'
  if (status === 'insufficient_data') return 'bg-linear-to-r from-sky-400 to-blue-600'
  return 'bg-linear-to-r from-amber-400 to-orange-500'
}
function compatibilityReasonClass(status) {
  if (status === 'compatible') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'insufficient_data') return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
}

watch(selectedJournal, (journal, previousJournal) => {
  if (journal) {
    article.qualis = journal.qualis
    article.indexerIds = [...journal.indexerIds]
  } else if (previousJournal) {
    article.qualis = ''
    article.indexerIds = []
  }
})

watch(article, () => { hasSearched.value = false }, { deep: true })

onMounted(async () => {
  try {
    const data = await loadConsultationData()
    institutions.value = data.institutions
    indexers.value = data.indexers
    journals.value = data.journals
    edicts.value = data.edicts
  } catch (error) { loadError.value = error.message } finally { isLoading.value = false }
})
</script>
