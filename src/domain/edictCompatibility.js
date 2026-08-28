import { compareQualis, isQualisLevel } from './qualis.js'

const TRUE = 'TRUE'
const FALSE = 'FALSE'
const UNKNOWN = 'UNKNOWN'

const PRODUCTION_PARENTS = {
  ARTICLE_PUBLICATION: 'SCIENTIFIC_PRODUCTION',
  BOOK_CHAPTER: 'SCIENTIFIC_PRODUCTION',
  BOOK: 'BOOK_CHAPTER',
  CHAPTER: 'BOOK_CHAPTER',
  ABSTRACT_PROCEEDINGS: 'SCIENTIFIC_PRODUCTION',
  EVENT_PRESENTATION: 'SCIENTIFIC_PRODUCTION',
}

function triAll(values) {
  if (values.some((value) => value === FALSE)) return FALSE
  if (values.some((value) => value === UNKNOWN)) return UNKNOWN
  return TRUE
}

function triAny(values) {
  if (values.some((value) => value === TRUE)) return TRUE
  if (values.some((value) => value === UNKNOWN)) return UNKNOWN
  return FALSE
}

function isDescendantOf(value, expectedParent) {
  let current = value
  while (PRODUCTION_PARENTS[current]) {
    current = PRODUCTION_PARENTS[current]
    if (current === expectedParent) return true
  }
  return false
}

function compareKnownValue(operator, observed, expected) {
  switch (operator) {
    case 'EQ':
      return observed === expected ? TRUE : FALSE
    case 'IN': {
      const expectedValues = Array.isArray(expected) ? expected : [expected]
      const observedValues = Array.isArray(observed) ? observed : [observed]
      return observedValues.some((value) => expectedValues.includes(value)) ? TRUE : FALSE
    }
    case 'IS_TRUE':
      return observed === true ? TRUE : FALSE
    case 'IS_FALSE':
      return observed === false ? TRUE : FALSE
    case 'LTE':
      return Number.isFinite(Number(observed)) && Number(observed) <= Number(expected) ? TRUE : FALSE
    case 'BETWEEN': {
      const limits = Array.isArray(expected)
        ? expected
        : [expected?.minimum ?? expected?.min, expected?.maximum ?? expected?.max]
      if (typeof observed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(observed)
        && limits.every((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
        return observed >= limits[0] && observed <= limits[1] ? TRUE : FALSE
      }
      const number = Number(observed)
      return Number.isFinite(number)
        && Number.isFinite(Number(limits[0]))
        && Number.isFinite(Number(limits[1]))
        && number >= Number(limits[0])
        && number <= Number(limits[1])
        ? TRUE
        : FALSE
    }
    case 'DESCENDANT_OF':
      return observed === expected || isDescendantOf(observed, expected) ? TRUE : FALSE
    case 'MANUAL':
      return UNKNOWN
    default:
      return UNKNOWN
  }
}

function evaluateCondition(condition, facts) {
  if (condition.operator === 'MANUAL') return UNKNOWN
  if (!(condition.field in facts)) return condition.required === false ? TRUE : UNKNOWN

  let result = compareKnownValue(condition.operator, facts[condition.field], condition.value)
  if (condition.negated && result !== UNKNOWN) result = result === TRUE ? FALSE : TRUE
  return result
}

function evaluateConditionTree(groups = [], facts = {}) {
  if (!groups.length) return TRUE
  const byCode = new Map(groups.map((group) => [group.code, group]))
  const children = new Map()
  const roots = []

  for (const group of groups) {
    if (group.parent) {
      const items = children.get(group.parent) ?? []
      items.push(group.code)
      children.set(group.parent, items)
    } else {
      roots.push(group.code)
    }
  }

  const visit = (code, active = new Set()) => {
    if (active.has(code) || !byCode.has(code)) return UNKNOWN
    const nextActive = new Set(active)
    nextActive.add(code)
    const group = byCode.get(code)
    const values = (group.conditions ?? []).map((condition) => evaluateCondition(condition, facts))
    for (const childCode of (children.get(code) ?? []).sort()) values.push(visit(childCode, nextActive))
    if (!values.length) return UNKNOWN
    return group.operator === 'ANY' ? triAny(values) : triAll(values)
  }

  if (!roots.length) return UNKNOWN
  return triAll(roots.sort().map((code) => visit(code)))
}

function evaluateSupplementalRequirements(rule, facts) {
  const values = []
  const fields = new Set(
    (rule.condition_groups ?? []).flatMap((group) => (group.conditions ?? []).map((condition) => condition.field)),
  )

  if ((rule.indexing_requirements ?? []).length && !fields.has('production.indexings')) {
    if (!('production.indexings' in facts)) {
      values.push(UNKNOWN)
    } else {
      const exact = rule.indexing_requirements.filter((item) => item.exact_match_allowed && item.operator !== 'MANUAL')
      const manual = rule.indexing_requirements.some((item) => !item.exact_match_allowed || item.operator === 'MANUAL')
      const matches = exact.some((item) => facts['production.indexings'].includes(item.base))
      values.push(matches ? TRUE : manual ? UNKNOWN : FALSE)
    }
  }

  const authorship = rule.authorship_requirement
  if (authorship?.roles?.length && !fields.has('production.authorship.role')) {
    values.push('production.authorship.role' in facts
      ? compareKnownValue('IN', facts['production.authorship.role'], authorship.roles)
      : UNKNOWN)
  }

  if (authorship?.author_limit != null && !fields.has('production.authorship.author_count')) {
    if ('production.authorship.author_count' in facts) {
      const withinLimit = compareKnownValue('LTE', facts['production.authorship.author_count'], authorship.author_limit)
      if (authorship.first_author_exception) {
        const firstAuthor = 'production.authorship.is_first_author' in facts
          ? compareKnownValue('IS_TRUE', facts['production.authorship.is_first_author'], true)
          : UNKNOWN
        values.push(triAny([withinLimit, firstAuthor]))
      } else {
        values.push(withinLimit)
      }
    } else {
      values.push(UNKNOWN)
    }
  }

  if (authorship?.presenter_required && !fields.has('production.authorship.is_presenter')) {
    values.push('production.authorship.is_presenter' in facts
      ? compareKnownValue('IS_TRUE', facts['production.authorship.is_presenter'], true)
      : UNKNOWN)
  }

  // Qualis sem área/período explícitos permanece manual no pacote auditado.
  if (rule.qualis_requirement) values.push(UNKNOWN)
  // Os formatos auditados dessas exigências ainda não têm comparadores
  // estruturados. Mesmo que o usuário informe um valor, não o promovemos a
  // verdadeiro sem uma regra exata e verificável.
  if (rule.date_window) values.push(UNKNOWN)
  if (rule.subject_area_requirement) values.push(UNKNOWN)

  return values.length ? triAll(values) : TRUE
}

function evaluateScientificRule(rule, facts) {
  return triAll([
    evaluateConditionTree(rule.condition_groups, facts),
    evaluateSupplementalRequirements(rule, facts),
  ])
}

function scientificFacts(work) {
  const facts = { 'production.type': work.productionType || 'ARTICLE_PUBLICATION' }
  if (work.publicationStatus) facts['production.publication_status'] = work.publicationStatus
  if (work.indexerCodes?.length) facts['production.indexings'] = [...new Set(work.indexerCodes)]
  if (work.authorshipRole) facts['production.authorship.role'] = work.authorshipRole
  if (work.authorCount !== '' && work.authorCount !== null && work.authorCount !== undefined) {
    facts['production.authorship.author_count'] = Number(work.authorCount)
  }
  if (typeof work.isFirstAuthor === 'boolean') facts['production.authorship.is_first_author'] = work.isFirstAuthor
  if (typeof work.hasDoi === 'boolean') facts['production.identifiers.doi'] = work.hasDoi
  if (typeof work.hasIssn === 'boolean') facts['production.identifiers.issn'] = work.hasIssn
  if (work.publicationScope) facts['production.publication.scope'] = work.publicationScope
  if (work.publicationDate) facts['production.publication_date'] = work.publicationDate
  return facts
}

function evaluateImportedEdict(edict, work) {
  const publishedRules = (edict.scientificRules ?? []).filter((rule) => rule.published_for_engine)
  if (!publishedRules.length) {
    return {
      compatible: false,
      evaluable: false,
      status: 'no_normalized_rule',
      reasons: ['Sem regra científica normalizada e publicada; não é seguro concluir compatibilidade.'],
      matchingRules: [],
    }
  }

  const productionType = work.productionType || 'ARTICLE_PUBLICATION'
  const applicableRules = publishedRules.filter((rule) =>
    (rule.accepted_production_types ?? []).includes(productionType)
    || rule.production_type === productionType,
  )

  if (!applicableRules.length) {
    return {
      compatible: false,
      evaluable: true,
      status: 'incompatible',
      reasons: ['Nenhuma regra científica publicada aceita este tipo de produção.'],
      matchingRules: [],
    }
  }

  const facts = scientificFacts(work)
  const evaluated = applicableRules.map((rule) => ({ rule, truth: evaluateScientificRule(rule, facts) }))
  const compatibleRules = evaluated.filter((item) => item.truth === TRUE).map((item) => item.rule)
  const possibleRules = evaluated.filter((item) => item.truth === UNKNOWN).map((item) => item.rule)

  if (compatibleRules.length) {
    return {
      compatible: true,
      evaluable: true,
      status: 'compatible',
      reasons: [
        `${compatibleRules.length} regra(s) científica(s) normalizada(s) atendida(s).`,
        'Confira o documento comprobatório e a pontuação indicada em cada regra.',
      ],
      matchingRules: compatibleRules,
    }
  }

  if (possibleRules.length) {
    return {
      compatible: false,
      evaluable: false,
      status: 'review_required',
      reasons: [
        `${possibleRules.length} regra(s) pode(m) aceitar o trabalho, mas faltam dados ou há condição manual.`,
        'Desconhecido não foi tratado como compatível nem incompatível.',
      ],
      matchingRules: possibleRules,
    }
  }

  return {
    compatible: false,
    evaluable: true,
    status: 'incompatible',
    reasons: ['As regras científicas publicadas não foram atendidas pelos dados informados.'],
    matchingRules: [],
  }
}

function evaluateLegacyEdict(edict, work) {
  const reasons = []
  const workQualis = work.qualis || null
  const workIndexerIds = [...new Set(work.indexerIds ?? [])]
  const edictIndexerIds = edict.indexerIds ?? []

  if (workQualis) {
    if (!isQualisLevel(workQualis)) {
      return { compatible: false, evaluable: false, status: 'invalid', reasons: [], matchingRules: [] }
    }

    if (edict.minimum_qualis) {
      const comparison = compareQualis(workQualis, edict.minimum_qualis)
      if (comparison === null) return { compatible: false, evaluable: false, status: 'invalid', reasons: [], matchingRules: [] }
      if (comparison < 0) return { compatible: false, evaluable: true, status: 'incompatible', reasons: [], matchingRules: [] }
      reasons.push(`Qualis ${workQualis} atende ao mínimo ${edict.minimum_qualis}`)
    } else {
      reasons.push('Sem exigência mínima de Qualis')
    }
  }

  if (workIndexerIds.length) {
    if (edictIndexerIds.length) {
      const matchingIndexer = edict.indexers?.find((indexer) => workIndexerIds.includes(indexer.id))
      const hasMatch = matchingIndexer || edictIndexerIds.some((id) => workIndexerIds.includes(id))
      if (!hasMatch) return { compatible: false, evaluable: true, status: 'incompatible', reasons: [], matchingRules: [] }
      reasons.push(matchingIndexer ? `Indexador aceito: ${matchingIndexer.name}` : 'Indexador aceito pelo edital')
    } else {
      reasons.push('Sem exigência de indexador')
    }
  }

  if (!reasons.length) reasons.push('Nenhum critério de classificação aplicado')
  return { compatible: true, evaluable: true, status: 'compatible', reasons, matchingRules: [] }
}

export function evaluateEdictCompatibility(edict, work = {}) {
  return edict.source_process_id
    ? evaluateImportedEdict(edict, work)
    : evaluateLegacyEdict(edict, work)
}
