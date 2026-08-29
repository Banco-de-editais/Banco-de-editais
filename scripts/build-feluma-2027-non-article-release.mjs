import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const outputPath = resolve(repositoryRoot, 'supabase/migrations/20260829235500_add_feluma_2027_non_article_rules.sql')

const RELEASE_CODE = 'APP-SCIENTIFIC-FELUMA-2027-v1'
const BATCH_KEY = 'SCIENTIFIC-FELUMA-2027-2026-08-29-v1'
const CORE_VERSION = 'CORE-v2.3-AUDITADO+FELUMA-2027-1A-RETIFICACAO'
const PROCESS_ID = '2027-MG-FELUMA-FELUMA'
const SOURCE = {
  page: 'https://residencia.cmmg.edu.br/',
  pdf: 'https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf',
  addendum: 'https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Minuta-Adendo-Edital-019-2026-Residencia-Medica.pdf',
  sha256: '5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f',
}

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

function condition(field, operator, value) {
  return {
    field,
    operator,
    value,
    required: true,
    negated: false,
    confidence: 'HIGH',
    evidence_ref: 'FELUMA_2027_1A_RETIFICACAO',
    unknown_policy: 'PROPAGATE_UNKNOWN',
  }
}

function score(pointsPerItem, maximumPoints, itemLimit, sharedCapCode, sharedCapMaximum) {
  return {
    type: 'PER_ITEM',
    points_per_item: String(pointsPerItem),
    maximum_points: String(maximumPoints),
    item_limit: itemLimit,
    positive_score_confirmed: true,
    cap_scope: 'SHARED_SECTION',
    shared_cap_code: sharedCapCode,
    shared_cap_maximum: String(sharedCapMaximum),
    unit: 'ITEM',
    normalized_expression: `min(min(item_count, ${itemLimit}) * ${pointsPerItem}, ${maximumPoints})`,
  }
}

function makeRule({
  id,
  family,
  productionType,
  acceptedTypes,
  accessType,
  conditions,
  scoreFormula,
  page,
  excerpt,
  requirementLabel,
  documentRequirements,
  eventScopes = [],
  warnings = ['DOCUMENTARY_VALIDATION_REQUIRED'],
}) {
  const rule = {
    source_rule_id: id,
    source_process_id: PROCESS_ID,
    release_code: RELEASE_CODE,
    core_version: CORE_VERSION,
    family,
    production_type: productionType,
    accepted_production_types: acceptedTypes,
    initial_eligibility: scoreFormula.positive_score_confirmed ? 'SIM_AUTOMATICO' : 'NAO',
    mapping_status: 'APPROVED',
    published_for_engine: true,
    mapping_confidence: 'HIGH',
    matrix_row: null,
    scope: {
      processo_id: PROCESS_ID,
      scope_type: 'Tipo de acesso',
      access_type: accessType,
      inclusion_operator: 'INCLUDE',
      entry_year: 2027,
    },
    condition_groups: [{
      code: 'ROOT',
      parent: null,
      operator: 'ALL',
      critical: true,
      conditions,
    }],
    score_formula: scoreFormula,
    indexing_requirements: [],
    qualis_requirement: null,
    authorship_requirement: null,
    document_requirements: documentRequirements,
    date_window: null,
    presentation_formats: [],
    event_scopes: eventScopes,
    publication_scopes: [],
    event_organizer: null,
    subject_area_requirement: null,
    evidence: {
      official_url: SOURCE.pdf,
      page,
      document_sha256: SOURCE.sha256,
      source_status: 'Confirmado na 1ª retificação oficial',
      excerpt,
    },
    unknown_data: [],
    warnings,
    review: {
      automated_technical_review: true,
      human_review: false,
      decision: 'APPROVE',
      method: 'OFFICIAL_PDF_TEXT_AND_VISUAL_REVIEW',
      reviewer: 'codex-primary-agent',
    },
    source_metadata: {
      requirement_label: requirementLabel,
      classification_reason: 'Critério literal com categoria, requisitos e pontuação estruturáveis na fonte oficial.',
      source_page: SOURCE.page,
      later_addendum: SOURCE.addendum,
      later_addendum_effect: 'Reabertura de prazo de pagamento; critérios de avaliação mantidos.',
    },
  }

  rule.mapping_hash = sha256(stableJson(rule))
  return rule
}

const accessConfigs = [
  {
    code: 'DIRECT',
    articleBookPoints: '1',
    articleBookMax: '2',
    articleBookSharedCap: 'FELUMA-2027-DIRECT-PUBLICATIONS',
    eventSharedCap: 'FELUMA-2027-DIRECT-EVENTS',
    eventSharedMaximum: '1',
    chapterPages: '63–65',
    eventPages: '67–68',
  },
  {
    code: 'PREREQUISITE',
    articleBookPoints: '1.5',
    articleBookMax: '3',
    articleBookSharedCap: 'FELUMA-2027-PREREQUISITE-PUBLICATIONS',
    eventSharedCap: 'FELUMA-2027-PREREQUISITE-EVENTS',
    eventSharedMaximum: '2',
    chapterPages: '82–84',
    eventPages: '86–87',
  },
]

const publishedWorkDocuments = [
  { type: 'PUBLISHED_WORK', required_state: 'REQUIRED', source_text: 'Obra efetivamente publicada; declaração de aceite não é aceita.' },
  { type: 'ISBN', required_state: 'REQUIRED', source_text: 'ISBN visível no documento comprobatório.' },
]

const eventDocuments = [
  { type: 'EVENT_CERTIFICATE_OR_DECLARATION', required_state: 'REQUIRED', source_text: 'Certificado ou declaração da apresentação emitido pela organização do evento.' },
]

const rules = []
for (const access of accessConfigs) {
  rules.push(makeRule({
    id: `FELUMA-2027-${access.code}-CHAPTER`,
    family: 'LIVRO_CAPITULO',
    productionType: 'BOOK_CHAPTER',
    acceptedTypes: ['CHAPTER'],
    accessType: access.code,
    conditions: [
      condition('production.type', 'EQ', 'CHAPTER'),
      condition('production.identifiers.isbn', 'IS_TRUE', true),
      condition('production.publication_status', 'EQ', 'PUBLISHED'),
    ],
    scoreFormula: score(access.articleBookPoints, access.articleBookMax, 2, access.articleBookSharedCap, access.articleBookMax),
    page: access.chapterPages,
    excerpt: `Capítulo de livro publicado: ${access.articleBookPoints} ponto(s) por capítulo, até dois documentos; obra com ISBN.`,
    requirementLabel: 'Capítulo publicado, com ISBN; aceite sem publicação não pontua',
    documentRequirements: publishedWorkDocuments,
  }))

  rules.push(makeRule({
    id: `FELUMA-2027-${access.code}-BOOK-ORGANIZER`,
    family: 'LIVRO_CAPITULO',
    productionType: 'BOOK',
    acceptedTypes: ['BOOK'],
    accessType: access.code,
    conditions: [
      condition('production.type', 'EQ', 'BOOK'),
      condition('production.authorship.role', 'EQ', 'ORGANIZER'),
      condition('production.identifiers.isbn', 'IS_TRUE', true),
      condition('production.publication_status', 'EQ', 'PUBLISHED'),
    ],
    scoreFormula: score(access.articleBookPoints, access.articleBookMax, 2, access.articleBookSharedCap, access.articleBookMax),
    page: access.chapterPages,
    excerpt: `Organização de livro publicado: ${access.articleBookPoints} ponto(s) por livro, até dois documentos; candidato deve constar como organizador.`,
    requirementLabel: 'Livro publicado, com ISBN, no qual o candidato consta como organizador',
    documentRequirements: [
      ...publishedWorkDocuments,
      { type: 'ORGANIZER_ROLE', required_state: 'REQUIRED', source_text: 'O candidato deve constar como organizador, não apenas como autor ou coautor.' },
    ],
  }))

  rules.push(makeRule({
    id: `FELUMA-2027-${access.code}-EVENT-PRESENTATION`,
    family: 'APRESENTACAO_EVENTO',
    productionType: 'EVENT_PRESENTATION',
    acceptedTypes: ['EVENT_PRESENTATION', 'ABSTRACT_PROCEEDINGS'],
    accessType: access.code,
    conditions: [
      condition('production.type', 'IN', ['EVENT_PRESENTATION', 'ABSTRACT_PROCEEDINGS']),
      condition('production.event.presented', 'IS_TRUE', true),
      condition('production.event.scope', 'IN', ['REGIONAL', 'NATIONAL', 'INTERNATIONAL']),
    ],
    scoreFormula: score('0.5', '1', 2, access.eventSharedCap, access.eventSharedMaximum),
    page: access.eventPages,
    excerpt: 'Apresentação de trabalho em evento científico regional, nacional ou internacional: 0,5 ponto por documento, até dois documentos.',
    requirementLabel: 'Trabalho apresentado em evento científico regional, nacional ou internacional; todos os autores pontuam',
    documentRequirements: eventDocuments,
    eventScopes: ['REGIONAL', 'NATIONAL', 'INTERNATIONAL'],
  }))

  rules.push(makeRule({
    id: `FELUMA-2027-${access.code}-ABSTRACT-WITHOUT-PRESENTATION-NO-SCORE`,
    family: 'RESUMO_ANAIS',
    productionType: 'ABSTRACT_PROCEEDINGS',
    acceptedTypes: ['ABSTRACT_PROCEEDINGS'],
    accessType: access.code,
    conditions: [condition('production.type', 'EQ', 'ABSTRACT_PROCEEDINGS')],
    scoreFormula: {
      type: 'NO_SCORE',
      points_per_item: '0',
      maximum_points: '0',
      positive_score_confirmed: false,
      literal_formula: 'Resumo ou trabalho em anais, sem comprovação de apresentação, não pontua como artigo/publicação.',
    },
    page: access.chapterPages,
    excerpt: 'Artigos em anais de eventos, pôsteres, resumos e resumos expandidos não são pontuados no item de publicação.',
    requirementLabel: 'Resumo em anais, por si só, não pontua; pode pontuar se houver apresentação comprovada em evento elegível',
    documentRequirements: [],
    warnings: ['EXPLICIT_NO_SCORE_BRANCH'],
  }))
}

const assessment = {
  source_process_id: PROCESS_ID,
  assessment_status: 'PARTIAL_RULES',
  assessment_basis: 'A 1ª retificação oficial foi conferida visualmente e as categorias consultáveis de capítulo, livro, resumo em anais e apresentação em evento foram estruturadas; atividades científicas amplas fora dessas categorias permanecem fora da automação.',
  official_urls: [SOURCE.page, SOURCE.pdf, SOURCE.addendum],
  document_hashes: [SOURCE.sha256],
  page_references: rules.map((rule) => `${rule.source_rule_id}: ${rule.evidence.page}`),
  notes: 'Resumo em anais não foi tratado como artigo. Quando o mesmo trabalho foi efetivamente apresentado, ele pode usar a regra de apresentação em evento. Nenhum requisito ausente foi promovido a compatibilidade.',
  source_metadata: {
    method: 'OFFICIAL_PDF_TEXT_AND_VISUAL_REVIEW',
    visual_pages_reviewed: [63, 64, 65, 67, 82, 83, 84, 86],
    release_scope: ['BOOK', 'CHAPTER', 'ABSTRACT_PROCEEDINGS', 'EVENT_PRESENTATION'],
  },
}

const sourceSha256 = sha256(stableJson(SOURCE))
const mappingSha256 = sha256(stableJson({ assessment, rules }))
const jsonSql = (tag, value) => `$${tag}$${JSON.stringify(value)}$${tag}$::jsonb`

const migration = `-- FELUMA 2027 non-article scientific rules.
-- Generated by scripts/build-feluma-2027-non-article-release.mjs.
-- Official PDF SHA-256: ${SOURCE.sha256}
-- Source bundle SHA-256: ${sourceSha256}
-- Mapping release: ${RELEASE_CODE} (${mappingSha256})
-- Additive release: prior migrations remain immutable.

set local statement_timeout = '120s';

insert into public.scientific_import_batches (
  batch_key, core_version, source_file_name, source_sha256,
  mapping_release, mapping_sha256, status, counts
)
values (
  '${BATCH_KEY}', '${CORE_VERSION}', 'Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf', '${sourceSha256}',
  '${RELEASE_CODE}', '${mappingSha256}', 'PREPARED',
  '${JSON.stringify({ updated_edicts: 1, assessments: 1, new_rules: rules.length, rule_processes: 1 })}'::jsonb
)
on conflict (batch_key) do nothing;

with source_assessment as (
  select * from jsonb_to_recordset(${jsonSql('feluma_assessment', [assessment])}) as item(
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
select batch.id, edict.id, item.source_process_id, '${RELEASE_CODE}', item.assessment_status,
  edict.coverage_status, item.assessment_basis, item.official_urls, item.document_hashes,
  item.page_references, item.notes, item.source_metadata
from source_assessment item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch on batch.batch_key = '${BATCH_KEY}'
on conflict (release_code, source_process_id) do nothing;

update public.edicts
set source_url = '${SOURCE.pdf}',
    curriculum_analysis_status = 'Análise curricular com regras de artigo, capítulo, livro e apresentação em evento localizadas',
    document_status = '1ª retificação oficial baixada e conferida visualmente',
    validation_status = 'Validada para as categorias estruturadas',
    coverage_status = 'PARTIAL_RULES',
    source_notes = 'Regras de artigo já publicadas; regras de capítulo, livro, resumo em anais e apresentação em evento publicadas em ${RELEASE_CODE}. Atividades científicas amplas fora dessas categorias permanecem parciais.'
where source_process_id = '${PROCESS_ID}';

with source_rules as (
  select * from jsonb_to_recordset(${jsonSql('feluma_rules', rules)}) as item(
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
join public.scientific_import_batches batch on batch.batch_key = '${BATCH_KEY}'
on conflict (release_code, source_rule_id) do nothing;

update public.scientific_import_batches
set status = 'APPLIED', completed_at = now(), counts = counts || jsonb_build_object(
  'applied_edicts', (select count(*) from public.edicts where source_process_id = '${PROCESS_ID}'),
  'applied_assessments', (select count(*) from public.scientific_coverage_assessments where release_code = '${RELEASE_CODE}'),
  'applied_rules', (select count(*) from public.scientific_rules where release_code = '${RELEASE_CODE}')
)
where batch_key = '${BATCH_KEY}';

do $$
declare
  edict_count integer;
  assessment_count integer;
  rule_count integer;
  positive_rule_count integer;
  no_score_rule_count integer;
begin
  select count(*) into edict_count from public.edicts where source_process_id = '${PROCESS_ID}';
  if edict_count <> 1 then raise exception 'Expected FELUMA 2027 edict, found %.', edict_count; end if;

  select count(*) into assessment_count from public.scientific_coverage_assessments where release_code = '${RELEASE_CODE}';
  if assessment_count <> 1 then raise exception 'Expected 1 FELUMA assessment, found %.', assessment_count; end if;

  select count(*) into rule_count from public.scientific_rules where release_code = '${RELEASE_CODE}';
  if rule_count <> ${rules.length} then raise exception 'Expected ${rules.length} FELUMA rules, found %.', rule_count; end if;

  select count(*) into positive_rule_count
  from public.scientific_rules
  where release_code = '${RELEASE_CODE}' and score_formula->>'positive_score_confirmed' = 'true';
  if positive_rule_count <> 6 then raise exception 'Expected 6 positive FELUMA rules, found %.', positive_rule_count; end if;

  select count(*) into no_score_rule_count
  from public.scientific_rules
  where release_code = '${RELEASE_CODE}' and score_formula->>'positive_score_confirmed' = 'false';
  if no_score_rule_count <> 2 then raise exception 'Expected 2 explicit no-score FELUMA rules, found %.', no_score_rule_count; end if;
end
$$;
`

writeFileSync(outputPath, migration, 'utf8')
console.log(`Generated ${outputPath}`)
console.log(`Rules: ${rules.length}; source SHA-256: ${sourceSha256}; mapping SHA-256: ${mappingSha256}`)
