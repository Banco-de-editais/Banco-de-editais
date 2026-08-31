<template>
  <article class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-wrap gap-1.5">
        <span v-for="code in rule.activity_codes" :key="code" class="rounded-md bg-navy-50 px-2 py-1 text-xs font-semibold text-navy-800 dark:bg-navy-950 dark:text-navy-200">{{ activityLabel(code) }}</span>
      </div>
      <span class="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClasses">
        <AppIcon :name="rule.status === 'REVIEW_REQUIRED' ? 'warning' : 'info'" class="h-3.5 w-3.5 shrink-0" />
        {{ statusLabel }}
      </span>
    </div>

    <h4 class="mt-3 text-base font-bold leading-6 text-slate-950 dark:text-white">{{ rule.title }}</h4>
    <p class="mt-1 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
      {{ accessLabel }}<span v-if="rule.source_item"> · Item {{ rule.source_item }}</span>
    </p>
    <p v-if="rule.specialties_text" class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"><span class="font-semibold">Ficha / especialidades:</span> {{ rule.specialties_text }}</p>

    <div class="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/65">
      <p class="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pontuação prevista na regra</p>
      <p class="mt-1 text-base font-bold leading-6 text-navy-900 dark:text-navy-200">{{ curriculumScoreLabel(rule) }}</p>
      <p v-if="rule.scoring?.description" class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ rule.scoring.description }}</p>

      <dl v-if="hasItemLimits" class="mt-3 grid grid-cols-1 gap-3 border-t border-slate-200 pt-3 text-sm sm:grid-cols-2 dark:border-slate-700">
        <div v-if="rule.scoring?.max_points != null">
          <dt class="text-xs text-slate-500 dark:text-slate-400">Teto deste item</dt>
          <dd class="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{{ numberLabel(rule.scoring.max_points) }} ponto(s)</dd>
        </div>
        <div v-if="rule.scoring?.max_units != null">
          <dt class="text-xs text-slate-500 dark:text-slate-400">Limite de unidades</dt>
          <dd class="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{{ numberLabel(rule.scoring.max_units) }}<span v-if="rule.scoring?.unit"> · {{ unitLabel(rule.scoring.unit) }}</span></dd>
        </div>
      </dl>

      <div v-if="rule.scoring?.tiers?.length" class="mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="w-full text-left text-sm">
          <caption class="sr-only">Faixas de pontuação de {{ rule.title }}</caption>
          <thead class="bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr><th scope="col" class="px-3 py-2 font-semibold">Condição / faixa</th><th scope="col" class="px-3 py-2 text-right font-semibold">Pontos</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="(tier, index) in rule.scoring.tiers" :key="index">
              <th scope="row" class="px-3 py-2 font-normal leading-5 text-slate-700 dark:text-slate-200">{{ tier.label }}</th>
              <td class="px-3 py-2 text-right align-top font-semibold text-slate-800 dark:text-slate-100">{{ tier.points == null ? 'Não definida' : numberLabel(tier.points) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="rule.shared_caps?.length" class="mt-4 rounded-xl border border-navy-200 bg-navy-50/70 p-4 dark:border-navy-900 dark:bg-navy-950/45">
      <h5 class="text-sm font-bold text-navy-900 dark:text-navy-200">Tetos compartilhados</h5>
      <ul class="mt-2 space-y-2.5 text-sm leading-6 text-navy-900 dark:text-navy-200">
        <li v-for="(cap, index) in rule.shared_caps" :key="cap.code || index">
          <p><span class="font-semibold">{{ cap.label || 'Limite conjunto' }}:</span> {{ cap.max_points == null ? 'valor não definido na regra' : `${numberLabel(cap.max_points)} ponto(s)` }}.</p>
          <p v-if="cap.notes" class="text-xs leading-5 text-navy-700 dark:text-navy-300">{{ cap.notes }}</p>
        </li>
      </ul>
      <p class="mt-2 text-xs font-semibold leading-5 text-navy-700 dark:text-navy-300">Este teto também pode incluir outras atividades. Não some os máximos como limites independentes.</p>
    </div>

    <section v-if="rule.requirements?.length" class="mt-4">
      <h5 class="text-sm font-bold text-slate-800 dark:text-slate-100">Requisitos e comprovação</h5>
      <ul class="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <li v-for="(requirement, index) in rule.requirements" :key="index">{{ requirement }}</li>
      </ul>
    </section>

    <section v-if="rule.caveats?.length" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <h5 class="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200"><AppIcon name="warning" class="h-4 w-4 shrink-0" />Ressalvas da regra</h5>
      <ul class="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-amber-900 dark:text-amber-200">
        <li v-for="(caveat, index) in rule.caveats" :key="index">{{ caveat }}</li>
      </ul>
    </section>

    <footer class="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Fontes da regra · conferência em {{ formatDate(rule.checked_at) }}</p>
      <ul v-if="rule.evidence?.length" class="mt-2 space-y-2">
        <li v-for="(source, index) in rule.evidence" :key="`${source.url}-${index}`" class="min-w-0 text-sm">
          <a v-if="safeExternalUrl(source.url)" :href="safeExternalUrl(source.url)" target="_blank" rel="noopener noreferrer" class="inline-flex max-w-full items-start gap-2 font-semibold leading-6 text-navy-700 underline decoration-navy-200 underline-offset-4 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-500 dark:text-navy-300 dark:decoration-navy-800 dark:hover:text-navy-100">
            <AppIcon name="external" class="mt-1 h-4 w-4 shrink-0" /><span class="min-w-0 break-words">{{ source.title || 'Documento oficial' }}<span v-if="source.pages"> · pág. {{ pagesLabel(source.pages) }}</span></span>
          </a>
          <p v-else class="text-slate-500 dark:text-slate-400">{{ source.title || 'Documento da regra' }}<span v-if="source.pages"> · pág. {{ pagesLabel(source.pages) }}</span> · Link indisponível</p>
        </li>
      </ul>
      <p v-else class="mt-2 text-xs text-amber-700 dark:text-amber-300">Nenhuma fonte vinculada a esta regra.</p>
      <details class="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <summary class="cursor-pointer font-semibold">Identificação e rastreabilidade</summary>
        <p class="mt-2 break-all font-mono">{{ rule.source_rule_id }}</p>
        <p v-for="(source, index) in hashedSources" :key="index" class="mt-2 break-all leading-5"><span class="font-semibold">SHA-256 · {{ source.title || 'Documento oficial' }}:</span> {{ source.sha256 }}</p>
        <p v-if="!hashedSources.length" class="mt-2">Hash documental não informado nesta regra.</p>
      </details>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ACCESS_OPTIONS, RULE_STATUS_OPTIONS, activityLabel, curriculumScoreLabel } from '@/domain/curriculumPlanning'
import { formatDate, safeExternalUrl } from '@/lib/formatters'

const props = defineProps({ rule: { type: Object, required: true } })
const statusLabel = computed(() => RULE_STATUS_OPTIONS.find((item) => item.id === props.rule.status)?.name ?? 'Situação não informada')
const accessLabel = computed(() => props.rule.access_type === 'BOTH'
  ? 'Acesso direto e pré-requisito / ano adicional'
  : ACCESS_OPTIONS.find((item) => item.id === props.rule.access_type)?.name ?? 'Tipo de acesso não informado')
const hasItemLimits = computed(() => props.rule.scoring?.max_points != null || props.rule.scoring?.max_units != null)
const hashedSources = computed(() => (props.rule.evidence ?? []).filter((source) => source.sha256))
const statusClasses = computed(() => ({
  POINTS_CONFIRMED: 'bg-navy-100 text-navy-900 dark:bg-navy-950 dark:text-navy-200',
  REVIEW_REQUIRED: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  NO_POINTS: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
})[props.rule.status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')

function numberLabel(value) {
  if (value === null || value === undefined || value === '') return 'Não informado'
  const number = Number(value)
  return Number.isFinite(number) ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(number) : String(value)
}

function pagesLabel(pages) {
  return Array.isArray(pages) ? pages.join(', ') : pages
}

function unitLabel(unit) {
  return ({
    ITEM: 'item', SEMESTER: 'semestre', MONTH: 'mês', YEAR: 'ano', HOUR: 'hora',
    PROJECT: 'projeto', EVENT: 'evento', BOOK: 'livro', ACTIVITY: 'atividade', CERTIFICATE: 'certificado',
  })[unit] ?? unit
}
</script>
