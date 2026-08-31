import { currentPeriodEdicts, filterEdicts } from './consultationFilters.js'
import { normalizeText } from '../lib/formatters.js'

export const ACTIVITY_OPTIONS = Object.freeze([
  { id: 'TEACHING_ASSISTANT', name: 'Monitoria' },
  { id: 'RESEARCH', name: 'Iniciação científica / pesquisa' },
  { id: 'EXTENSION_PROJECT', name: 'Projeto de extensão' },
  { id: 'EVENT_SPEAKER', name: 'Palestrante em evento / congresso' },
  { id: 'EVENT_ORGANIZER', name: 'Organização de evento / congresso' },
  { id: 'BOOK_ORGANIZER', name: 'Organização de livro' },
])

export const ACCESS_OPTIONS = Object.freeze([
  { id: 'DIRECT', name: 'Acesso direto' },
  { id: 'PREREQUISITE', name: 'Pré-requisito / ano adicional' },
])

export const RULE_STATUS_OPTIONS = Object.freeze([
  { id: 'POINTS_CONFIRMED', name: 'Pontuação prevista' },
  { id: 'REVIEW_REQUIRED', name: 'Regra com ressalva' },
  { id: 'NO_POINTS', name: 'Não pontua (expresso)' },
])

const activityNames = new Map(ACTIVITY_OPTIONS.map(({ id, name }) => [id, name]))
const statusOrder = new Map(RULE_STATUS_OPTIONS.map(({ id }, index) => [id, index]))
const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })

export function activityLabel(code) {
  return activityNames.get(code) ?? code ?? 'Atividade não informada'
}

function values(value) {
  return Array.isArray(value) ? value.map(String) : []
}

function numeric(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function curriculumScoreLabel(rule) {
  const score = rule?.scoring
  if (rule?.status === 'NO_POINTS') return 'Não pontua neste item'
  if (!score) return 'Pontuação não estruturada'
  const points = numeric(score.points_per_unit)
  const maximum = numeric(score.max_points)
  if (score.type === 'MANUAL') return 'Pontuação exige conferência'
  if (score.type === 'TIERS') {
    const tiers = (score.tiers ?? []).map((tier) => numeric(tier.points)).filter((value) => value != null)
    return tiers.length
      ? `Faixas de ${numberFormatter.format(Math.min(...tiers))} a ${numberFormatter.format(Math.max(...tiers))} ponto(s)`
      : 'Pontuação por faixa; confira as condições'
  }
  if (score.type === 'MAX_ONLY' || points == null) {
    return maximum == null
      ? 'Valor unitário não informado'
      : `Teto informado: ${numberFormatter.format(maximum)} ponto(s) · valor unitário não definido`
  }
  if (score.type === 'FIXED') return `${numberFormatter.format(points)} ponto(s) pela condição descrita`
  return `${numberFormatter.format(points)} ponto(s)${score.unit ? ` por ${score.unit}` : ''}`
}

function matchesAccess(rule, selected) {
  return !selected.length || selected.includes(rule.access_type)
    || (rule.access_type === 'BOTH' && selected.some((type) => ['DIRECT', 'PREREQUISITE'].includes(type)))
}

function belongsTo(rule, edict) {
  if (!edict.source_process_id || rule.source_process_id !== edict.source_process_id) return false
  return rule.edict_id == null || String(rule.edict_id) === String(edict.id)
}

function edictMatchesAccess(edict, selected, rules) {
  if (!selected.length) return true
  // A source-mapped rule takes precedence over older generic edict metadata.
  if (rules.some((rule) => belongsTo(rule, edict) && matchesAccess(rule, selected))) return true
  const raw = normalizeText(edict.access_type).trim()
  const access = ['direct', 'direto', 'acesso direto', 'entrada direta'].includes(raw) ? 'DIRECT'
    : ['prerequisite', 'pre-requisito', 'pre-requisitos', 'pre requisito', 'pre requisitos'].includes(raw) ? 'PREREQUISITE'
      : ['both', 'ambos', 'direto e pre-requisito'].includes(raw) ? 'BOTH' : null
  // Unknown metadata stays in the pending section; it never confirms a scope.
  return !access || matchesAccess({ access_type: access }, selected)
}

/** Planning locates source rules; it neither evaluates a CV nor adds scores. */
export function filterCurriculumPlanning(edicts = [], rules = [], filters = {}) {
  const edictIds = values(filters.edictIds)
  const institutionIds = values(filters.institutionIds)
  const entryYears = values(filters.entryYears)
  const activities = values(filters.activityCodes)
  const accesses = values(filters.accessTypes)
  const statuses = values(filters.statuses)
  const query = normalizeText(filters.query).trim()

  const eligibleEdicts = filterEdicts(currentPeriodEdicts(edicts), {
    ...filters,
    // MultiSelect IDs and API bigint IDs may differ in JS representation.
    edictIds: [],
    institutionIds: [],
  }).filter((edict) => (!edictIds.length || edictIds.includes(String(edict.id)))
    && (!institutionIds.length || institutionIds.includes(String(edict.institution_id)))
    && (!entryYears.length || entryYears.includes(String(edict.entry_year)))
    && edictMatchesAccess(edict, accesses, rules))
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')
      || Number(right.entry_year ?? 0) - Number(left.entry_year ?? 0)
      || String(left.id).localeCompare(String(right.id)))

  const contextualRules = rules.filter((rule) => statusOrder.has(rule.status)
    && (!activities.length || (rule.activity_codes ?? []).some((code) => activities.includes(code)))
    && matchesAccess(rule, accesses))

  const groups = []
  const unmappedEdicts = []
  for (const edict of eligibleEdicts) {
    const edictText = normalizeText(`${edict.name} ${edict.institution?.name ?? ''} ${edict.source_process_id}`)
    const seen = new Set()
    const located = contextualRules.filter((rule) => {
      if (!belongsTo(rule, edict) || seen.has(rule.source_rule_id)) return false
      seen.add(rule.source_rule_id)
      return true
    })
    // A mapped rule hidden by a status/text filter is NOT missing coverage.
    if (!located.length && (!query || edictText.includes(query))) unmappedEdicts.push(edict)
    const visible = located.filter((rule) => (!statuses.length || statuses.includes(rule.status))
      && (!query || edictText.includes(query) || normalizeText([
        rule.title, rule.source_item, rule.specialties_text,
        ...(rule.requirements ?? []), ...(rule.caveats ?? []),
        ...(rule.activity_codes ?? []).map(activityLabel),
      ].join(' ')).includes(query)))
      .sort((left, right) => statusOrder.get(left.status) - statusOrder.get(right.status)
        || left.title.localeCompare(right.title, 'pt-BR')
        || left.source_rule_id.localeCompare(right.source_rule_id))
    if (visible.length) groups.push({ edict, rules: visible })
  }
  return { groups, unmappedEdicts, ruleCount: groups.reduce((count, group) => count + group.rules.length, 0) }
}
