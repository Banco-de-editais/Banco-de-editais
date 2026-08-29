import test from 'node:test'
import assert from 'node:assert/strict'
import { coordinatingInstitutionOptions, filterEdicts } from '../src/domain/consultationFilters.js'
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

test('ignora critérios do trabalho que não foram informados', () => {
  const result = evaluateEdictCompatibility({ minimum_qualis: 'A1', indexerIds: [10] }, {})

  assert.equal(result.evaluable, true)
  assert.equal(result.compatible, true)
  assert.deepEqual(result.reasons, ['Nenhum critério de classificação aplicado'])
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
  date_window: null,
  subject_area_requirement: null,
  ...overrides,
})

test('não conclui compatibilidade quando o edital importado não tem regra publicada', () => {
  const result = evaluateEdictCompatibility(importedEdict([]), {})

  assert.equal(result.compatible, false)
  assert.equal(result.evaluable, false)
  assert.equal(result.status, 'no_normalized_rule')
})

test('aceita regra científica completamente atendida', () => {
  const result = evaluateEdictCompatibility(importedEdict([scientificRule()]), {})

  assert.equal(result.compatible, true)
  assert.equal(result.status, 'compatible')
  assert.deepEqual(result.matchingRules.map((rule) => rule.source_rule_id), ['R-001'])
})

test('não rebaixa a regra quando um refinamento opcional não foi informado', () => {
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

  const result = evaluateEdictCompatibility(importedEdict([rule]), {})
  assert.equal(result.compatible, true)
  assert.equal(result.evaluable, true)
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
  assert.equal(evaluateEdictCompatibility(importedEdict([rule]), {}).status, 'compatible')
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
  assert.match(scientificRequirementLabel(rule), /Qualis mínimo: B2/)
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

test('não aprova janela temporal sem comparador estruturado', () => {
  const rule = scientificRule({
    date_window: { raw_text: 'publicado nos últimos cinco anos' },
  })

  const result = evaluateEdictCompatibility(importedEdict([rule]), {
    publicationDate: '2026-01-15',
  })

  assert.equal(result.compatible, false)
  assert.equal(result.status, 'review_required')
})
