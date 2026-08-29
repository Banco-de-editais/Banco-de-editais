import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationPath = path.join(root, 'supabase', 'migrations', '20260829234500_complete_2027_official_rules.sql')
const auditPath = path.join(root, '.codex-work', 'normalization', 'official-completion-release-2026-08-29.json')

const releaseCode = 'APP-SCIENTIFIC-REFRESH-2026-08-29-v2'
const batchKey = 'SCIENTIFIC-REFRESH-2026-08-29-v2'
const coreVersion = 'OFFICIAL-REFRESH-2026-08-29-v2'

const sources = {
  EINSTEIN: {
    url: 'https://documento.vunesp.com.br/documento/stream/Nzc3MTg1NA%3d%3d',
    hash: null,
    pages: ['11'],
    note: 'Conferido no visualizador acessível oficial da Vunesp; o servidor de borda não permitiu gerar hash local.',
  },
  ICC: {
    url: 'https://icc.org.br/wp-content/uploads/2026/08/EDITAL-1.2026-PROCESSO-SELETIVO-RESIDENCIA-MEDICA-ICC-EDICAO-2026-2027-VIGENTE.pdf',
    hash: 'eff3c0aa2a42a454d1efc6b0fa9b250b634e55beffa41e6113aff8a061657745',
    pages: ['38–39 e 42'],
  },
  BOS: {
    url: 'https://documento.vunesp.com.br/documento/stream/Nzc3MDExNg%3d%3d',
    hash: null,
    pages: ['1'],
    note: 'Conferido no visualizador acessível oficial da Vunesp; o servidor de borda não permitiu gerar hash local.',
  },
  UERJ_DIRECT: {
    url: 'https://www.cepuerj.uerj.br/uploads/concursos/S04597_2027/b91b91c0c908ad777783669c5964cd6d9e493631fc00188bd453cb606d38673d.pdf',
    hash: '41627dc926780b8fcee2abc2b47b806e25605488bf8beedc8ad9cc90c341611f',
    pages: ['5–6'],
  },
  UERJ_PREREQ: {
    url: 'https://www.cepuerj.uerj.br/uploads/concursos/S04597_2027/737ef68b7f123b5c1bb2fa46e82aa707be4a64b652cf13c57b01a885ced40f96.pdf',
    hash: 'ea498eff1d08a669e2fa24877e30e13dd50e6476c0bfeae1dd7c27e96839a50a',
    pages: ['4–6'],
  },
  UERJ_AREAS: {
    url: 'https://www.cepuerj.uerj.br/uploads/concursos/S04597_2027/2aff48159eb7fb7bc16dd924671c822334a5cd9d621d4337e500cd14502cb001.pdf',
    hash: 'f1d52a3a4c8e3aa2187d7fa64bc634108cd8d4602bae3de4889ba4714c9eae1b',
    pages: ['5–6'],
  },
  CEPOA: {
    url: 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4924_riodejaneirocepoaresidnciamdica.....pdf',
    hash: 'e0b27203354c08f51bf3ba576eea774450c7bc2f11112eee74714bb007678084',
    pages: ['17'],
  },
}

const edictUpdates = [
  {
    source_process_id: '2027-SP-EINSTEIN-VUNESP',
    published_at: '2026-08-03',
    application_deadline: '2026-09-21',
    source_url: 'https://www.vunesp.com.br/FEAE2603',
    access_type: 'ambos',
    curriculum_analysis_status: 'Análise curricular com regra parcial de artigo localizada; pesos aguardam aditivo oficial',
    curriculum_weight_percent: 10,
    phase_nature: 'classificatória',
    document_status: 'Conferido no visualizador acessível da fonte oficial',
    validation_status: 'Parcial',
    coverage_status: 'PARTIAL_RULES',
    source_notes: 'Publicações precisam estar no PubMed. DOI é premissa operacional; autoria e JCR alteram a pontuação, cujos pesos ainda serão publicados em aditivo.',
  },
  {
    source_process_id: '2027-CE-ICC-COREME',
    published_at: '2026-08-24',
    application_deadline: '2026-09-24',
    source_url: 'https://icc.org.br/residencia-medica/',
    access_type: 'ambos',
    curriculum_analysis_status: 'Análise curricular com regra de artigo localizada',
    curriculum_weight_percent: 10,
    phase_nature: 'classificatória',
    document_status: 'Baixado e conferido em fonte oficial',
    validation_status: 'Validada',
    coverage_status: 'RULES_PUBLISHED',
    source_notes: 'Artigo publicado ou aceito na área da saúde, em periódico científico indexado na área da saúde, pontua 5 por item até 20.',
  },
  {
    source_process_id: '2027-SP-BOS-VUNESP',
    published_at: '2026-07-31',
    application_deadline: '2026-09-08',
    source_url: 'https://www.vunesp.com.br/BOSO2602',
    access_type: 'direto',
    curriculum_analysis_status: 'Sem etapa curricular que pontue produção científica',
    curriculum_weight_percent: 0,
    phase_nature: 'não aplicável',
    document_status: 'Conferido no visualizador acessível da fonte oficial',
    validation_status: 'Validada',
    coverage_status: 'NO_SCIENTIFIC_SCORING',
    source_notes: 'O edital oficial declara fase única composta apenas por prova objetiva.',
  },
  {
    source_process_id: '2027-RJ-UERJ-CEPUERJ',
    published_at: '2026-08-18',
    application_deadline: '2026-10-01',
    source_url: 'https://www.cepuerj.uerj.br/concursos2.php?ano=2027&concurso=S04597',
    access_type: 'ambos',
    curriculum_analysis_status: 'Sem etapa curricular que pontue produção científica',
    curriculum_weight_percent: 0,
    phase_nature: 'não aplicável',
    document_status: 'Três editais oficiais baixados e conferidos',
    validation_status: 'Validada',
    coverage_status: 'NO_SCIENTIFIC_SCORING',
    source_notes: 'Acesso direto e pré-requisito usam prova objetiva; áreas de atuação usam prova discursiva. O resultado decorre exclusivamente da prova aplicável.',
  },
  {
    source_process_id: '2027-RJ-CEPOA-CONSESP',
    published_at: '2026-08-14',
    application_deadline: '2027-01-10',
    source_url: 'https://sis.consesp.com.br/site/index.php?codigo=4924&pg=concursos/info',
    access_type: 'direto',
    curriculum_analysis_status: 'Análise curricular com regra de artigo localizada',
    curriculum_weight_percent: 10,
    phase_nature: 'classificatória',
    document_status: 'Baixado e conferido em fonte oficial',
    validation_status: 'Validada',
    coverage_status: 'RULES_PUBLISHED',
    source_notes: 'Artigo científico em revista ou periódico com corpo editorial: autor 0,5; coautor 0,25; máximo 1,0.',
  },
]

const assessment = ({ source_process_id, status, basis, sourceList, notes }) => ({
  source_process_id,
  assessment_status: status,
  assessment_basis: basis,
  official_urls: sourceList.map((source) => source.url),
  document_hashes: sourceList.map((source) => source.hash).filter(Boolean),
  page_references: sourceList.flatMap((source) => source.pages),
  notes,
  source_metadata: {
    method: 'OFFICIAL_FOCUSED_COMPLETION',
    consulted_at: '2026-08-29',
    source_notes: sourceList.map((source) => source.note).filter(Boolean),
  },
})

const assessments = [
  assessment({
    source_process_id: '2027-SP-EINSTEIN-VUNESP',
    status: 'PARTIAL_RULES',
    basis: 'A fonte oficial define PubMed, autoria, DOI e JCR como critérios; os pesos serão objeto de aditivo posterior.',
    sourceList: [sources.EINSTEIN],
    notes: 'A regra segura de elegibilidade foi publicada; autoria e JCR permanecem como ressalva de pontuação. DOI não gera pendência pela política operacional do produto.',
  }),
  assessment({
    source_process_id: '2027-CE-ICC-COREME',
    status: 'RULES_PUBLISHED',
    basis: 'Os anexos de acesso direto e pré-requisito repetem a mesma regra objetiva de artigo indexado.',
    sourceList: [sources.ICC],
    notes: 'ISSN ou DOI é exigência documental alternativa; DOI não gera pendência pela política operacional do produto.',
  }),
  assessment({
    source_process_id: '2027-SP-BOS-VUNESP',
    status: 'NO_SCIENTIFIC_SCORING',
    basis: 'O edital oficial declara fase única composta por prova objetiva.',
    sourceList: [sources.BOS],
    notes: 'Não há regra de artigo a normalizar para a consulta.',
  }),
  assessment({
    source_process_id: '2027-RJ-UERJ-CEPUERJ',
    status: 'NO_SCIENTIFIC_SCORING',
    basis: 'Os três editais oficiais atribuem a classificação exclusivamente à prova objetiva ou discursiva aplicável.',
    sourceList: [sources.UERJ_DIRECT, sources.UERJ_PREREQ, sources.UERJ_AREAS],
    notes: 'Referências bibliográficas citadas nos editais não são produção curricular e não foram convertidas em regras de artigo.',
  }),
  assessment({
    source_process_id: '2027-RJ-CEPOA-CONSESP',
    status: 'RULES_PUBLISHED',
    basis: 'O Anexo III contém pontuação objetiva para artigo científico em revista ou periódico com corpo editorial.',
    sourceList: [sources.CEPOA],
    notes: 'Autoria altera somente o valor da pontuação; a elegibilidade do artigo é objetiva.',
  }),
]

const typeCondition = {
  field: 'production.type',
  operator: 'EQ',
  value: 'ARTICLE_PUBLICATION',
  required: true,
  negated: false,
  confidence: 'HIGH',
  evidence_ref: 'OFFICIAL_DOCUMENT',
}

const condition = (field, operator, value) => ({
  field,
  operator,
  value,
  required: true,
  negated: false,
  confidence: 'HIGH',
  evidence_ref: 'OFFICIAL_DOCUMENT',
})

const rootAll = (...conditions) => [{
  code: 'ROOT',
  parent: null,
  operator: 'ALL',
  critical: true,
  conditions: [typeCondition, ...conditions],
}]

function makeRule({
  id,
  process,
  groups = rootAll(),
  score,
  indexers = [],
  evidence,
  requirementLabel,
  unknown = [],
  warnings = ['DOCUMENTARY_VALIDATION_REQUIRED'],
}) {
  const rule = {
    source_rule_id: id,
    source_process_id: process,
    release_code: releaseCode,
    core_version: coreVersion,
    family: 'ARTIGO_PUBLICACAO',
    production_type: 'ARTICLE_PUBLICATION',
    accepted_production_types: ['ARTICLE_PUBLICATION'],
    initial_eligibility: 'SIM_SEM_CALCULO',
    mapping_status: unknown.length ? 'PARTIAL' : 'APPROVED',
    published_for_engine: true,
    mapping_confidence: unknown.length ? 'MEDIUM' : 'HIGH',
    matrix_row: null,
    scope: {
      processo_id: process,
      scope_type: 'Tipo de acesso',
      access_type: 'BOTH',
      inclusion_operator: 'INCLUDE',
    },
    condition_groups: groups,
    score_formula: score,
    indexing_requirements: indexers,
    qualis_requirement: null,
    authorship_requirement: null,
    document_requirements: [],
    date_window: null,
    presentation_formats: [],
    event_scopes: [],
    publication_scopes: [],
    event_organizer: null,
    subject_area_requirement: null,
    evidence: { ...evidence, source_status: 'Confirmado em fonte oficial' },
    unknown_data: unknown,
    warnings,
    review: {
      automated_technical_review: true,
      human_review: false,
      decision: unknown.length ? 'PUBLISH_PARTIAL' : 'APPROVE',
      method: 'OFFICIAL_FOCUSED_COMPLETION',
      reviewer: 'codex-primary-agent',
    },
    source_metadata: {
      classification_reason: evidence.excerpt,
      requirement_label: requirementLabel,
      review_messages: [],
      source_notes: null,
    },
  }
  rule.mapping_hash = crypto.createHash('sha256').update(JSON.stringify(rule)).digest('hex')
  return rule
}

const rules = [
  makeRule({
    id: 'EINSTEIN-2027-PUBMED-ARTICLE',
    process: '2027-SP-EINSTEIN-VUNESP',
    groups: rootAll(condition('production.indexings', 'IN', ['PUBMED'])),
    score: {
      type: 'MANUAL',
      positive_score_confirmed: true,
      literal_formula: 'PubMed é obrigatório; autoria e JCR alteram a pontuação. Pesos aguardam aditivo oficial.',
    },
    indexers: [{ base: 'PUBMED', operator: 'ANY', exact_match_allowed: true, confidence: 'HIGH', source_text: 'PubMed' }],
    requirementLabel: 'Indexação: PubMed; autoria e JCR alteram somente a pontuação; pesos aguardam aditivo',
    evidence: {
      official_url: sources.EINSTEIN.url,
      page: '11',
      document_sha256: null,
      excerpt: 'Publicações em periódicos indexados e disponíveis no PubMed; autoria, DOI e JCR são critérios avaliados.',
    },
    unknown: ['score_formula.points_per_item', 'score_formula.maximum_points'],
    warnings: ['WEIGHTS_PENDING_OFFICIAL_ADDENDUM', 'AUTHORSHIP_AND_JCR_AFFECT_SCORE', 'DOCUMENTARY_VALIDATION_REQUIRED'],
  }),
  makeRule({
    id: 'ICC-2027-HEALTH-INDEXED-ARTICLE',
    process: '2027-CE-ICC-COREME',
    groups: rootAll(condition('production.indexings', 'HAS_ANY', true)),
    score: {
      type: 'PER_ITEM',
      points_per_item: 5,
      maximum_points: 20,
      positive_score_confirmed: true,
      unit: 'ARTICLE',
      item_limit: 4,
    },
    indexers: [{ base: 'ANY_RECOGNIZED_HEALTH_INDEXER', operator: 'HAS_ANY', exact_match_allowed: true, confidence: 'HIGH', source_text: 'periódicos científicos indexados na área de saúde' }],
    requirementLabel: 'Indexação: qualquer base científica da área da saúde cadastrada',
    evidence: {
      official_url: sources.ICC.url,
      page: '38–39 e 42',
      document_sha256: sources.ICC.hash,
      excerpt: 'Artigo publicado ou aceito na área da saúde em periódico científico indexado: 5 pontos por item, máximo 20.',
    },
  }),
  makeRule({
    id: 'CEPOA-2027-EDITORIAL-BOARD-ARTICLE',
    process: '2027-RJ-CEPOA-CONSESP',
    score: {
      type: 'MANUAL',
      maximum_points: 1,
      positive_score_confirmed: true,
      literal_formula: 'Autor: 0,5; coautor: 0,25 por publicação; máximo 1,0.',
    },
    requirementLabel: 'Artigo científico em revista ou periódico com corpo editorial; autoria altera a pontuação',
    evidence: {
      official_url: sources.CEPOA.url,
      page: '17',
      document_sha256: sources.CEPOA.hash,
      excerpt: 'Publicação de artigo científico em revista ou periódico com corpo editorial: autor 0,5; coautor 0,25; máximo 1,0.',
    },
    warnings: ['AUTHORSHIP_AFFECTS_SCORE', 'DOCUMENTARY_VALIDATION_REQUIRED'],
  }),
]

const sourceSha = crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex')
const mappingSha = crypto.createHash('sha256').update(JSON.stringify({ edictUpdates, assessments, rules })).digest('hex')
const jsonSql = (tag, value) => `$${tag}$${JSON.stringify(value)}$${tag}$::jsonb`

const migration = `-- Focused completion of five official 2027 residency sources.
-- Generated by scripts/build-2027-official-completion.mjs.
-- Source bundle SHA-256: ${sourceSha}
-- Mapping release: ${releaseCode} (${mappingSha})
-- Additive release: the already-applied v1 refresh remains immutable.

set local statement_timeout = '120s';

insert into public.scientific_import_batches (
  batch_key, core_version, source_file_name, source_sha256,
  mapping_release, mapping_sha256, status, counts
)
values (
  '${batchKey}', '${coreVersion}', 'official-completion-2026-08-29.json', '${sourceSha}',
  '${releaseCode}', '${mappingSha}', 'PREPARED',
  '${JSON.stringify({ updated_edicts: edictUpdates.length, assessments: assessments.length, new_rules: rules.length, rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size })}'::jsonb
)
on conflict (batch_key) do nothing;

with source_updates as (
  select * from jsonb_to_recordset(${jsonSql('completion_edicts', edictUpdates)}) as item(
    source_process_id text, published_at date, application_deadline date,
    source_url text, access_type text, curriculum_analysis_status text,
    curriculum_weight_percent numeric, phase_nature text, document_status text,
    validation_status text, coverage_status text, source_notes text
  )
)
update public.edicts edict
set published_at = item.published_at,
    application_deadline = item.application_deadline,
    source_url = item.source_url,
    access_type = item.access_type,
    curriculum_analysis_status = item.curriculum_analysis_status,
    curriculum_weight_percent = item.curriculum_weight_percent,
    phase_nature = item.phase_nature,
    document_status = item.document_status,
    validation_status = item.validation_status,
    coverage_status = item.coverage_status,
    source_notes = item.source_notes,
    active = true
from source_updates item
where edict.source_process_id = item.source_process_id;

with source_assessments as (
  select * from jsonb_to_recordset(${jsonSql('completion_assessments', assessments)}) as item(
    source_process_id text, assessment_status text, assessment_basis text,
    official_urls jsonb, document_hashes jsonb, page_references jsonb,
    notes text, source_metadata jsonb
  )
)
insert into public.scientific_coverage_assessments (
  import_batch_id, edict_id, source_process_id, release_code, assessment_status,
  previous_coverage_status, assessment_basis, official_urls, document_hashes,
  page_references, notes, source_metadata
)
select batch.id, edict.id, item.source_process_id, '${releaseCode}', item.assessment_status,
  'EXTRACTION_PENDING', item.assessment_basis, item.official_urls, item.document_hashes,
  item.page_references, item.notes, item.source_metadata
from source_assessments item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch on batch.batch_key = '${batchKey}'
on conflict (release_code, source_process_id) do nothing;

with source_rules as (
  select * from jsonb_to_recordset(${jsonSql('completion_rules', rules)}) as item(
    source_rule_id text, source_process_id text, release_code text, core_version text,
    family text, production_type text, accepted_production_types jsonb,
    initial_eligibility text, mapping_status text, published_for_engine boolean,
    mapping_confidence text, matrix_row integer, scope jsonb, condition_groups jsonb,
    score_formula jsonb, indexing_requirements jsonb, qualis_requirement jsonb,
    authorship_requirement jsonb, document_requirements jsonb, date_window jsonb,
    presentation_formats jsonb, event_scopes jsonb, publication_scopes jsonb,
    event_organizer jsonb, subject_area_requirement jsonb, evidence jsonb,
    unknown_data jsonb, warnings jsonb, review jsonb, source_metadata jsonb,
    mapping_hash text
  )
)
insert into public.scientific_rules (
  import_batch_id, edict_id, source_rule_id, source_process_id, release_code, core_version,
  family, production_type, accepted_production_types, initial_eligibility, mapping_status,
  published_for_engine, mapping_confidence, matrix_row, scope, condition_groups, score_formula,
  indexing_requirements, qualis_requirement, authorship_requirement, document_requirements,
  date_window, presentation_formats, event_scopes, publication_scopes, event_organizer,
  subject_area_requirement, evidence, unknown_data, warnings, review, source_metadata, mapping_hash
)
select batch.id, edict.id, item.source_rule_id, item.source_process_id, item.release_code,
  item.core_version, item.family, item.production_type, item.accepted_production_types,
  item.initial_eligibility, item.mapping_status, item.published_for_engine,
  item.mapping_confidence, item.matrix_row, item.scope, item.condition_groups,
  item.score_formula, item.indexing_requirements, item.qualis_requirement,
  item.authorship_requirement, item.document_requirements, item.date_window,
  item.presentation_formats, item.event_scopes, item.publication_scopes,
  item.event_organizer, item.subject_area_requirement, item.evidence, item.unknown_data,
  item.warnings, item.review, item.source_metadata, item.mapping_hash
from source_rules item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch on batch.batch_key = '${batchKey}'
on conflict (release_code, source_rule_id) do nothing;

update public.scientific_import_batches
set status = 'APPLIED', completed_at = now(), counts = counts || jsonb_build_object(
  'applied_edicts', (select count(*) from public.edicts where source_process_id in (select jsonb_array_elements_text('${JSON.stringify(edictUpdates.map((item) => item.source_process_id))}'::jsonb))),
  'applied_assessments', (select count(*) from public.scientific_coverage_assessments where release_code = '${releaseCode}'),
  'applied_rules', (select count(*) from public.scientific_rules where release_code = '${releaseCode}')
)
where batch_key = '${batchKey}';

do $$
declare
  edict_count integer;
  assessment_count integer;
  rule_count integer;
  rule_process_count integer;
  unresolved_count integer;
  policy_condition_count integer;
  active_pre_2025 integer;
begin
  select count(*) into edict_count
  from public.edicts
  where source_process_id in (select jsonb_array_elements_text('${JSON.stringify(edictUpdates.map((item) => item.source_process_id))}'::jsonb));
  if edict_count <> 5 then raise exception 'Expected 5 completed edicts, found %.', edict_count; end if;

  select count(*) into assessment_count
  from public.scientific_coverage_assessments
  where release_code = '${releaseCode}';
  if assessment_count <> 5 then raise exception 'Expected 5 completion assessments, found %.', assessment_count; end if;

  select count(*), count(distinct source_process_id) into rule_count, rule_process_count
  from public.scientific_rules
  where release_code = '${releaseCode}';
  if rule_count <> 3 then raise exception 'Expected 3 completion rules, found %.', rule_count; end if;
  if rule_process_count <> 3 then raise exception 'Expected 3 completion rule processes, found %.', rule_process_count; end if;

  select count(*) into unresolved_count
  from public.edicts
  where source_process_id in (select jsonb_array_elements_text('${JSON.stringify(edictUpdates.map((item) => item.source_process_id))}'::jsonb))
    and coverage_status = 'EXTRACTION_PENDING';
  if unresolved_count <> 0 then raise exception 'Expected zero focused extraction pendencies, found %.', unresolved_count; end if;

  select count(*) into policy_condition_count
  from public.scientific_rules rule,
       jsonb_array_elements(rule.condition_groups) as group_item(group_json),
       jsonb_array_elements(group_item.group_json -> 'conditions') as condition_item(condition_json)
  where rule.release_code = '${releaseCode}'
    and condition_item.condition_json ->> 'field' in ('production.identifiers.doi', 'production.publication_status');
  if policy_condition_count <> 0 then raise exception 'DOI/publication-status conditions must not be published in completion rules.'; end if;

  if exists (
    select 1 from public.edicts
    where source_process_id in ('2027-SP-BOS-VUNESP', '2027-RJ-CEPOA-CONSESP')
      and access_type <> 'direto'
  ) then raise exception 'BOS and CEPOA must be normalized as direct access.'; end if;

  select count(*) into active_pre_2025 from public.edicts where entry_year < 2025 and active;
  if active_pre_2025 <> 0 then raise exception 'Expected zero active pre-2025 edicts, found %.', active_pre_2025; end if;
end $$;
`

const audit = {
  generated_at: new Date().toISOString(),
  release_code: releaseCode,
  batch_key: batchKey,
  core_version: coreVersion,
  source_sha256: sourceSha,
  mapping_sha256: mappingSha,
  counts: {
    updated_edicts: edictUpdates.length,
    assessments: assessments.length,
    rules: rules.length,
    rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size,
  },
  sources,
  edict_updates: edictUpdates,
  assessments,
  rules,
}

await fs.mkdir(path.dirname(migrationPath), { recursive: true })
await fs.mkdir(path.dirname(auditPath), { recursive: true })
await fs.writeFile(migrationPath, migration, 'utf8')
await fs.writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({ migrationPath, auditPath, counts: audit.counts }, null, 2))
