import test from 'node:test'
import assert from 'node:assert/strict'
import { coordinatingInstitutionOptions, currentPeriodEdicts, filterEdicts, regionOptionsForEdicts, stateOptionsForEdicts } from '../src/domain/consultationFilters.js'
import { evaluateEdictCompatibility } from '../src/domain/edictCompatibility.js'
import { journalMetadataLabel, journalOptionLabel, normalizeOptionalIssn } from '../src/domain/journals.js'
import { compareQualis, QUALIS_LEVELS } from '../src/domain/qualis.js'
import { scientificRequirementLabel } from '../src/domain/scientificRules.js'
import { formatDate, safeExternalUrl } from '../src/lib/formatters.js'

test('mantém a ordem do Qualis da menor para a maior classificação', () => {
  assert.deepEqual(QUALIS_LEVELS, ['B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'])
  assert.ok(compareQualis('A1', 'B4') > 0)
  assert.ok(compareQualis('B4', 'A1') < 0)
})

test('aceita Qualis igual ou superior ao mínimo do edital', () => {
  const exact = evaluateEdictCompatibility({ minimum_qualis: 'A3' }, { qualis: 'A3' })
  const higher = evaluateEdictCompatibility({ minimum_qualis: 'B1' }, { qualis: 'A4' })
  const lower = evaluateEdictCompatibility({ minimum_qualis: 'A2' }, { qualis: 'A3' })

  assert.equal(exact.compatible, true)
  assert.equal(higher.compatible, true)
  assert.equal(lower.compatible, false)
})

test('considera compatível quando existe ao menos um indexador aceito', () => {
  const edict = {
    indexerIds: [1, 2],
    indexers: [{ id: 1, name: 'SciELO' }, { id: 2, name: 'Scopus' }],
  }

  assert.equal(evaluateEdictCompatibility(edict, { indexerIds: [2, 3] }).compatible, true)
  assert.equal(evaluateEdictCompatibility(edict, { indexerIds: [3] }).compatible, false)
})

test('não trata critérios legados ausentes como compatibilidade', () => {
  const result = evaluateEdictCompatibility({ minimum_qualis: 'A1', indexerIds: [10] }, {})

  assert.equal(result.evaluable, false)
  assert.equal(result.compatible, false)
  assert.equal(result.status, 'insufficient_data')
  assert.ok(result.reasons.includes('Informe o Qualis da revista.'))
  assert.ok(result.reasons.includes('Informe a revista ou os indexadores.'))
})

test('não trata edital legado sem critério estruturado como aceitação universal', () => {
  const result = evaluateEdictCompatibility({}, {})

  assert.equal(result.compatible, false)
  assert.equal(result.status, 'coverage_pending')
})

test('rejeita uma classificação Qualis inválida', () => {
  const result = evaluateEdictCompatibility({ minimum_qualis: 'B4' }, { qualis: 'C' })

  assert.equal(result.evaluable, false)
  assert.equal(result.compatible, false)
})

test('formata datas sem deslocamento de fuso horário', () => {
  assert.equal(formatDate('2026-08-24'), '24/08/2026')
})

test('permite apenas links externos HTTP e HTTPS', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), '')
  assert.equal(safeExternalUrl('not a url'), '')
  assert.equal(safeExternalUrl('https://example.com/edital'), 'https://example.com/edital')
})

test('filtra edital e instituição coordenadora em campos independentes', () => {
  const edicts = [
    { id: 10, institution_id: 100, active: true, name: 'Processo Seletivo de Minas Gerais' },
    { id: 20, institution_id: 200, active: true, name: 'Outro processo seletivo' },
  ]

  assert.deepEqual(filterEdicts(edicts, { edictIds: [10], institutionIds: [] }).map((item) => item.id), [10])
  assert.deepEqual(filterEdicts(edicts, { edictIds: [], institutionIds: [200] }).map((item) => item.id), [20])
  assert.deepEqual(filterEdicts(edicts, { edictIds: [10], institutionIds: [200] }), [])
})

test('mantém na consulta somente editais de 2025 em diante', () => {
  const edicts = [
    { id: 1, entry_year: 2024 },
    { id: 2, entry_year: 2025 },
    { id: 3, entry_year: 2027 },
    { id: 4, entry_year: null },
  ]

  assert.deepEqual(currentPeriodEdicts(edicts).map((item) => item.id), [2, 3, 4])
  assert.deepEqual(filterEdicts(edicts, {}).map((item) => item.id), [2, 3, 4])
})

test('oferece no filtro apenas instituições que coordenam algum edital', () => {
  const edicts = [
    { id: 10, institution: { id: 100, name: 'AREMG' } },
    { id: 20, institution: { id: 100, name: 'AREMG' } },
    { id: 30, institution: { id: 200, name: 'Outra coordenadora' } },
  ]

  assert.deepEqual(coordinatingInstitutionOptions(edicts), [
    { id: 100, name: 'AREMG' },
    { id: 200, name: 'Outra coordenadora' },
  ])
})

test('filtra editais por estado e região em campos independentes e combináveis', () => {
  const edicts = [
    { id: 10, institution_id: 100, state_reference: 'MG', region: 'SUDESTE' },
    { id: 20, institution_id: 200, state_reference: 'SP', region: 'SUDESTE' },
    { id: 30, institution_id: 300, state_reference: 'RS', region: 'SUL' },
  ]

  assert.deepEqual(filterEdicts(edicts, { stateCodes: ['MG'] }).map((item) => item.id), [10])
  assert.deepEqual(filterEdicts(edicts, { regionCodes: ['SUDESTE'] }).map((item) => item.id), [10, 20])
  assert.deepEqual(filterEdicts(edicts, { stateCodes: ['MG'], regionCodes: ['SUL'] }), [])
  assert.deepEqual(filterEdicts(edicts, { institutionIds: [200], stateCodes: ['SP'], regionCodes: ['SUDESTE'] }).map((item) => item.id), [20])
})

test('oferece somente estados e regiões brasileiras presentes nos editais atuais', () => {
  const edicts = [
    { id: 10, entry_year: 2027, state_reference: 'MG', region: 'SUDESTE' },
    { id: 20, entry_year: 2027, state_reference: ' mg ', region: 'Sudeste' },
    { id: 30, entry_year: 2026, state_reference: 'RS', region: 'SUL' },
    { id: 40, entry_year: 2027, state_reference: 'NACIONAL', region: 'NACIONAL' },
    { id: 50, entry_year: 2024, state_reference: 'SP', region: 'SUDESTE' },
  ]

  assert.deepEqual(stateOptionsForEdicts(edicts), [
    { id: 'MG', name: 'Minas Gerais' },
    { id: 'RS', name: 'Rio Grande do Sul' },
  ])
  assert.deepEqual(regionOptionsForEdicts(edicts), [
    { id: 'SUDESTE', name: 'Sudeste' },
    { id: 'SUL', name: 'Sul' },
  ])
})

test('mantém ISSN opcional sem exibir separadores vazios', () => {
  assert.equal(normalizeOptionalIssn('  '), null)
  assert.equal(normalizeOptionalIssn(' 1518-9740 '), '1518-9740')
  assert.equal(journalOptionLabel({ name: 'Revista Fisioterapia', issn: null }), 'Revista Fisioterapia')
  assert.equal(journalMetadataLabel({ issn: null, qualis: 'B2' }), 'Qualis B2')
})

const importedEdict = (rules) => ({
  source_process_id: '2026-TESTE',
  scientificRules: rules,
})

const scientificRule = (overrides = {}) => ({
  source_rule_id: 'R-001',
  family: 'ARTIGO_PUBLICACAO',
  production_type: 'ARTICLE_PUBLICATION',
  accepted_production_types: ['ARTICLE_PUBLICATION'],
  published_for_engine: true,
  condition_groups: [{
    code: 'ROOT',
    parent: null,
    operator: 'ALL',
    conditions: [{
      field: 'production.type',
      operator: 'EQ',
      value: 'ARTICLE_PUBLICATION',
      required: true,
      negated: false,
    }],
  }],
  indexing_requirements: [],
  authorship_requirement: null,
  qualis_requirement: null,
  score_formula: { points_per_item: 1, maximum_points: 1 },
  date_window: null,
  subject_area_requirement: null,
  ...overrides,
})

test('não conclui compatibilidade quando o edital importado não tem regra publicada', () => {
  const result = evaluateEdictCompatibility(importedEdict([]), {})

  assert.equal(result.compatible, false)
  assert.equal(result.evaluable, false)
  assert.equal(result.status, 'coverage_pending')
})

test('distingue edital comprovadamente sem análise curricular', () => {
  const result = evaluateEdictCompatibility({
    ...importedEdict([]),
    coverage_status: 'NO_CURRICULUM',
  }, {})

  assert.equal(result.compatible, false)
  assert.equal(result.evaluable, true)
  assert.equal(result.status, 'no_scientific_scoring')

  const normalized = evaluateEdictCompatibility({
    ...importedEdict([]),
    coverage_status: 'NO_SCIENTIFIC_SCORING',
  }, {})
  assert.equal(normalized.status, 'no_scientific_scoring')

  const noArticleScoring = evaluateEdictCompatibility({
    ...importedEdict([]),
    coverage_status: 'NO_ARTICLE_SCORING',
  }, {})
  assert.equal(noArticleScoring.status, 'no_scientific_scoring')
  assert.match(noArticleScoring.reasons.join(' '), /artigos e publicações não recebem pontuação/i)
})

test('compara requisito de quantidade mínima de indexadores', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.indexings', operator: 'COUNT_GTE', value: 2, required: true, negated: false },
      ],
    }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: ['LILACS'], indexerCodesKnown: true,
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: ['LILACS', 'SCIELO'], indexerCodesKnown: true,
  }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'insufficient_data')
  assert.match(scientificRequirementLabel(rule), /pelo menos 2 bases/i)
})

test('aceita regra científica completamente atendida', () => {
  const result = evaluateEdictCompatibility(importedEdict([scientificRule()]), { journalId: 'journal-1' })

  assert.equal(result.compatible, true)
  assert.equal(result.status, 'compatible')
  assert.deepEqual(result.matchingRules.map((rule) => rule.source_rule_id), ['R-001'])
})

test('ignora situação da publicação como filtro para artigos', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.publication_status', operator: 'EQ', value: 'PUBLISHED', required: true, negated: false },
      ],
    }],
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' })
  assert.equal(result.compatible, true)
  assert.equal(result.status, 'compatible')
})

test('compara indexação científica por código sem equiparar bases distintas', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.indexings', operator: 'IN', value: ['PUBMED', 'SCIELO'], required: true, negated: false },
      ],
    }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { indexerCodes: ['PUBMED'] }).compatible, true)
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { indexerCodes: ['MEDLINE'] }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { indexerCodes: [], indexerCodesKnown: true }).status, 'incompatible')
})

test('compara requisito estruturado de Qualis mínimo', () => {
  const rule = scientificRule({
    qualis_requirement: {
      minimum_stratum: 'B2',
      operator: 'AT_LEAST',
      exact_match_allowed: true,
    },
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { qualis: 'B2' }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { qualis: 'A4' }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { qualis: 'B3' }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'insufficient_data')
  assert.match(scientificRequirementLabel(rule), /Qualis mínimo: B2/)
})

test('não trata regra de zero ponto como oportunidade compatível', () => {
  const rule = scientificRule({
    score_formula: { points_per_item: 0, maximum_points: 0 },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), {})
  assert.equal(result.compatible, false)
  assert.equal(result.status, 'incompatible')
})

test('não confirma regra positiva genérica quando só o tipo padrão foi informado', () => {
  const rule = scientificRule({
    score_formula: { type: 'PER_ITEM', points_per_item: 1, maximum_points: 1 },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'ARTICLE_PUBLICATION',
  })

  assert.equal(result.compatible, false)
  assert.equal(result.status, 'insufficient_data')
  assert.match(result.reasons.join(' '), /Selecionar apenas o tipo de produção/i)
})

test('usa o tipo não-artigo como dado real quando a regra exige apenas a categoria', () => {
  const rule = scientificRule({
    family: 'LIVRO_CAPITULO',
    production_type: 'CHAPTER',
    accepted_production_types: ['CHAPTER'],
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'CHAPTER', required: true, negated: false },
    ] }],
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), { productionType: 'CHAPTER' })
  assert.equal(result.status, 'compatible')
})

test('assume que todos os capítulos possuem ISBN e já foram publicados', () => {
  const rule = scientificRule({
    family: 'LIVRO_CAPITULO',
    production_type: 'BOOK_CHAPTER',
    accepted_production_types: ['CHAPTER'],
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'CHAPTER', required: true, negated: false },
      { field: 'production.identifiers.isbn', operator: 'IS_TRUE', value: true, required: true, negated: false },
      { field: 'production.publication_status', operator: 'EQ', value: 'PUBLISHED', required: true, negated: false },
    ] }],
  })

  const chapterOnly = evaluateEdictCompatibility(importedEdict([rule]), { productionType: 'CHAPTER' })
  assert.equal(chapterOnly.status, 'compatible')

  const contradictoryInputIsIgnored = evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'CHAPTER', hasIsbn: false, publicationStatus: 'ACCEPTED',
  })
  assert.equal(contradictoryInputIsIgnored.status, 'compatible')

  const published = evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'CHAPTER', hasIsbn: true, publicationStatus: 'PUBLISHED',
  })
  assert.equal(published.status, 'compatible')
})

test('livro pode exigir candidato como organizador sem confundir com autoria', () => {
  const rule = scientificRule({
    family: 'LIVRO_CAPITULO',
    production_type: 'BOOK',
    accepted_production_types: ['BOOK'],
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'BOOK', required: true, negated: false },
      { field: 'production.authorship.role', operator: 'EQ', value: 'ORGANIZER', required: true, negated: false },
    ] }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { productionType: 'BOOK' }).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'BOOK', authorshipRole: 'AUTHOR',
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'BOOK', authorshipRole: 'ORGANIZER',
  }).status, 'compatible')
})

test('apresentação em evento usa abrangência e formato próprios', () => {
  const rule = scientificRule({
    family: 'APRESENTACAO_EVENTO',
    production_type: 'EVENT_PRESENTATION',
    accepted_production_types: ['EVENT_PRESENTATION'],
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'EVENT_PRESENTATION', required: true, negated: false },
      { field: 'production.event.scope', operator: 'IN', value: ['REGIONAL', 'NATIONAL', 'INTERNATIONAL'], required: true, negated: false },
      { field: 'production.event.presentation_format', operator: 'IN', value: ['ORAL', 'POSTER'], required: true, negated: false },
      { field: 'production.event.presented', operator: 'IS_TRUE', value: true, required: true, negated: false },
    ] }],
  })

  const missing = evaluateEdictCompatibility(importedEdict([rule]), { productionType: 'EVENT_PRESENTATION' })
  assert.equal(missing.status, 'insufficient_data')
  assert.match(missing.reasons.join(' '), /abrangência do evento/i)
  assert.match(missing.reasons.join(' '), /formato da apresentação/i)

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'EVENT_PRESENTATION', eventScope: 'NATIONAL', presentationFormat: 'ORAL', eventPresented: true,
  }).status, 'compatible')
})

test('resumo em anais informa a presença nos anais sem depender de Qualis ou indexador', () => {
  const rule = scientificRule({
    family: 'RESUMO_ANAIS',
    production_type: 'ABSTRACT_PROCEEDINGS',
    accepted_production_types: ['ABSTRACT_PROCEEDINGS'],
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'ABSTRACT_PROCEEDINGS', required: true, negated: false },
      { field: 'production.event.proceedings', operator: 'IS_TRUE', value: true, required: true, negated: false },
    ] }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    productionType: 'ABSTRACT_PROCEEDINGS', eventProceedings: true,
  }).status, 'compatible')
})

test('aceita pontuação positiva confirmada quando a fórmula permanece manual', () => {
  const rule = scientificRule({
    score_formula: {
      type: 'MANUAL',
      positive_score_confirmed: true,
      literal_formula: 'Pontuação varia conforme autoria.',
    },
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' }).status, 'compatible')
})

test('aceita requisito de qualquer indexação sem inventar uma base específica', () => {
  const rule = scientificRule({
    indexing_requirements: [{
      base: 'ANY_SCIENTIFIC_DATABASE',
      operator: 'HAS_ANY',
      exact_match_allowed: true,
    }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: ['LILACS'], indexerCodesKnown: true,
  }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: [], indexerCodesKnown: true,
  }).status, 'incompatible')
  assert.match(scientificRequirementLabel(rule), /qualquer base científica/)
})

test('Sírio-Libanês ignora DOI e situação da publicação, mas exige indexação positiva', () => {
  const rule = scientificRule({
    source_rule_id: 'R01-001',
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.identifiers.doi', operator: 'IS_TRUE', value: true, required: true, negated: false },
        { field: 'production.publication_status', operator: 'EQ', value: 'PUBLISHED', required: true, negated: false },
        { field: 'production.indexings', operator: 'IN', value: ['SCIELO'], required: true, negated: false },
      ],
    }],
    score_formula: { points_per_item: 20, maximum_points: 40 },
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: ['SCIELO'],
    indexerCodesKnown: true,
  }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    indexerCodes: ['LILACS'],
    indexerCodesKnown: true,
  }).status, 'incompatible')
})

test('mantém requisito de Qualis incompleto para conferência manual', () => {
  const rule = scientificRule({
    qualis_requirement: {
      stratum: null,
      operator: 'MANUAL',
      exact_match_allowed: false,
    },
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { qualis: 'B2' }).status, 'review_required')
})

test('condição manual continua exigindo conferência mesmo quando indexação e Qualis atendem', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'manual.source_condition', operator: 'MANUAL', value: { kind: 'ADVISOR_RQE' }, required: true, negated: false, review_message: 'Confirmar médico orientador com RQE.' },
      ],
    }],
    indexing_requirements: [{ base: 'LILACS', operator: 'ANY', exact_match_allowed: true }],
    qualis_requirement: { minimum_stratum: 'B2', operator: 'AT_LEAST', exact_match_allowed: true },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), {
    qualis: 'B2',
    indexerCodes: ['LILACS'],
    indexerCodesKnown: true,
  })

  assert.equal(result.status, 'review_required')
  assert.ok(result.reasons.includes('Confirmar médico orientador com RQE.'))
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    qualis: 'B3', indexerCodes: ['LILACS'], indexerCodesKnown: true,
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    qualis: 'B2', indexerCodes: ['LATINDEX'], indexerCodesKnown: true,
  }).status, 'incompatible')
})

test('leva ao conferir quando critérios científicos batem e só faltam detalhes documentais de regra manual', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.publication_status', operator: 'EQ', value: 'PUBLISHED', required: true, negated: false },
        { field: 'manual.source_condition', operator: 'MANUAL', value: { kind: 'ADVISOR_RQE' }, required: true, negated: false, review_message: 'Confirmar orientador com RQE.' },
      ],
    }],
    indexing_requirements: [{ base: 'LILACS', operator: 'ANY', exact_match_allowed: true }],
    qualis_requirement: { minimum_stratum: 'B2', operator: 'AT_LEAST', exact_match_allowed: true },
  })

  const matched = evaluateEdictCompatibility(importedEdict([rule]), {
    journalId: 'journal-1',
    indexerCodes: ['LILACS'],
    indexerCodesKnown: true,
    qualis: 'B2',
  })
  assert.equal(matched.status, 'review_required')
  assert.ok(!matched.reasons.includes('Confirmar a situação da publicação.'))
  assert.ok(matched.reasons.includes('Confirmar orientador com RQE.'))

  const missingPrimaryCriterion = evaluateEdictCompatibility(importedEdict([rule]), {
    journalId: 'journal-1',
    qualis: 'B2',
  })
  assert.equal(missingPrimaryCriterion.status, 'insufficient_data')
})

test('compara intervalo anual estruturado quando a data é informada', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.publication_date', operator: 'BETWEEN', value: { start: '2019', end: '2025' }, required: true, negated: false },
      ],
    }],
    date_window: { kind: 'FIXED_YEAR_RANGE', start: '2019', end: '2025' },
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { publicationDate: '2025-12-31' }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { publicationDate: '2026-01-01' }).status, 'incompatible')
})

test('ignora janela móvel de cinco anos para artigos pela política operacional', () => {
  const rule = scientificRule({
    date_window: { raw_text: 'publicado nos últimos cinco anos' },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), {
    publicationDate: '2026-01-15',
  })

  assert.equal(result.compatible, true)
  assert.equal(result.status, 'compatible')
})

test('assume ISSN, revisão por pares, área temática e janela móvel de seis anos para artigos', () => {
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.identifiers.issn', operator: 'IS_TRUE', value: true, required: true, negated: false },
        { field: 'production.subject_area_relation', operator: 'MANUAL', value: { kind: 'HEALTH_OR_MEDICINE' }, required: true, negated: false, review_message: 'Confirmar área da saúde.' },
        { field: 'manual.source_condition', operator: 'MANUAL', value: { kind: 'PEER_REVIEW_AND_EDITORIAL_QUALITY' }, required: true, negated: false, review_message: 'Confirmar revisão por pares.' },
        { field: 'production.publication_age_months', operator: 'LTE', value: 72, required: true, negated: false },
      ],
    }],
    date_window: { kind: 'ROLLING_YEARS', years: 6, source_text: 'últimos seis anos' },
    subject_area_requirement: { kind: 'HEALTH_OR_MEDICINE' },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' })
  assert.equal(result.status, 'compatible')
  assert.ok(!result.reasons.some((reason) => /ISSN|revisão por pares|área da saúde|seis anos/i.test(reason)))
})

test('assume corpo editorial, mas mantém a posição de autoria para conferência', () => {
  const originalMessage = 'Confirmar que a revista/periódico possui corpo editorial e conferir a faixa de autoria.'
  const rule = scientificRule({
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'manual.source_condition', operator: 'MANUAL', value: { kind: 'EDITORIAL_BOARD' }, required: true, negated: false, review_message: originalMessage },
      ],
    }],
    source_metadata: { review_messages: [originalMessage] },
  })

  const missingAuthorship = evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' })
  assert.equal(missingAuthorship.status, 'review_required')
  assert.ok(missingAuthorship.reasons.includes('Confirmar a posição de autoria aplicável à pontuação.'))
  assert.ok(!missingAuthorship.reasons.some((reason) => /corpo editorial/i.test(reason)))

  const informedAuthorship = evaluateEdictCompatibility(importedEdict([rule]), {
    journalId: 'journal-1',
    authorshipRole: 'COAUTHOR',
  })
  assert.equal(informedAuthorship.status, 'compatible')
})

test('mantém JCR, relação com pré-requisito e aceite condicional para conferência', () => {
  const rules = [
    scientificRule({
      source_rule_id: 'JCR',
      condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.metrics.jcr', operator: 'MANUAL', value: '>1', required: true, negated: false },
      ] }],
    }),
    scientificRule({
      source_rule_id: 'PREREQUISITE',
      condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.temporal_relation_to_prerequisite', operator: 'EQ', value: 'DURING_PREREQUISITE_RESIDENCY', required: true, negated: false },
      ] }],
    }),
    scientificRule({
      source_rule_id: 'CONDITIONAL-ACCEPTANCE',
      condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'production.publication_status', operator: 'EQ', value: 'ACCEPTED', required: true, negated: false },
        { field: 'manual.source_condition', operator: 'MANUAL', value: 'Aceite válido se periódico internacionalmente indexado', required: true, negated: false },
      ] }],
    }),
  ]

  for (const rule of rules) {
    assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' }).status, 'review_required')
  }
})

test('mantém indexação ambígua e os demais ramos manuais escolhidos para conferência', () => {
  const unresolvedIndexing = scientificRule({
    indexing_requirements: [{
      base: 'INDEXED_UNSPECIFIED',
      operator: 'MANUAL',
      exact_match_allowed: false,
    }],
  })
  assert.equal(evaluateEdictCompatibility(importedEdict([unresolvedIndexing]), {
    journalId: 'journal-1',
    indexerCodes: ['LILACS'],
    indexerCodesKnown: true,
  }).status, 'review_required')

  const keptManualKinds = [
    'NON_INDEXED_BRANCH',
    'INSTITUTION_SCOPE',
    'ARTICLE_NOT_INDEXED_OR_PROCEEDINGS',
    'SCORING_TABLE_NOT_EXTRACTED',
    'PROGRAM_SPECIFIC_MANUAL_SCORING',
    'UNSTRUCTURED_SCIENTIFIC_SECTION',
  ]
  for (const kind of keptManualKinds) {
    const rule = scientificRule({
      condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
        { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
        { field: 'manual.source_condition', operator: 'MANUAL', value: { kind }, required: true, negated: false },
      ] }],
    })
    assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' }).status, 'review_required')
  }
})

test('mantém especialidade para conferência sem exibir a ambiguidade numérica removida', () => {
  const originalMessage = 'Confirmar que a candidatura é para Anestesiologia e conferir a ambiguidade da faixa de três artigos.'
  const rule = scientificRule({
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
      { field: 'manual.source_condition', operator: 'MANUAL', value: { kind: 'SPECIALTY_SCOPE' }, required: true, negated: false, review_message: originalMessage },
    ] }],
    source_metadata: { review_messages: [originalMessage] },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' })
  assert.equal(result.status, 'review_required')
  assert.ok(result.reasons.includes('Confirmar que a candidatura corresponde à especialidade indicada pela regra.'))
  assert.ok(!result.reasons.some((reason) => /ambiguidade|três artigos/i.test(reason)))
})

test('mantém abrangência e período fechado como critérios verificáveis', () => {
  const rule = scientificRule({
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', conditions: [
      { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false },
      { field: 'production.publication.scope', operator: 'IN', value: ['INTERNATIONAL'], required: true, negated: false },
      { field: 'production.publication_date', operator: 'BETWEEN', value: { start: '2024', end: '2026' }, required: true, negated: false },
    ] }],
  })

  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), { journalId: 'journal-1' }).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    journalId: 'journal-1', publicationScope: 'INTERNATIONAL', publicationDate: '2025-06-01',
  }).status, 'compatible')
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {
    journalId: 'journal-1', publicationScope: 'NATIONAL', publicationDate: '2025-06-01',
  }).status, 'incompatible')
})
