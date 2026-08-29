import { compareQualis, isQualisLevel } from './qualis.js'

const TRUE = 'TRUE'
const FALSE = 'FALSE'
const UNKNOWN = 'UNKNOWN'

const USER_INPUT_FIELD_LABELS = new Map([
  ['production.authorship.author_count', 'a quantidade de autores'],
  ['production.authorship.is_first_author', 'se você é o primeiro autor'],
  ['production.authorship.is_presenter', 'se você é o apresentador'],
  ['production.authorship.role', 'a posição de autoria'],
  ['production.indexings', 'a revista ou os indexadores'],
  ['production.publication.scope', 'a abrangência da publicação'],
  ['production.publication_date', 'a data de publicação'],
  ['production.qualis', 'o Qualis da revista'],
])

// Premissas operacionais definidas para o produto: os artigos cadastrados
// possuem DOI e ISSN, pertencem a periódicos com revisão por pares e corpo
// editorial, e a área temática não deve filtrar a consulta. A situação da
// publicação e janelas móveis de cinco ou seis anos também não devem filtrar.
// As condições permanecem preservadas nas regras como evidência do edital.
const SATISFIED_BY_ARTICLE_POLICY = new Set([
  'production.identifiers.doi',
  'production.identifiers.issn',
  'production.publication_status',
  'production.subject_area_relation',
])

const SATISFIED_MANUAL_KINDS_BY_ARTICLE_POLICY = new Set([
  'PEER_REVIEW_AND_EDITORIAL_QUALITY',
  'ROLLING_FIVE_YEARS',
])

const ARTICLE_POLICY_REVIEW_MESSAGE_OVERRIDES = new Map([
  ['EDITORIAL_BOARD', 'Confirmar a posição de autoria aplicável à pontuação.'],
  ['SPECIALTY_SCOPE', 'Confirmar que a candidatura corresponde à especialidade indicada pela regra.'],
])

const SATISFIED_ROLLING_AGE_MONTHS = new Set([60, 72])

const PRIMARY_SCIENTIFIC_INPUT_FIELDS = new Set([
  'production.indexings',
  'production.qualis',
])

const PRODUCTION_PARENTS = {
  ARTICLE_PUBLICATION: 'SCIENTIFIC_PRODUCTION',
  BOOK_CHAPTER: 'SCIENTIFIC_PRODUCTION',
  BOOK: 'BOOK_CHAPTER',
  CHAPTER: 'BOOK_CHAPTER',
  ABSTRACT_PROCEEDINGS: 'SCIENTIFIC_PRODUCTION',
  EVENT_PRESENTATION: 'SCIENTIFIC_PRODUCTION',
}

function manualConditionKind(condition) {
  return condition?.value && typeof condition.value === 'object'
    ? condition.value.kind
    : null
}

function rawConditionReviewMessage(condition) {
  return condition.review_message ?? condition.value?.review_message ?? null
}

function articlePolicyReviewMessage(condition, facts) {
  if (facts['production.type'] !== 'ARTICLE_PUBLICATION') return rawConditionReviewMessage(condition)
  return ARTICLE_POLICY_REVIEW_MESSAGE_OVERRIDES.get(manualConditionKind(condition))
    ?? rawConditionReviewMessage(condition)
}

function articlePolicyConditionResult(condition, facts) {
  if (facts['production.type'] !== 'ARTICLE_PUBLICATION') return null
  if (SATISFIED_BY_ARTICLE_POLICY.has(condition.field)) return TRUE

  if (condition.field === 'production.publication_age_months'
    && condition.operator === 'LTE'
    && SATISFIED_ROLLING_AGE_MONTHS.has(Number(condition.value))) return TRUE

  if (condition.operator !== 'MANUAL') return null
  const kind = manualConditionKind(condition)
  if (SATISFIED_MANUAL_KINDS_BY_ARTICLE_POLICY.has(kind)) return TRUE

  // Nos editais CONSESP, a mesma condição agregava corpo editorial e faixa de
  // autoria. Corpo editorial é premissa; a autoria continua sendo conferida.
  if (kind === 'EDITORIAL_BOARD') {
    return 'production.authorship.role' in facts ? TRUE : UNKNOWN
  }

  return null
}

function isSatisfiedRollingWindowByArticlePolicy(dateWindow, facts) {
  if (facts['production.type'] !== 'ARTICLE_PUBLICATION' || !dateWindow) return false
  const years = Number(dateWindow.years)
  if (dateWindow.kind === 'ROLLING_YEARS' && [5, 6].includes(years)) return true

  const sourceText = String(dateWindow.source_text ?? dateWindow.raw_text ?? '').toLocaleLowerCase('pt-BR')
  return /últim(?:o|a)s?\s+(?:0?5|cinco|0?6|seis)\s+anos?/.test(sourceText)
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
    case 'HAS_ANY':
      return Array.isArray(observed) && observed.length > 0 ? TRUE : FALSE
    case 'COUNT_GTE':
      return Array.isArray(observed) && observed.length >= Number(expected) ? TRUE : FALSE
    case 'IS_TRUE':
      return observed === true ? TRUE : FALSE
    case 'IS_FALSE':
      return observed === false ? TRUE : FALSE
    case 'LTE':
      return Number.isFinite(Number(observed)) && Number(observed) <= Number(expected) ? TRUE : FALSE
    case 'BETWEEN': {
      const limits = Array.isArray(expected)
        ? expected
        : [expected?.minimum ?? expected?.min ?? expected?.start, expected?.maximum ?? expected?.max ?? expected?.end]
      if (typeof observed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(observed)) {
        const start = /^\d{4}$/.test(String(limits[0])) ? `${limits[0]}-01-01` : limits[0]
        const end = /^\d{4}$/.test(String(limits[1])) ? `${limits[1]}-12-31` : limits[1]
        if ([start, end].every((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
          return observed >= start && observed <= end ? TRUE : FALSE
        }
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
    case 'AT_LEAST_QUALIS': {
      const comparison = compareQualis(observed, expected)
      return comparison === null ? UNKNOWN : comparison >= 0 ? TRUE : FALSE
    }
    case 'MANUAL':
      return UNKNOWN
    default:
      return UNKNOWN
  }
}

function evaluateCondition(condition, facts) {
  const policyResult = articlePolicyConditionResult(condition, facts)
  if (policyResult !== null) return policyResult
  if (condition.operator === 'MANUAL') return UNKNOWN
  if (!(condition.field in facts)) {
    if (condition.required === false) return TRUE
    return UNKNOWN
  }

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
    const manual = rule.indexing_requirements.some((item) => !item.exact_match_allowed || item.operator === 'MANUAL')
    if (!('production.indexings' in facts)) {
      values.push(UNKNOWN)
    } else {
      const exact = rule.indexing_requirements.filter((item) => item.exact_match_allowed && item.operator !== 'MANUAL')
      const matches = exact.some((item) => item.operator === 'HAS_ANY'
        ? facts['production.indexings'].length > 0
        : facts['production.indexings'].includes(item.base))
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

  if (rule.qualis_requirement && !fields.has('production.qualis')) {
    const requirement = rule.qualis_requirement
    const minimum = requirement.minimum_stratum ?? requirement.minimum ?? requirement.stratum
    const canCompare = requirement.exact_match_allowed !== false
      && requirement.operator !== 'MANUAL'
      && isQualisLevel(minimum)

    if (!canCompare) {
      values.push(UNKNOWN)
    } else if (!('production.qualis' in facts)) {
      values.push(UNKNOWN)
    } else {
      values.push(compareKnownValue('AT_LEAST_QUALIS', facts['production.qualis'], minimum))
    }
  }

  // Só mantemos a exigência suplementar como manual quando o pacote não
  // trouxe um comparador equivalente na árvore de condições.
  if (rule.date_window
    && !fields.has('production.publication_date')
    && !fields.has('production.publication_age_months')
    && !isSatisfiedRollingWindowByArticlePolicy(rule.date_window, facts)) values.push(UNKNOWN)
  if (rule.subject_area_requirement
    && !fields.has('production.subject_area_relation')
    && facts['production.type'] !== 'ARTICLE_PUBLICATION') values.push(UNKNOWN)

  return values.length ? triAll(values) : TRUE
}

function evaluateScientificRule(rule, facts) {
  return triAll([
    evaluatePositiveScorePotential(rule),
    evaluateConditionTree(rule.condition_groups, facts),
    evaluateSupplementalRequirements(rule, facts),
  ])
}

function evaluatePositiveScorePotential(rule) {
  const score = rule.score_formula
  if (!score) return UNKNOWN
  if (score.positive_score_confirmed === true) return TRUE
  if (score.positive_score_confirmed === false) return FALSE

  const numericValues = [score.points_per_item, score.maximum_points]
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map(Number)
    .filter(Number.isFinite)

  if (numericValues.some((value) => value > 0)) return TRUE
  if (numericValues.length) return FALSE
  return UNKNOWN
}

function scientificFacts(work) {
  const facts = { 'production.type': work.productionType || 'ARTICLE_PUBLICATION' }
  if (work.indexerCodesKnown || work.indexerCodes?.length) facts['production.indexings'] = [...new Set(work.indexerCodes ?? [])]
  if (work.qualis) facts['production.qualis'] = work.qualis
  if (work.authorshipRole) facts['production.authorship.role'] = work.authorshipRole
  if (work.authorCount !== '' && work.authorCount !== null && work.authorCount !== undefined) {
    facts['production.authorship.author_count'] = Number(work.authorCount)
  }
  if (typeof work.isFirstAuthor === 'boolean') facts['production.authorship.is_first_author'] = work.isFirstAuthor
  if (typeof work.hasIssn === 'boolean') facts['production.identifiers.issn'] = work.hasIssn
  if (work.publicationScope) facts['production.publication.scope'] = work.publicationScope
  if (work.publicationDate) facts['production.publication_date'] = work.publicationDate
  return facts
}

function hasMeaningfulWorkInput(work) {
  return Boolean(
    work.journalId
    || work.qualis
    || work.indexerCodesKnown
    || work.indexerCodes?.length
    || work.authorshipRole
    || (work.authorCount !== '' && work.authorCount !== null && work.authorCount !== undefined)
    || typeof work.isFirstAuthor === 'boolean'
    || typeof work.hasIssn === 'boolean'
    || work.publicationDate
    || work.publicationScope,
  )
}

function ruleReviewMessages(rule, facts) {
  const manualConditions = (rule.condition_groups ?? [])
    .flatMap((group) => group.conditions ?? [])
    .filter((condition) => condition.operator === 'MANUAL')

  const suppressedMessages = new Set(manualConditions
    .filter((condition) => articlePolicyConditionResult(condition, facts) === TRUE)
    .map(rawConditionReviewMessage)
    .filter(Boolean)
  )
  const overriddenMessages = new Map(manualConditions
    .map((condition) => [rawConditionReviewMessage(condition), articlePolicyReviewMessage(condition, facts)])
    .filter(([original, replacement]) => original && replacement && original !== replacement))
  const conditionMessages = manualConditions
    .filter((condition) => articlePolicyConditionResult(condition, facts) !== TRUE)
    .map((condition) => articlePolicyReviewMessage(condition, facts))
    .filter(Boolean)
  const metadataMessages = Array.isArray(rule.source_metadata?.review_messages)
    ? rule.source_metadata.review_messages
      .filter((message) => !suppressedMessages.has(message))
      .map((message) => overriddenMessages.get(message) ?? message)
    : []
  return [...new Set([...conditionMessages, ...metadataMessages])]
}

function hasManualCondition(rule, facts) {
  return (rule.condition_groups ?? [])
    .flatMap((group) => group.conditions ?? [])
    .some((condition) => condition.operator === 'MANUAL'
      && articlePolicyConditionResult(condition, facts) !== TRUE)
}

function missingUserInputFields(rule, facts) {
  const missing = new Set()
  const conditionFields = new Set()

  for (const condition of (rule.condition_groups ?? []).flatMap((group) => group.conditions ?? [])) {
    conditionFields.add(condition.field)
    if (articlePolicyConditionResult(condition, facts) === TRUE) continue
    if (condition.required !== false
      && condition.operator !== 'MANUAL'
      && USER_INPUT_FIELD_LABELS.has(condition.field)
      && !(condition.field in facts)) missing.add(condition.field)
  }

  if ((rule.indexing_requirements ?? []).length
    && !conditionFields.has('production.indexings')
    && !('production.indexings' in facts)
    && rule.indexing_requirements.some((item) => item.exact_match_allowed && item.operator !== 'MANUAL')) {
    missing.add('production.indexings')
  }

  if (rule.qualis_requirement
    && !conditionFields.has('production.qualis')
    && !('production.qualis' in facts)) {
    const minimum = rule.qualis_requirement.minimum_stratum
      ?? rule.qualis_requirement.minimum
      ?? rule.qualis_requirement.stratum
    const canCompare = rule.qualis_requirement.exact_match_allowed !== false
      && rule.qualis_requirement.operator !== 'MANUAL'
      && isQualisLevel(minimum)
    if (canCompare) missing.add('production.qualis')
  }

  const authorship = rule.authorship_requirement
  if (authorship?.roles?.length
    && !conditionFields.has('production.authorship.role')
    && !('production.authorship.role' in facts)) missing.add('production.authorship.role')
  if (authorship?.author_limit != null
    && !conditionFields.has('production.authorship.author_count')
    && !('production.authorship.author_count' in facts)) missing.add('production.authorship.author_count')
  if (authorship?.presenter_required
    && !conditionFields.has('production.authorship.is_presenter')
    && !('production.authorship.is_presenter' in facts)) missing.add('production.authorship.is_presenter')

  return [...missing]
}

function evaluateImportedEdict(edict, work) {
  const publishedRules = (edict.scientificRules ?? []).filter((rule) => rule.published_for_engine)
  if (!publishedRules.length) {
    if (['NO_CURRICULUM', 'NO_SCIENTIFIC_SCORING', 'NO_ARTICLE_SCORING'].includes(edict.coverage_status)) {
      const articleSpecificReason = edict.coverage_status === 'NO_ARTICLE_SCORING'
        ? 'O processo possui avaliação curricular, mas artigos e publicações não recebem pontuação.'
        : 'O processo foi registrado sem etapa curricular que pontue produção científica.'
      return {
        compatible: false,
        evaluable: true,
        status: 'no_scientific_scoring',
        reasons: [articleSpecificReason],
        matchingRules: [],
      }
    }
    return {
      compatible: false,
      evaluable: false,
      status: 'coverage_pending',
      reasons: ['A cobertura científica deste edital ainda não é conclusiva; não é seguro afirmar compatibilidade.'],
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

  const potentiallyPositiveRules = applicableRules.filter((rule) => evaluatePositiveScorePotential(rule) !== FALSE)
  if (!potentiallyPositiveRules.length) {
    return {
      compatible: false,
      evaluable: true,
      status: 'incompatible',
      reasons: ['As regras aplicáveis registradas não atribuem pontuação positiva ao trabalho.'],
      matchingRules: [],
    }
  }

  const facts = scientificFacts(work)
  const evaluated = applicableRules.map((rule) => ({
    rule,
    truth: evaluateScientificRule(rule, facts),
    missingFields: missingUserInputFields(rule, facts),
  }))
  const compatibleRules = evaluated.filter((item) => item.truth === TRUE).map((item) => item.rule)
  const incompleteRules = evaluated.filter((item) => item.truth === UNKNOWN && item.missingFields.length)
  const possibleRules = evaluated.filter((item) => item.truth === UNKNOWN && !item.missingFields.length).map((item) => item.rule)
  const reviewableIncompleteRules = incompleteRules.filter((item) =>
    hasManualCondition(item.rule, facts)
    && !item.missingFields.some((field) => PRIMARY_SCIENTIFIC_INPUT_FIELDS.has(field)))
  const blockingIncompleteRules = incompleteRules.filter((item) => !reviewableIncompleteRules.includes(item))

  if (!hasMeaningfulWorkInput(work) && !incompleteRules.length) {
    return {
      compatible: false,
      evaluable: false,
      status: 'insufficient_data',
      reasons: [
        'Informe ao menos a revista ou um critério do trabalho para testar as regras deste edital.',
        'Selecionar apenas o tipo de produção não confirma compatibilidade nem pontuação.',
      ],
      matchingRules: potentiallyPositiveRules,
    }
  }

  if (compatibleRules.length) {
    return {
      compatible: true,
      evaluable: true,
      status: 'compatible',
      reasons: [
        `${compatibleRules.length} regra(s) compatível(is) com os dados informados.`,
        'A compatibilidade indica possibilidade de pontuação positiva na regra exibida; confira os comprovantes exigidos.',
      ],
      matchingRules: compatibleRules,
    }
  }

  if (blockingIncompleteRules.length) {
    const missingLabels = [...new Set(blockingIncompleteRules
      .flatMap((item) => item.missingFields)
      .map((field) => USER_INPUT_FIELD_LABELS.get(field))
      .filter(Boolean))]
    return {
      compatible: false,
      evaluable: false,
      status: 'insufficient_data',
      reasons: [
        `${blockingIncompleteRules.length} regra(s) pode(m) gerar pontuação, mas faltam dados decisivos para confirmar.`,
        ...missingLabels.slice(0, 3).map((label) => `Informe ${label}.`),
        'Dado ausente não foi tratado como compatibilidade.',
      ],
      matchingRules: blockingIncompleteRules.map((item) => item.rule),
    }
  }

  const reviewRules = [...possibleRules, ...reviewableIncompleteRules.map((item) => item.rule)]
  if (reviewRules.length) {
    const reviewMessages = [...new Set(reviewRules.flatMap((rule) => ruleReviewMessages(rule, facts)))]
    const documentaryLabels = [...new Set(reviewableIncompleteRules
      .flatMap((item) => item.missingFields)
      .map((field) => USER_INPUT_FIELD_LABELS.get(field))
      .filter(Boolean))]
    return {
      compatible: false,
      evaluable: false,
      status: 'review_required',
      reasons: [
        `${reviewRules.length} regra(s) atende(m) aos critérios científicos informados, mas possui(em) condição adicional para conferir.`,
        ...documentaryLabels.slice(0, 2).map((label) => `Confirmar ${label}.`),
        ...reviewMessages.slice(0, 3),
        'A condição não verificável não foi tratada como compatível nem incompatível.',
      ],
      matchingRules: reviewRules,
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
  const requiredFields = []

  if (edict.minimum_qualis && !workQualis) requiredFields.push('o Qualis da revista')
  if (edictIndexerIds.length && !workIndexerIds.length) requiredFields.push('a revista ou os indexadores')
  if (requiredFields.length) {
    return {
      compatible: false,
      evaluable: false,
      status: 'insufficient_data',
      reasons: [
        'Faltam dados decisivos para aplicar os critérios cadastrados deste edital.',
        ...requiredFields.map((label) => `Informe ${label}.`),
        'Dado ausente não foi tratado como compatibilidade.',
      ],
      matchingRules: [],
    }
  }

  if (!edict.minimum_qualis && !edictIndexerIds.length) {
    return {
      compatible: false,
      evaluable: false,
      status: 'coverage_pending',
      reasons: ['Este edital não possui critério científico estruturado; não é seguro afirmar compatibilidade.'],
      matchingRules: [],
    }
  }

  if (workQualis) {
    if (!isQualisLevel(workQualis)) {
      return { compatible: false, evaluable: false, status: 'invalid', reasons: [], matchingRules: [] }
    }

    if (edict.minimum_qualis) {
      const comparison = compareQualis(workQualis, edict.minimum_qualis)
      if (comparison === null) return { compatible: false, evaluable: false, status: 'invalid', reasons: [], matchingRules: [] }
      if (comparison < 0) return { compatible: false, evaluable: true, status: 'incompatible', reasons: [], matchingRules: [] }
      reasons.push(`Qualis ${workQualis} atende ao mínimo ${edict.minimum_qualis}`)
    }
  }

  if (workIndexerIds.length) {
    if (edictIndexerIds.length) {
      const matchingIndexer = edict.indexers?.find((indexer) => workIndexerIds.includes(indexer.id))
      const hasMatch = matchingIndexer || edictIndexerIds.some((id) => workIndexerIds.includes(id))
      if (!hasMatch) return { compatible: false, evaluable: true, status: 'incompatible', reasons: [], matchingRules: [] }
      reasons.push(matchingIndexer ? `Indexador aceito: ${matchingIndexer.name}` : 'Indexador aceito pelo edital')
    }
  }

  return { compatible: true, evaluable: true, status: 'compatible', reasons, matchingRules: [] }
}

export function evaluateEdictCompatibility(edict, work = {}) {
  return edict.source_process_id
    ? evaluateImportedEdict(edict, work)
    : evaluateLegacyEdict(edict, work)
}
