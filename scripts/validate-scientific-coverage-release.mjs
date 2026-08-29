import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateEdictCompatibility } from '../src/domain/edictCompatibility.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const migrationPath = resolve(repositoryRoot, 'supabase/migrations/20260829220000_add_scientific_coverage_release.sql')
const inventoryPath = resolve(repositoryRoot, '.codex-work/normalization/inventory.json')
const migration = readFileSync(migrationPath, 'utf8')

function taggedJson(tag) {
  const marker = `$${tag}$`
  const startMarker = migration.indexOf(marker)
  assert.notEqual(startMarker, -1, `Missing ${tag} JSON marker`)
  const start = startMarker + marker.length
  const end = migration.indexOf(marker, start)
  assert.notEqual(end, -1, `Missing closing ${tag} JSON marker`)
  return JSON.parse(migration.slice(start, end))
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

const rules = taggedJson('coverage_rules')
const assessments = taggedJson('coverage_assessments')
assert.equal(rules.length, 51)
assert.equal(new Set(rules.map((rule) => rule.source_process_id)).size, 36)
assert.equal(assessments.length, 37)
assert.equal(new Set(rules.map((rule) => rule.source_rule_id)).size, rules.length)
assert.equal(new Set(assessments.map((item) => item.source_process_id)).size, assessments.length)

for (const rule of rules) {
  const { mapping_hash: mappingHash, ...hashable } = rule
  assert.equal(mappingHash, sha256(stableJson(hashable)), `Invalid mapping hash for ${rule.source_rule_id}`)
  assert.match(rule.evidence.official_url, /^https:\/\//)
  assert.match(rule.evidence.document_sha256, /^[0-9a-f]{64}$/)
  const indexerCodes = rule.indexing_requirements.map((item) => item.base)
  assert.equal(new Set(indexerCodes).size, indexerCodes.length, `Duplicate indexer in ${rule.source_rule_id}`)
}

function resultFor(processId, work) {
  const scientificRules = rules.filter((rule) => rule.source_process_id === processId)
  return evaluateEdictCompatibility({
    source_process_id: processId,
    coverage_status: 'RULES_PUBLISHED',
    scientificRules,
  }, work)
}

assert.equal(resultFor('2026-MG-PSU-MG-AREMG', {
  qualis: 'B2', indexerCodes: ['LILACS'], indexerCodesKnown: true,
}).status, 'review_required')
assert.equal(resultFor('2026-MG-PSU-MG-AREMG', {
  qualis: 'B3', indexerCodes: ['LILACS'], indexerCodesKnown: true,
}).status, 'incompatible')
assert.equal(resultFor('2026-PR-FEAS-CURITIBA', { journalId: 'journal-1' }).status, 'compatible')
assert.equal(resultFor('2026-PR-FEAS-CURITIBA', { productionType: 'ARTICLE_PUBLICATION' }).status, 'insufficient_data')
assert.equal(resultFor('2026-SP-FMUSP-FUVEST', {
  journalId: 'journal-1', indexerCodes: ['PUBMED'], indexerCodesKnown: true,
}).status, 'compatible')
assert.equal(resultFor('2026-DF-SES-DF-IADES', {
  journalId: 'journal-1', indexerCodes: ['MEDLINE'], indexerCodesKnown: true, hasDoi: true, hasIssn: true,
}).status, 'compatible')
assert.equal(resultFor('2027-MG-FELUMA-FELUMA', {
  journalId: 'journal-1', indexerCodes: ['LILACS'], indexerCodesKnown: true, hasIssn: true,
}).status, 'compatible')
assert.equal(resultFor('2026-SP-UNIFESP-COREME', { journalId: 'journal-1' }).status, 'review_required')

let projection = null
if (existsSync(inventoryPath)) {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')).inventory
  const overrides = new Map(assessments.map((item) => [item.source_process_id, item.assessment_status]))
  const translate = {
    RULES_PUBLISHED: 'RULES_PUBLISHED',
    NO_CURRICULUM: 'NO_SCIENTIFIC_SCORING',
    NOT_EXTRACTED: 'EXTRACTION_PENDING',
    EXTRACTED_NOT_MAPPED: 'MAPPING_PENDING',
    RULES_BLOCKED: 'MANUAL_RULE_ONLY',
    PARTIAL: 'PARTIAL_RULES',
    NOT_LOCATED: 'SOURCE_NOT_LOCATED',
  }
  const coverageStatuses = {}
  for (const edict of inventory) {
    const status = overrides.get(edict.source_process_id) ?? translate[edict.coverage_status] ?? 'SOURCE_NOT_LOCATED'
    coverageStatuses[status] = (coverageStatuses[status] ?? 0) + 1
  }

  const oldRuleProcesses = new Set(inventory
    .filter((edict) => edict.published_scientific_rule_count > 0)
    .map((edict) => edict.source_process_id))
  const allRuleProcesses = new Set([...oldRuleProcesses, ...rules.map((rule) => rule.source_process_id)])
  projection = {
    imported_edicts: inventory.length,
    old_rule_processes: oldRuleProcesses.size,
    new_rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size,
    total_rule_processes: allRuleProcesses.size,
    processes_without_published_rule: inventory.length - allRuleProcesses.size,
    coverage_statuses: coverageStatuses,
  }
}

console.log(JSON.stringify({
  valid: true,
  rules: rules.length,
  rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size,
  assessments: assessments.length,
  projection,
}, null, 2))
