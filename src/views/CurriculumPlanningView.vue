<template>
  <div>
    <PageHeader title="Planejamento curricular" description="Encontre as atividades previstas nos editais, suas pontuações, requisitos e limites para planejar o currículo." icon="calendar" eyebrow="Explorar oportunidades" />

    <aside class="mb-6 flex items-start gap-3 rounded-2xl border border-navy-200 bg-navy-50 p-4 text-navy-900 dark:border-navy-900 dark:bg-navy-950/45 dark:text-navy-200" aria-label="Como interpretar o planejamento">
      <AppIcon name="info" class="mt-0.5 h-5 w-5 shrink-0" />
      <div class="min-w-0 text-sm leading-6">
        <p class="font-bold">Estas situações descrevem a regra do edital, não a sua compatibilidade pessoal.</p>
        <p class="mt-1">A pontuação depende dos requisitos, comprovantes e da ficha aplicável. Uma regra com várias atividades aparece uma única vez; os pontos não são somados automaticamente.</p>
      </div>
    </aside>

    <div v-if="isLoading" class="space-y-5" role="status" aria-live="polite" aria-label="Carregando planejamento curricular">
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando editais e regras curriculares…</p>
      <div class="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none dark:bg-slate-800"></div>
      <div class="grid gap-4 sm:grid-cols-2"><div v-for="item in 2" :key="item" class="h-60 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none dark:bg-slate-800"></div></div>
    </div>

    <section v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30" role="alert">
      <h2 class="font-bold text-red-900 dark:text-red-200">Não foi possível carregar o planejamento</h2>
      <p class="mt-2 text-sm leading-6 text-red-800 dark:text-red-300">{{ loadError }}</p>
      <p class="mt-2 text-sm leading-6 text-red-800 dark:text-red-300">Uma falha de carregamento não significa que os editais não pontuem essas atividades.</p>
      <button type="button" class="mt-4 min-h-11 rounded-xl bg-red-800 px-4 text-sm font-bold text-white transition hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 dark:bg-red-700 dark:hover:bg-red-600" @click="loadData">Tentar novamente</button>
    </section>

    <template v-else>
      <p v-if="!release" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200" role="status">Ainda não há uma versão publicada de regras curriculares. Os editais disponíveis podem ser filtrados e aparecem na cobertura pendente; nenhuma pontuação será presumida.</p>
      <section class="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-labelledby="planning-filters-title">
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="planning-filters-title" class="flex items-center gap-2 font-bold text-slate-950 dark:text-white"><AppIcon name="filter" class="h-5 w-5 text-navy-600 dark:text-navy-300" />Filtros de planejamento</h2>
            <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Todos opcionais. Os resultados se atualizam ao selecionar; várias opções no mesmo campo ampliam o recorte.</p>
          </div>
          <button type="button" class="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy-700 transition hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-navy-300 dark:hover:bg-navy-950" :disabled="!hasFilters" @click="clearFilters"><AppIcon name="close" class="h-4 w-4" />Limpar filtros</button>
        </div>

        <form class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" @submit.prevent>
          <MultiSelect v-model="filters.activityCodes" :options="ACTIVITY_OPTIONS" label="Atividade curricular" placeholder="Todas as atividades" searchable search-placeholder="Pesquisar atividade..." />
          <MultiSelect v-model="filters.edictIds" :options="edictOptions" label="Nome do edital" placeholder="Todos os editais" searchable search-placeholder="Pesquisar edital..." />
          <MultiSelect v-model="filters.institutionIds" :options="institutionOptions" label="Instituição coordenadora" placeholder="Todas as coordenadoras" searchable search-placeholder="Pesquisar instituição..." />
          <MultiSelect v-model="filters.stateCodes" :options="stateOptions" label="Estado" placeholder="Todos os estados" searchable search-placeholder="Pesquisar estado..." />
          <MultiSelect v-model="filters.regionCodes" :options="regionOptions" label="Região" placeholder="Todas as regiões" searchable search-placeholder="Pesquisar região..." />
          <MultiSelect v-model="filters.entryYears" :options="entryYearOptions" label="Ano de ingresso" placeholder="Todos a partir de 2025" searchable search-placeholder="Pesquisar ano..." />
          <MultiSelect v-model="filters.accessTypes" :options="ACCESS_OPTIONS" label="Tipo de acesso" placeholder="Todos os tipos de acesso" />
          <MultiSelect v-model="filters.statuses" :options="RULE_STATUS_OPTIONS" label="Situação da regra" placeholder="Todas as situações" />
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Pesquisar nas regras</span>
            <input v-model="filters.query" type="search" placeholder="Ex.: bolsa, semestre, pró-reitoria" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:ring-navy-950" />
          </label>
        </form>

        <div v-if="activeFilterChips.length" class="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800" aria-label="Filtros selecionados">
          <button v-for="chip in activeFilterChips" :key="`${chip.field}-${chip.id}`" type="button" class="inline-flex max-w-full items-center gap-2 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-800 transition hover:bg-navy-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 dark:bg-navy-950 dark:text-navy-200 dark:hover:bg-navy-900" :aria-label="`Remover filtro ${chip.label}`" @click="removeFilter(chip)">
            <span class="min-w-0 break-words">{{ chip.label }}</span><AppIcon name="close" class="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </section>

      <section aria-labelledby="planning-results-title">
        <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="planning-results-title" class="text-xl font-black text-slate-950 dark:text-white">Regras neste recorte</h2>
            <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400" role="status" aria-live="polite">{{ results.ruleCount }} regra(s) em {{ results.groups.length }} edital(is). {{ results.unmappedEdicts.length }} edital(is) sem regra mapeada no recorte.</p>
            <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Ordem por nome do edital e ano de ingresso. Pontos de escalas diferentes não formam um ranking.</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Ingresso 2025 em diante</span>
        </header>

        <div class="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500 dark:text-slate-400" aria-label="Legenda das situações">
          <p><span class="font-bold text-navy-800 dark:text-navy-200">Pontuação prevista:</span> critério e pontuação identificados.</p>
          <p><span class="font-bold text-amber-800 dark:text-amber-200">Regra com ressalva:</span> depende de conferência específica.</p>
          <p><span class="font-bold text-slate-700 dark:text-slate-200">Não pontua (expresso):</span> exclusão declarada na fonte.</p>
        </div>

        <EmptyState v-if="!results.groups.length" icon="search" title="Nenhuma regra mapeada corresponde aos filtros" description="Altere o recorte ou consulte a cobertura abaixo. A ausência de uma regra aqui não permite concluir que a atividade vale zero pontos.">
          <button v-if="hasFilters" type="button" class="mt-5 min-h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white transition hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-500" @click="clearFilters">Ver todos os editais e atividades</button>
        </EmptyState>

        <div v-else class="space-y-8">
          <section v-for="group in results.groups" :key="group.edict.id" :aria-labelledby="`planning-edict-${group.edict.id}`">
            <header class="mb-4 rounded-xl border-l-4 border-navy-400 bg-slate-100/80 px-4 py-4 dark:border-navy-500 dark:bg-slate-800/45">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold uppercase leading-5 tracking-wide text-navy-700 dark:text-navy-300">{{ group.edict.institution?.name || 'Coordenadora não informada' }}</p>
                  <h3 :id="`planning-edict-${group.edict.id}`" class="mt-1 text-lg font-black leading-7 text-slate-950 dark:text-white">{{ group.edict.name }}</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Ingresso {{ group.edict.entry_year || 'não informado' }} · {{ geographicLabel(group.edict) }} · {{ group.rules.length }} regra(s)</p>
                </div>
                <a v-if="safeExternalUrl(group.edict.source_url)" :href="safeExternalUrl(group.edict.source_url)" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-navy-800 transition hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 dark:border-slate-700 dark:bg-slate-900 dark:text-navy-200 dark:hover:bg-slate-800"><AppIcon name="external" class="h-4 w-4" />Página do edital</a>
              </div>
              <p v-if="hasCurriculumContext(group.edict)" class="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400"><span class="font-semibold">Contexto curricular informado no cadastro:</span> {{ curriculumContext(group.edict) }}. Não representa a soma das regras abaixo; confira a ficha e o tipo de acesso.</p>
            </header>
            <div class="grid items-start gap-4 xl:grid-cols-2">
              <CurriculumRuleCard v-for="rule in group.rules" :key="rule.source_rule_id" :rule="rule" />
            </div>
          </section>
        </div>
      </section>

      <details class="mt-8 rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900" :open="!results.groups.length">
        <summary class="cursor-pointer rounded-2xl px-5 py-4 text-sm font-bold leading-6 text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 dark:text-slate-100">Sem regra mapeada neste recorte <span class="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{{ results.unmappedEdicts.length }}</span></summary>
        <div class="border-t border-slate-200 px-5 pb-5 pt-4 dark:border-slate-800">
          <p class="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Estes editais ainda não têm uma regra curricular mapeada para as atividades e o tipo de acesso selecionados. Isso pode indicar cobertura ainda não auditada ou parcial; <span class="font-bold">não significa ausência de pontuação</span>. Consulte a fonte antes de descartar um edital.</p>
          <p v-if="filters.query.trim()" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Nesta lista sem regras, a busca por texto considera apenas o nome do edital, a coordenadora e o identificador do processo. Limpe o texto para visualizar toda a cobertura pendente do recorte.</p>
          <ul v-if="results.unmappedEdicts.length" class="mt-4 grid gap-3 sm:grid-cols-2">
            <li v-for="edict in results.unmappedEdicts" :key="edict.id" class="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ edict.institution?.name || 'Coordenadora não informada' }}</p>
              <h3 class="mt-1 text-sm font-bold leading-6 text-slate-800 dark:text-slate-100">{{ edict.name }}</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Ingresso {{ edict.entry_year || 'não informado' }} · {{ geographicLabel(edict) }}</p>
              <a v-if="safeExternalUrl(edict.source_url)" :href="safeExternalUrl(edict.source_url)" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex min-h-9 items-center gap-2 text-xs font-bold text-navy-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 dark:text-navy-300"><AppIcon name="external" class="h-3.5 w-3.5" />Consultar fonte do edital</a>
              <p v-else class="mt-2 text-xs text-slate-500 dark:text-slate-400">Link da fonte não disponível no cadastro.</p>
            </li>
          </ul>
          <p v-else class="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Nenhum edital sem mapeamento foi encontrado com os filtros atuais. Isso não garante cobertura integral de todas as atividades ou fichas.</p>
        </div>
      </details>

      <footer class="mt-7 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <template v-if="release">
          <p><span class="font-semibold">Conferência desta versão:</span> {{ formatDate(release.checked_at) }}<span v-if="release.description"> · {{ release.description }}</span></p>
          <p class="mt-1 break-all">Versão: {{ release.code }}</p>
        </template>
        <p v-else>Nenhuma versão de regras curriculares foi disponibilizada. Os editais sem cobertura permanecem listados acima.</p>
        <p class="mt-1">Fontes e datas ficam em cada regra. O edital vigente, suas retificações e a avaliação da banca prevalecem.</p>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import CurriculumRuleCard from '@/components/curriculum/CurriculumRuleCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { coordinatingInstitutionOptions, regionOptionsForEdicts, stateOptionsForEdicts } from '@/domain/consultationFilters'
import { ACCESS_OPTIONS, ACTIVITY_OPTIONS, RULE_STATUS_OPTIONS, filterCurriculumPlanning } from '@/domain/curriculumPlanning'
import { formatDate, safeExternalUrl } from '@/lib/formatters'
import { loadCurriculumPlanningData } from '@/services/curriculumPlanning'

const edicts = ref([])
const rules = ref([])
const release = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const filters = reactive({
  activityCodes: [], edictIds: [], institutionIds: [], stateCodes: [], regionCodes: [],
  entryYears: [], accessTypes: [], statuses: [], query: '',
})

const edictOptions = computed(() => edicts.value.map((edict) => ({ id: edict.id, name: edict.name })).sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')))
const institutionOptions = computed(() => coordinatingInstitutionOptions(edicts.value.map((edict) => ({
  ...edict,
  institution: edict.institution ? { ...edict.institution, id: edict.institution.id ?? edict.institution_id } : null,
}))))
const stateOptions = computed(() => stateOptionsForEdicts(edicts.value))
const regionOptions = computed(() => regionOptionsForEdicts(edicts.value))
const entryYearOptions = computed(() => [...new Set(edicts.value.map((edict) => Number(edict.entry_year)).filter((year) => Number.isInteger(year) && year >= 2025))]
  .sort((left, right) => right - left).map((year) => ({ id: year, name: String(year) })))
const results = computed(() => filterCurriculumPlanning(edicts.value, rules.value, filters))
const hasFilters = computed(() => Object.values(filters).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value.trim())))
const filterOptions = computed(() => ({
  activityCodes: ACTIVITY_OPTIONS,
  edictIds: edictOptions.value,
  institutionIds: institutionOptions.value,
  stateCodes: stateOptions.value,
  regionCodes: regionOptions.value,
  entryYears: entryYearOptions.value,
  accessTypes: ACCESS_OPTIONS,
  statuses: RULE_STATUS_OPTIONS,
}))
const activeFilterChips = computed(() => {
  const chips = []
  for (const [field, options] of Object.entries(filterOptions.value)) {
    for (const id of filters[field]) chips.push({ field, id, label: options.find((option) => option.id === id)?.name ?? String(id) })
  }
  if (filters.query.trim()) chips.push({ field: 'query', id: 'query', label: `Texto: ${filters.query.trim()}` })
  return chips
})

function clearFilters() {
  for (const field of Object.keys(filters)) filters[field] = field === 'query' ? '' : []
}

function removeFilter(chip) {
  if (chip.field === 'query') filters.query = ''
  else filters[chip.field] = filters[chip.field].filter((id) => id !== chip.id)
}

function geographicLabel(edict) {
  const stateName = stateOptions.value.find((item) => item.id === edict.state_reference)?.name ?? edict.state_reference
  const regionName = regionOptions.value.find((item) => item.id === edict.region)?.name ?? edict.region
  return [stateName, regionName].filter(Boolean).join(' · ') || 'Localidade não informada'
}

function hasCurriculumContext(edict) {
  return edict.curriculum_max_score != null || edict.curriculum_weight_percent != null
}

function curriculumContext(edict) {
  const parts = []
  const number = (value) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(Number(value))
  if (edict.curriculum_max_score != null) parts.push(`máximo de ${number(edict.curriculum_max_score)} pontos`)
  if (edict.curriculum_weight_percent != null) parts.push(`peso de ${number(edict.curriculum_weight_percent)}%`)
  return parts.join(' · ')
}

async function loadData() {
  if (isLoading.value && edicts.value.length) return
  isLoading.value = true
  loadError.value = ''
  try {
    const data = await loadCurriculumPlanningData()
    if (!Array.isArray(data?.edicts) || !Array.isArray(data?.rules)) throw new Error('A resposta de dados está incompleta. Tente carregar novamente.')
    edicts.value = data.edicts
    rules.value = data.rules
    release.value = data.release ?? null
  } catch (error) {
    loadError.value = error?.message || 'O serviço de dados não está disponível no momento.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>
