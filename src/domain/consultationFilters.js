export const MINIMUM_ENTRY_YEAR = 2025

export const COMPATIBILITY_STATUS_OPTIONS = Object.freeze([
  { id: 'compatible', name: 'Compatível' },
  { id: 'insufficient_data', name: 'Faltam dados' },
  { id: 'review_required', name: 'Precisa conferir' },
])

const COMPATIBILITY_STATUS_ORDER = new Map(
  COMPATIBILITY_STATUS_OPTIONS.map((option, index) => [option.id, index]),
)

const BRAZIL_STATE_NAMES = Object.freeze({
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
})

const BRAZIL_REGION_NAMES = Object.freeze({
  NORTE: 'Norte',
  NORDESTE: 'Nordeste',
  'CENTRO-OESTE': 'Centro-Oeste',
  SUDESTE: 'Sudeste',
  SUL: 'Sul',
})

function normalizeStateCode(value) {
  return String(value ?? '').trim().toUpperCase()
}

function normalizeRegionCode(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
}

export function isEdictInCurrentPeriod(edict = {}) {
  if (edict.entry_year === null || edict.entry_year === undefined || edict.entry_year === '') return true
  return Number(edict.entry_year) >= MINIMUM_ENTRY_YEAR
}

export function currentPeriodEdicts(edicts = []) {
  return edicts.filter(isEdictInCurrentPeriod)
}

export function filterEdicts(edicts = [], filters = {}) {
  const edictIds = Array.isArray(filters.edictIds) ? filters.edictIds : []
  const institutionIds = Array.isArray(filters.institutionIds) ? filters.institutionIds : []
  const stateCodes = Array.isArray(filters.stateCodes) ? filters.stateCodes.map(normalizeStateCode).filter(Boolean) : []
  const regionCodes = Array.isArray(filters.regionCodes) ? filters.regionCodes.map(normalizeRegionCode).filter(Boolean) : []

  return edicts.filter((edict) =>
    isEdictInCurrentPeriod(edict)
    && (!filters.activeOnly || edict.active)
    && (!edictIds.length || edictIds.includes(edict.id))
    && (!institutionIds.length || institutionIds.includes(edict.institution_id))
    && (!stateCodes.length || stateCodes.includes(normalizeStateCode(edict.state_reference)))
    && (!regionCodes.length || regionCodes.includes(normalizeRegionCode(edict.region)))
    && (!filters.deadlineFrom || (edict.application_deadline && edict.application_deadline >= filters.deadlineFrom))
    && (!filters.deadlineTo || (edict.application_deadline && edict.application_deadline <= filters.deadlineTo))
    && (!filters.publishedFrom || (edict.published_at && edict.published_at >= filters.publishedFrom))
    && (!filters.publishedTo || (edict.published_at && edict.published_at <= filters.publishedTo)))
}

export function filterCompatibilityResults(edicts = [], selectedStatuses = []) {
  const selected = new Set(
    (Array.isArray(selectedStatuses) ? selectedStatuses : [])
      .filter((status) => COMPATIBILITY_STATUS_ORDER.has(status)),
  )

  return edicts
    .map((edict, originalIndex) => ({ edict, originalIndex }))
    .filter(({ edict }) => {
      const status = edict.compatibility?.status
      return COMPATIBILITY_STATUS_ORDER.has(status) && (!selected.size || selected.has(status))
    })
    .sort((left, right) => {
      const statusDifference = COMPATIBILITY_STATUS_ORDER.get(left.edict.compatibility.status)
        - COMPATIBILITY_STATUS_ORDER.get(right.edict.compatibility.status)
      return statusDifference || left.originalIndex - right.originalIndex
    })
    .map(({ edict }) => edict)
}

export function coordinatingInstitutionOptions(edicts = []) {
  const byId = new Map()

  currentPeriodEdicts(edicts).forEach((edict) => {
    if (edict.institution?.id != null && edict.institution?.name) {
      byId.set(edict.institution.id, { id: edict.institution.id, name: edict.institution.name })
    }
  })

  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
}

export function stateOptionsForEdicts(edicts = []) {
  const stateCodes = new Set()

  currentPeriodEdicts(edicts).forEach((edict) => {
    const stateCode = normalizeStateCode(edict.state_reference)
    if (BRAZIL_STATE_NAMES[stateCode]) stateCodes.add(stateCode)
  })

  return [...stateCodes]
    .map((stateCode) => ({ id: stateCode, name: BRAZIL_STATE_NAMES[stateCode] }))
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
}

export function regionOptionsForEdicts(edicts = []) {
  const regionCodes = new Set()

  currentPeriodEdicts(edicts).forEach((edict) => {
    const regionCode = normalizeRegionCode(edict.region)
    if (BRAZIL_REGION_NAMES[regionCode]) regionCodes.add(regionCode)
  })

  return [...regionCodes]
    .map((regionCode) => ({ id: regionCode, name: BRAZIL_REGION_NAMES[regionCode] }))
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
}
