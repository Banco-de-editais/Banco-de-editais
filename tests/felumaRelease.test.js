import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { evaluateEdictCompatibility } from '../src/domain/edictCompatibility.js'

const migrationPath = resolve('supabase/migrations/20260829235500_add_feluma_2027_non_article_rules.sql')
const migration = readFileSync(migrationPath, 'utf8')
const rulesMatch = migration.match(/\$feluma_rules\$(\[.*?\])\$feluma_rules\$::jsonb/s)
assert.ok(rulesMatch, 'Pacote JSON das regras FELUMA não encontrado na migração.')
const rules = JSON.parse(rulesMatch[1])

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

const edict = {
  source_process_id: '2027-MG-FELUMA-FELUMA',
  scientificRules: rules,
}

test('release FELUMA possui oito regras íntegras, auditáveis e sem IDs duplicados', () => {
  assert.equal(rules.length, 8)
  assert.equal(new Set(rules.map((rule) => rule.source_rule_id)).size, 8)
  assert.deepEqual(new Set(rules.map((rule) => rule.source_process_id)), new Set(['2027-MG-FELUMA-FELUMA']))
  assert.deepEqual(new Set(rules.map((rule) => rule.release_code)), new Set(['APP-SCIENTIFIC-FELUMA-2027-v1']))

  for (const rule of rules) {
    const { mapping_hash: mappingHash, ...hashable } = rule
    assert.equal(mappingHash, sha256(stableJson(hashable)), `Hash inválido em ${rule.source_rule_id}`)
    assert.equal(rule.evidence.document_sha256, '5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f')
    assert.match(rule.evidence.official_url, /1a-Retificacao\.pdf$/)
  }
})

test('FELUMA aceita capítulo somente quando publicado e com ISBN', () => {
  assert.equal(evaluateEdictCompatibility(edict, { productionType: 'CHAPTER' }).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'CHAPTER', hasIsbn: true, publicationStatus: 'ACCEPTED',
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'CHAPTER', hasIsbn: true, publicationStatus: 'PUBLISHED',
  }).status, 'compatible')
})

test('FELUMA distingue organização de livro de simples autoria', () => {
  const common = { productionType: 'BOOK', hasIsbn: true, publicationStatus: 'PUBLISHED' }
  assert.equal(evaluateEdictCompatibility(edict, { ...common, authorshipRole: 'AUTHOR' }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(edict, { ...common, authorshipRole: 'ORGANIZER' }).status, 'compatible')
})

test('FELUMA aceita apresentação regional, nacional ou internacional e rejeita evento local', () => {
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'EVENT_PRESENTATION', eventPresented: true,
  }).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'EVENT_PRESENTATION', eventPresented: true, eventScope: 'LOCAL',
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'EVENT_PRESENTATION', eventPresented: true, eventScope: 'REGIONAL',
  }).status, 'compatible')
})

test('FELUMA não pontua mero resumo em anais, mas reconhece o trabalho quando houve apresentação elegível', () => {
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'ABSTRACT_PROCEEDINGS', eventProceedings: true,
  }).status, 'insufficient_data')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'ABSTRACT_PROCEEDINGS', eventProceedings: true, eventPresented: false, eventScope: 'NATIONAL',
  }).status, 'incompatible')
  assert.equal(evaluateEdictCompatibility(edict, {
    productionType: 'ABSTRACT_PROCEEDINGS', eventProceedings: true, eventPresented: true, eventScope: 'NATIONAL',
  }).status, 'compatible')
})
