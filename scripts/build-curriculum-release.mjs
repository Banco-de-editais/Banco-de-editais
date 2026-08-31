import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ACTIVITY_OPTIONS } from '../src/domain/curriculumPlanning.js'

export const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const RELEASE_CODE = 'CURRICULUM-PLANNING-2026-08-30-v1'
export const MIGRATION_PATH = resolve(REPOSITORY_ROOT, 'supabase/migrations/20260830121000_import_curriculum_planning_v1.sql')
export const SOURCE_PATHS = ['mg.json', 'other.json', 'unitau-hsrc.json'].map((file) => resolve(REPOSITORY_ROOT, 'data/curriculum/2026-08-30', file))

const activityCodes = new Set(ACTIVITY_OPTIONS.map(({ id }) => id))
const sourceHosts = new Set(['www.fuvest.br', 'fundmed.org.br', 'residencia.cmmg.edu.br',
  'www.galaxcms.com.br', 'unitau.br', 'anexos-r2.selecao.net.br'])
const requiredFields = ['source_rule_id', 'source_process_id', 'activity_codes', 'title', 'access_type',
  'specialties_text', 'source_item', 'status', 'scoring', 'shared_caps', 'requirements', 'caveats', 'evidence', 'checked_at']

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function nonempty(value) { return typeof value === 'string' && value.trim().length > 0 }
function optionalNumber(value) { return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0) }

export function validateCurriculumRules(rules) {
  assert(Array.isArray(rules) && rules.length, 'Release must contain rules')
  const ids = new Set()
  const caps = new Map()
  for (const rule of rules) {
    const id = rule.source_rule_id
    assert.deepEqual(Object.keys(rule).sort(), [...requiredFields].sort(), `${id}: unexpected/missing field`)
    assert(nonempty(id) && /^CURR-[A-Z0-9-]+$/.test(id), `${id}: invalid ID`)
    assert(!ids.has(id), `${id}: duplicate rule`)
    ids.add(id)
    assert(/^20\d{2}-.+/.test(rule.source_process_id) && Number(rule.source_process_id.slice(0, 4)) >= 2025, `${id}: invalid process/year`)
    assert(Array.isArray(rule.activity_codes) && rule.activity_codes.length && new Set(rule.activity_codes).size === rule.activity_codes.length, `${id}: activities missing/duplicated`)
    assert(rule.activity_codes.every((code) => activityCodes.has(code)), `${id}: unknown activity`)
    assert(nonempty(rule.title) && nonempty(rule.source_item), `${id}: title/item missing`)
    assert(['DIRECT', 'PREREQUISITE', 'BOTH'].includes(rule.access_type), `${id}: invalid access`)
    assert(rule.specialties_text === null || nonempty(rule.specialties_text), `${id}: invalid specialties`)
    assert(['POINTS_CONFIRMED', 'REVIEW_REQUIRED', 'NO_POINTS'].includes(rule.status), `${id}: invalid status`)
    assert(rule.checked_at === '2026-08-30', `${id}: unexpected audit date`)
    const score = rule.scoring
    assert(score && ['PER_UNIT', 'FIXED', 'TIERS', 'MAX_ONLY', 'MANUAL'].includes(score.type), `${id}: invalid score type`)
    assert(nonempty(score.description), `${id}: score explanation missing`)
    for (const field of ['points_per_unit', 'max_points', 'max_units']) assert(optionalNumber(score[field]), `${id}: invalid ${field}`)
    assert(score.unit === null || nonempty(score.unit), `${id}: invalid unit`)
    assert(score.max_units === null || (Number.isInteger(score.max_units) && score.max_units > 0), `${id}: invalid unit limit`)
    if (score.type === 'PER_UNIT') assert(score.points_per_unit != null && nonempty(score.unit), `${id}: per-unit score incomplete`)
    if (score.type === 'FIXED') assert(score.points_per_unit != null, `${id}: fixed score missing`)
    if (score.type === 'MAX_ONLY') assert(score.points_per_unit === null && score.max_points != null, `${id}: invented per-unit value`)
    if (score.type === 'MANUAL') assert(rule.status === 'REVIEW_REQUIRED' && score.points_per_unit === null, `${id}: manual score must stay uncertain`)
    if (score.type === 'TIERS') {
      assert(Array.isArray(score.tiers) && score.tiers.length, `${id}: tiers missing`)
      assert(score.tiers.every((tier) => nonempty(tier.label) && typeof tier.points === 'number' && tier.points >= 0 && Number.isFinite(tier.points)), `${id}: invalid tier`)
    }
    if (rule.status === 'POINTS_CONFIRMED') assert(score.points_per_unit > 0 || score.max_points > 0 || score.tiers?.some((tier) => tier.points > 0), `${id}: positive score unproven`)
    if (rule.status === 'NO_POINTS') assert(score.points_per_unit === 0 && score.max_points === 0, `${id}: zero must be explicit`)
    if (score.points_per_unit != null && score.max_points != null) assert(score.points_per_unit <= score.max_points, `${id}: per-unit exceeds item cap`)
    for (const field of ['requirements', 'caveats']) assert(Array.isArray(rule[field]) && rule[field].every(nonempty), `${id}: invalid ${field}`)
    assert(rule.requirements.length, `${id}: requirements missing`)
    if (rule.status === 'REVIEW_REQUIRED') assert(rule.caveats.length, `${id}: review reason missing`)
    assert(Array.isArray(rule.shared_caps), `${id}: shared caps missing`)
    const ruleCaps = new Set()
    for (const cap of rule.shared_caps) {
      assert(nonempty(cap.code) && nonempty(cap.label) && typeof cap.max_points === 'number' && cap.max_points > 0, `${id}: invalid shared cap`)
      assert(!ruleCaps.has(cap.code), `${id}: duplicate cap`)
      ruleCaps.add(cap.code)
      const key = `${rule.source_process_id}|${rule.access_type}|${cap.code}`
      assert(!caps.has(key) || caps.get(key) === cap.max_points, `${id}: inconsistent shared cap`)
      caps.set(key, cap.max_points)
      if (score.max_points != null) assert(score.max_points <= cap.max_points, `${id}: item exceeds shared cap`)
    }
    assert(Array.isArray(rule.evidence) && rule.evidence.length, `${id}: evidence missing`)
    for (const source of rule.evidence) {
      const url = new URL(source.url)
      assert(url.protocol === 'https:' && sourceHosts.has(url.hostname), `${id}: unreviewed source host`)
      assert(nonempty(source.title) && nonempty(source.pages) && /^[0-9a-f]{64}$/.test(source.sha256), `${id}: incomplete evidence`)
    }
  }
  return true
}

export function loadCurriculumRelease() {
  const rules = SOURCE_PATHS.flatMap((path) => JSON.parse(readFileSync(path, 'utf8')))
    .sort((left, right) => left.source_rule_id.localeCompare(right.source_rule_id, 'en'))
  validateCurriculumRules(rules)
  const records = rules.map((rule) => ({ ...rule, record_hash: sha256(stableJson(rule)) }))
  return {
    code: RELEASE_CODE,
    checked_at: '2026-08-30',
    description: 'Primeira rodada curricular: sete processos, com pontuação, requisitos e limites; cobertura parcial e sem cálculo de nota pessoal.',
    rule_count: records.length,
    edict_count: new Set(records.map((rule) => rule.source_process_id)).size,
    source_sha256: sha256(stableJson(records)),
    rules: records,
  }
}

// Compare protected records before and after the seed, within the same transaction.
const protectedSnapshotSql = `select jsonb_object_agg(t.table_name, t.fingerprint) from (
    select 'edicts' as table_name, md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) as fingerprint from public.edicts x
    union all select 'journals', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.journals x
    union all select 'institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.institutions x
    union all select 'indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.indexers x
    union all select 'scientific_rules', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.scientific_rules x
    union all select 'edict_institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.edict_institutions x
    union all select 'journal_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.journal_id, x.indexer_id), '')) from public.journal_indexers x
    union all select 'edict_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.edict_id, x.indexer_id), '')) from public.edict_indexers x
  ) t`

export function buildMigration(release = loadCurriculumRelease()) {
  const payload = JSON.stringify(release.rules, null, 2)
  assert(!payload.includes('$curriculum_payload$'), 'Unsafe SQL delimiter')
  assert(!release.description.includes("'"), 'Escape release description explicitly')
  return `-- Generated from reviewed data/curriculum/2026-08-30/*.json.
-- Immutable after application: future audits must use a new version/migration.
-- New rows only; shared caps and uncertainties are not evaluated as personal eligibility.
do $curriculum_import$
declare
  payload constant jsonb := $curriculum_payload$${payload}$curriculum_payload$::jsonb;
  release_code_value constant text := '${release.code}';
  expected_hash constant text := '${release.source_sha256}';
  protected_before jsonb;
  protected_after jsonb;
begin
  if exists (select 1 from public.curriculum_releases where is_current and code <> release_code_value) then
    raise exception 'Another curriculum snapshot is active; review before replacing it';
  end if;
  if exists (select 1 from public.curriculum_releases where code = release_code_value
    and (source_sha256 <> expected_hash or rule_count <> ${release.rule_count} or edict_count <> ${release.edict_count})) then
    raise exception 'Curriculum release hash mismatch';
  end if;
  if exists (
    select 1 from jsonb_array_elements(payload) r
    left join public.edicts e on e.source_process_id = r->>'source_process_id'
    where e.id is null or e.entry_year is null or e.entry_year < 2025
  ) then
    raise exception 'Curriculum source process missing or outside the approved period';
  end if;

  protected_before := (${protectedSnapshotSql});
  insert into public.curriculum_releases(code,description,checked_at,source_sha256,rule_count,edict_count,is_current)
    values(release_code_value,'${release.description}','${release.checked_at}',expected_hash,${release.rule_count},${release.edict_count},false)
    on conflict(code) do nothing;

  insert into public.curriculum_rules(release_code,edict_id,source_process_id,source_rule_id,
    activity_codes,title,access_type,specialties_text,source_item,status,scoring,shared_caps,
    requirements,caveats,evidence,checked_at,record_hash)
  select release_code_value,e.id,r.source_process_id,r.source_rule_id,r.activity_codes,r.title,
    r.access_type,r.specialties_text,r.source_item,r.status,r.scoring,r.shared_caps,r.requirements,
    r.caveats,r.evidence,r.checked_at,r.record_hash
  from jsonb_to_recordset(payload) as r(source_process_id text,source_rule_id text,activity_codes text[],
    title text,access_type text,specialties_text text,source_item text,status text,scoring jsonb,
    shared_caps jsonb,requirements jsonb,caveats jsonb,evidence jsonb,checked_at date,record_hash text)
  join public.edicts e on e.source_process_id = r.source_process_id
  on conflict(release_code,source_rule_id) do nothing;

  if (select count(*) from public.curriculum_rules where release_code = release_code_value) <> ${release.rule_count}
    or (select count(distinct edict_id) from public.curriculum_rules where release_code = release_code_value) <> ${release.edict_count}
    or exists (
      select 1 from jsonb_array_elements(payload) p
      left join public.curriculum_rules r on r.release_code = release_code_value and r.source_rule_id = p->>'source_rule_id'
      where r.id is null or r.record_hash <> p->>'record_hash'
        or (to_jsonb(r) - array['id','edict_id','release_code','created_at']::text[]) <> p
    ) then
    raise exception 'Curriculum import reconciliation failed';
  end if;
  protected_after := (${protectedSnapshotSql});
  if protected_before <> protected_after then
    raise exception 'Protected existing records changed during curriculum import';
  end if;
  update public.curriculum_releases set is_current = true where code = release_code_value;
end;
$curriculum_import$;
`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const release = loadCurriculumRelease()
  const sql = buildMigration(release)
  // Git may check out CRLF on Windows; line endings do not change the frozen payload.
  if (process.argv.includes('--check')) assert.equal(readFileSync(MIGRATION_PATH, 'utf8').replace(/\r\n/g, '\n'), sql, 'Generated migration differs from reviewed sources')
  else writeFileSync(MIGRATION_PATH, sql, 'utf8')
  console.log(JSON.stringify({ mode: process.argv.includes('--check') ? 'check' : 'build',
    code: release.code, rules: release.rule_count, edicts: release.edict_count, sha256: release.source_sha256,
    statuses: Object.fromEntries(['POINTS_CONFIRMED','REVIEW_REQUIRED','NO_POINTS'].map((status) => [status, release.rules.filter((rule) => rule.status === status).length])) }))
}
