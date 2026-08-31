import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildMigration, loadCurriculumRelease, MIGRATION_PATH, sha256, stableJson, validateCurriculumRules } from '../scripts/build-curriculum-release.mjs'

const release = loadCurriculumRelease()
const rawRules = release.rules.map(({ record_hash, ...rule }) => rule)

test('release curricular reúne sete processos, seis atividades e evidência para cada regra', () => {
  assert.equal(release.edict_count, 7)
  assert.equal(release.rule_count, 41)
  assert.equal(new Set(release.rules.flatMap((rule) => rule.activity_codes)).size, 6)
  assert.equal(new Set(release.rules.map((rule) => rule.source_rule_id)).size, release.rule_count)
  assert.equal(validateCurriculumRules(rawRules), true)
  for (const rule of release.rules) {
    const { record_hash, ...source } = rule
    assert.equal(record_hash, sha256(stableJson(source)))
  }
})

test('migração curricular é reproduzível e não reescreve entidades protegidas', () => {
  const sql = buildMigration(release)
  assert.equal(readFileSync(MIGRATION_PATH, 'utf8').replace(/\r\n/g, '\n'), sql)
  assert.match(sql, /Protected existing records changed/)
  assert.match(sql, /Curriculum import reconciliation failed/)
  assert.doesNotMatch(sql, /(?:update|delete from|insert into) public\.(?:edicts|journals|scientific_rules|institutions|indexers)\b/i)
})

test('validação rejeita IDs repetidos, fonte sem hash e pontuação inventada para MAX_ONLY', () => {
  assert.throws(() => validateCurriculumRules([...rawRules, rawRules[0]]), /duplicate/)
  const missingEvidence = structuredClone(rawRules)
  missingEvidence[0].evidence[0].sha256 = ''
  assert.throws(() => validateCurriculumRules(missingEvidence), /evidence/)
  const invented = structuredClone(rawRules)
  invented.find((rule) => rule.scoring.type === 'MAX_ONLY').scoring.points_per_unit = 15
  assert.throws(() => validateCurriculumRules(invented), /invented/)
})

test('UFCSPA preserva uma regra e teto único para três modalidades', () => {
  const rules = release.rules.filter((rule) => rule.source_process_id === '2027-RS-UFCSPA-FUNDMED')
  assert.equal(rules.length, 1)
  assert.equal(rules[0].activity_codes.length, 3)
  assert.equal(rules[0].scoring.points_per_unit, 0.5)
  assert.equal(rules[0].scoring.max_points, 2)
  assert.match(rules[0].scoring.unit, /semestre/i)
})

test('FELUMA distingue organização de livro por acesso sem presumir ISBN dos capítulos', () => {
  const books = release.rules.filter((rule) => rule.activity_codes.includes('BOOK_ORGANIZER'))
  assert.equal(books.length, 2)
  assert.equal(books.find((rule) => rule.access_type === 'DIRECT').scoring.points_per_unit, 1)
  assert.equal(books.find((rule) => rule.access_type === 'PREREQUISITE').scoring.points_per_unit, 1.5)
  assert(books.every((rule) => /ISBN/.test(rule.requirements.join(' '))))
})

test('contradições do PSU e da extensão UNITAU não são classificadas como fonte inequívoca', () => {
  const psu = release.rules.filter((rule) => rule.source_process_id === '2027-MG-PSU-MG-AREMG'
    && ['RESEARCH', 'EVENT_SPEAKER', 'EVENT_ORGANIZER'].some((code) => rule.activity_codes.includes(code)))
  assert.equal(psu.length, 5)
  assert(psu.every((rule) => rule.status === 'REVIEW_REQUIRED' && rule.caveats.length))
  const extension = release.rules.find((rule) => rule.source_rule_id === 'CURR-UNITAU-2027-DIRECT-EXTENSAO')
  assert.equal(extension.status, 'REVIEW_REQUIRED')
  assert.equal(extension.scoring.points_per_unit, null)
  const ic = release.rules.find((rule) => rule.source_rule_id === 'CURR-UNITAU-2027-DIRECT-IC')
  assert.equal(ic.scoring.type, 'MAX_ONLY')
  assert.equal(ic.scoring.max_points, 15)
})

test('FMUSP mantém organização com errata de acesso direto e HSRC não duplica papel em evento', () => {
  const congress = release.rules.find((rule) => rule.source_rule_id === 'CURR-FMUSP-2026-DIRECT-ORGANIZACAO-CONGRESSO-CLASSE')
  assert.equal(congress.scoring.points_per_unit, 5)
  assert.equal(congress.access_type, 'DIRECT')
  assert(congress.evidence.some((source) => source.url.includes('2025-12-11')))
  const hsrc = release.rules.filter((rule) => rule.source_process_id === '2027-ES-HSRC-IBEST'
    && rule.activity_codes.includes('EVENT_SPEAKER'))
  assert.equal(hsrc.length, 1)
  assert(hsrc[0].activity_codes.includes('EVENT_ORGANIZER'))
  assert.equal(hsrc[0].scoring.max_points, 1)
  assert.match(hsrc[0].requirements.join(' '), /área médica\/saúde/)
  const hsrcResearch = release.rules.find((rule) => rule.source_rule_id === 'CURR-HSRC-2027-DIRECT-IC')
  assert.match(hsrcResearch.requirements.join(' '), /área médica/)
})
