import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationPath = path.join(root, 'supabase', 'migrations', '20260829233000_add_2027_official_refresh.sql')
const auditPath = path.join(root, '.codex-work', 'normalization', 'official-refresh-release-2026-08-29.json')
const releaseCode = 'APP-SCIENTIFIC-REFRESH-2026-08-29-v1'
const batchKey = 'SCIENTIFIC-REFRESH-2026-08-29-v1'
const coreVersion = 'OFFICIAL-REFRESH-2026-08-29'

const regionByState = {
  CE: 'NORDESTE', ES: 'SUDESTE', GO: 'CENTRO-OESTE', PR: 'SUL',
  RJ: 'SUDESTE', RO: 'NORTE', RS: 'SUL', SP: 'SUDESTE',
}

const sources = {
  UNITAU: { url: 'https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf', hash: '77df9b6538427c3977f6a3abe9d8e16cefba7fffd0ec92489f08b132dea1307b' },
  UFCSPA: { url: 'https://fundmed.org.br/website/wp-content/uploads/2026/08/UFCSPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf', hash: '92884bdcb737e64ec8aa17ddc494160fdccccfd59fdc658a8859fca8b52e0507' },
  HCPA: { url: 'https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf', hash: '0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1' },
  HMV: { url: 'https://fundmed.org.br/website/wp-content/uploads/2026/08/HMV-MEDICA-Edital-de-Abertura-das-Inscricoes.pdf', hash: '9d436baf014164d25c1d0cce247dc485cd0fa343959551cc2cbdc35c3f4bbfbc' },
  FMJ: { url: 'https://fmj.br/wp-content/uploads/2026/08/EdResidMedica_ESPECIALIDADES_2027_Abertura.pdf', hash: 'f8e380dd004f466d786dc937c5d17f67fb29dc57624d659f768120e3bedc3077' },
  HBAP: { url: 'https://rondonia.ro.gov.br/wp-content/uploads/2026/08/Edital_75959607_Edital_2026.pdf', hash: '66b9ff705af9dccb73a5b9dab4549103ec3cfbdd0c80309701ce18132236bb28' },
  HUV: { url: 'https://huv.univassouras.edu.br/wp-content/uploads/2026/06/EDITAL-RESIDENCIA-MEDICA-2027-HUV.pdf', hash: '147bed3455113ab09fbbe74d52079cf878b4de2fcaf1fb19785344476e1f55bc' },
  HZSL: { url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/hospital-dr-eulalino-ignacio-de-andrade_1787059994.pdf', hash: '9ef3b0a37dce39a40ee52b1905e4964efab2b9a175d482c13153d8b4e88f414c' },
  SJP: { url: 'https://www.sjp.pr.gov.br/wp-content/uploads/2026/08/edital-20.2026-processo-seletivo-de-residencia-medica-sec-saude-sao-jose-dos-pinhais.pdf', hash: '76aaa4a5041d82a6a8d10c32c15ce4fc7bb420d3f9b97ea9777669d2f84a7c1a' },
  SANTAPG: { url: 'https://santacasapg.com/wp-content/uploads/2026/08/edital-01-2026.pdf', hash: '7a9c0365a733900816957b5c107bcba16074c802ea37b7ba35caeb02e1511be5' },
  SANTARP: { url: 'https://coremesantacasarp.com/wp-content/uploads/2026/08/scrp2601_edital-abertura-inscricoes-rm-2027_006_final_para-publicacao-1.pdf', hash: 'a5f977129d0707df27c149618d6bc780f6e6c2e13c1d1b84989e878b7745bdff' },
  OPTY: { url: 'https://s3.amazonaws.com/cdn.concursos.selecting.com.br/edital/1/42/16b6b9deea4c850f79e0a52c6d422582.pdf', hash: 'cddfd77c399cd65d900370e3fcdadbdb131c97c4250ee63bd164a323bc50c6cd' },
  APEC: { url: 'https://concursos.acep.org.br/resmedpsi2027/Edital012026.pdf', hash: '234280f509f2578743a27d31459e51f2dc09decc4ca94af0368848d9b2762118' },
  ABHU: { url: 'https://www.hospitalunimar.com.br/wp-content/uploads/2026/06/EDITAL-RESIDENCIA-ABHU-2027.pdf', hash: '646dcbe82b6d9cae1a3ff7dbb8ba51c7083e7d24526b3569b9ed370d08fe1107' },
  FUBOG: { url: 'https://s3.amazonaws.com/cdn.concursos.selecting.com.br/edital/1/43/7e864f52e890b4bea59cef257c3bd45c.pdf', hash: '3b0a75aeba88d11f6afa2113c1eb8fe8705e74e9b6f066ca0c06e51005ecad16' },
  HUC: { url: 'https://static.pucpr.br/pucpr/2026/08/edital-021-2026_rm_vfinal_ret-1-1.pdf', hash: '4cd7e8e99cb7473fb11ef3153ccb5400a45f674921cc750262bc4b5092680131' },
  HSRC: { url: 'https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf', hash: 'c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32' },
}

const edicts = [
  ['2027-SP-UNITAU-PRPPG', 'Processo Seletivo de Residência Médica UNITAU — 2027', 'Universidade de Taubaté', 'SP', 'https://unitau.br/concursos/658/processo-seletivo-residencia-medica-2027/', 'UNITAU', '2026-08-05', '2026-10-25', 'RULES_PUBLISHED', 'ambos'],
  ['2027-SP-EINSTEIN-VUNESP', 'Processo Seletivo de Residência Médica Einstein — 2027', 'Hospital Israelita Albert Einstein', 'SP', 'https://www.vunesp.com.br/FEAE2603', 'VUNESP', null, '2026-09-21', 'EXTRACTION_PENDING', 'ambos'],
  ['2027-CE-ICC-COREME', 'Processo Seletivo de Residência Médica Rede ICC Saúde — 2027', 'Instituto do Câncer do Ceará', 'CE', 'https://icc.org.br/residencia-medica/', 'COREME ICC', null, '2026-09-24', 'EXTRACTION_PENDING', 'ambos'],
  ['2027-RS-UFCSPA-FUNDMED', 'Processo Seletivo de Residência Médica UFCSPA — 2027', 'Fundação Universidade Federal de Ciências da Saúde de Porto Alegre', 'RS', 'https://fundmed.org.br/evento/residencia-medica-ufcspa-2027/', 'FUNDMED', '2026-08-12', '2026-09-30', 'RULES_PUBLISHED', 'ambos'],
  ['2027-RS-HCPA-FUNDMED', 'Processo Seletivo de Residência Médica HCPA — 2027', 'Hospital de Clínicas de Porto Alegre', 'RS', 'https://fundmed.org.br/evento/residencia-medica-hcpa-2027/', 'FUNDMED', '2026-08-13', '2026-09-29', 'RULES_PUBLISHED', 'ambos'],
  ['2027-RS-HMV-FUNDMED', 'Processo Seletivo de Residência Médica Hospital Moinhos de Vento — 2027', 'Hospital Moinhos de Vento', 'RS', 'https://fundmed.org.br/evento/residencia-medica-hmv-2027/', 'FUNDMED', '2026-08-21', '2026-09-30', 'RULES_PUBLISHED', 'ambos'],
  ['2027-SP-FMJ-VUNESP', 'Processo Seletivo de Residência Médica Faculdade de Medicina de Jundiaí — 2027', 'Faculdade de Medicina de Jundiaí', 'SP', 'https://www.vunesp.com.br/FMJU2602', 'VUNESP', null, '2026-10-08', 'RULES_PUBLISHED', 'ambos'],
  ['2027-SP-BOS-VUNESP', 'Processo Seletivo de Residência Médica Banco de Olhos de Sorocaba — 2027', 'Banco de Olhos de Sorocaba', 'SP', 'https://www.vunesp.com.br/BOSO2602', 'VUNESP', null, null, 'EXTRACTION_PENDING', 'pré-requisito'],
  ['2027-RO-HBAP-CEMETRON-SESAU', 'Processo Seletivo de Residência Médica HBAP/CEMETRON — 2027', 'Secretaria de Estado da Saúde de Rondônia', 'RO', 'https://rondonia.ro.gov.br/publicacao/edital-no-19-2026-hb-coreme/', 'FUNDATEC / AMRIGS', '2026-08-25', '2026-10-19', 'RULES_PUBLISHED', 'ambos'],
  ['2027-RJ-HUV-COREME', 'Concurso de Residência Médica Hospital Universitário de Vassouras — 2027', 'Hospital Universitário de Vassouras', 'RJ', 'https://huv.univassouras.edu.br/', 'COREME HUV', null, null, 'SOURCE_PENDING_PUBLICATION', 'direto'],
  ['2027-PR-HZSL-AMP', 'Processo Seletivo de Residência Médica Hospital Dr. Eulalino Ignácio de Andrade — 2027', 'Hospital Dr. Eulalino Ignácio de Andrade', 'PR', 'https://hospitalzonasul.saude.pr.gov.br/Pagina/EDITAL-No-012026-normas-do-processo-de-selecao-para-o-ingresso-no-ano-de-2027-nos-Programas', 'AMP / COREME-HZSL', '2026-07-30', null, 'RULES_PUBLISHED', 'direto'],
  ['2027-PR-SJP-SMS', 'Processo Seletivo de Residência Médica da Secretaria Municipal de Saúde de São José dos Pinhais — 2027', 'Secretaria Municipal de Saúde de São José dos Pinhais', 'PR', 'https://www.sjp.pr.gov.br/secretarias/secretaria-saude/escola-de-saude/residencia-medica/', 'AMP', '2026-07-30', '2026-10-01', 'NO_SCIENTIFIC_SCORING', 'direto'],
  ['2027-PR-SANTA-CASA-PG-AMP', 'Processo Seletivo de Residência Médica Santa Casa de Ponta Grossa — 2027', 'Santa Casa de Misericórdia de Ponta Grossa', 'PR', 'https://santacasapg.com/edital/edital-no-001-2026-abertura-do-processo-seletivo-para-ingresso-nos-programas-de-residencia-medica-2027/', 'AMP', '2026-07-31', null, 'NO_SCIENTIFIC_SCORING', 'direto'],
  ['2027-SP-SANTA-CASA-RP-VUNESP', 'Processo Seletivo de Residência Médica Santa Casa de Ribeirão Preto — 2027', 'Santa Casa de Misericórdia de Ribeirão Preto', 'SP', 'https://www.vunesp.com.br/SCRP2601', 'VUNESP', null, '2026-10-08', 'NO_SCIENTIFIC_SCORING', 'ambos'],
  ['2027-NACIONAL-OPTY-SELECTING', 'Processo Seletivo Unificado de Residência Médica Grupo OPTY — 2027', 'Grupo OPTY', null, 'https://portal.concursos.selecting.com.br/edital/ver/42', 'Selecting', '2026-08-11', '2026-10-04', 'MANUAL_RULE_ONLY', 'ambos'],
  ['2027-CE-APEC-ACEP', 'Processo Seletivo de Residência Médica APEC — 2027', 'Associação de Psiquiatria do Estado do Ceará', 'CE', 'https://concursos.acep.org.br/resmedpsi2027/', 'ACEP', '2026-08-10', '2026-09-10', 'PARTIAL_RULES', 'direto'],
  ['2027-SP-ABHU-UNIMAR', 'Processo Seletivo de Residência Médica ABHU/UNIMAR — 2027', 'Associação Beneficente Hospital Universitário', 'SP', sources.ABHU.url, 'COREME ABHU/UNIMAR', '2026-06-17', '2026-12-08', 'NO_ARTICLE_SCORING', 'direto'],
  ['2027-RJ-CEPOA-CONSESP', 'Processo Seletivo de Residência Médica CEPOA — 2027', 'Centro de Estudos e Pesquisas Oculistas Associados', 'RJ', 'https://sis.consesp.com.br/', 'CONSESP', '2026-08-14', '2027-01-10', 'EXTRACTION_PENDING', 'pré-requisito'],
  ['2027-GO-FUBOG-SELECTING', 'Processo Seletivo de Residência Médica FUBOG — 2027', 'Fundação Banco de Olhos de Goiás', 'GO', 'https://portal.concursos.selecting.com.br/edital/ver/43', 'Selecting', '2026-08-11', '2026-10-04', 'RULES_PUBLISHED', 'pré-requisito'],
  ['2027-PR-HUC-PUCPR', 'Processo Seletivo de Residência Médica Hospital Universitário Cajuru — 2027', 'Pontifícia Universidade Católica do Paraná', 'PR', sources.HUC.url, 'PUCPR', '2026-08-05', '2026-09-21', 'RULES_PUBLISHED', 'ambos'],
  ['2027-RJ-UERJ-CEPUERJ', 'Processo Seletivo de Residência Médica UERJ — 2027', 'Universidade do Estado do Rio de Janeiro', 'RJ', 'https://www.cepuerj.uerj.br/concursos2.php?ano=2027&concurso=S04597', 'CEPUERJ', '2026-08-18', '2026-10-01', 'EXTRACTION_PENDING', 'ambos'],
  ['2027-ES-HSRC-IBEST', 'Processo Seletivo de Residência Médica Hospital Santa Rita de Cássia — 2027', 'Associação Feminina de Educação e Combate ao Câncer', 'ES', 'https://institutoibest.org.br/informacoes/67/', 'Instituto IBEST', '2026-08-25', '2026-10-05', 'RULES_PUBLISHED', 'ambos'],
].map(([source_process_id, name, coordinator, state_reference, source_url, exam_board, published_at, application_deadline, coverage_status, access_type]) => ({
  source_process_id,
  name,
  coordinator,
  published_at,
  application_deadline,
  source_url,
  active: true,
  minimum_qualis: null,
  entry_year: 2027,
  publication_year: 2026,
  geographic_scope: state_reference ? 'institucional' : 'nacional',
  state_reference: state_reference ?? 'NACIONAL',
  region: state_reference ? regionByState[state_reference] : 'NACIONAL',
  exam_board,
  access_type,
  specialties_text: 'Consultar edital e quadro oficial de vagas',
  curriculum_analysis_status: ['NO_SCIENTIFIC_SCORING'].includes(coverage_status)
    ? 'Sem etapa curricular que pontue produção científica'
    : coverage_status === 'NO_ARTICLE_SCORING'
      ? 'Análise curricular sem pontuação para artigos/publicações'
      : ['RULES_PUBLISHED', 'PARTIAL_RULES'].includes(coverage_status)
        ? 'Análise curricular com regra de artigo localizada'
        : 'Cobertura curricular pendente de publicação ou extração conclusiva',
  curriculum_weight_percent: coverage_status === 'NO_SCIENTIFIC_SCORING' ? 0 : null,
  curriculum_max_score: null,
  phase_nature: coverage_status === 'NO_SCIENTIFIC_SCORING' ? 'não aplicável' : null,
  validity_status: 'Vigente',
  document_status: ['EXTRACTION_PENDING'].includes(coverage_status) ? 'somente página ou acesso bloqueado' : 'Baixado ou conferido em fonte oficial',
  validation_status: ['RULES_PUBLISHED', 'PARTIAL_RULES', 'NO_SCIENTIFIC_SCORING', 'NO_ARTICLE_SCORING'].includes(coverage_status) ? 'Validada' : 'Parcial',
  confirmation_level: 'Confirmado',
  consulted_at: '2026-08-29',
  coverage_status,
  source_notes: 'Localizado na atualização nacional de fontes oficiais de 29/08/2026; nenhuma regra ausente foi inferida.',
}))

const typeCondition = { field: 'production.type', operator: 'EQ', value: 'ARTICLE_PUBLICATION', required: true, negated: false, confidence: 'HIGH', evidence_ref: 'OFFICIAL_DOCUMENT' }
const condition = (field, operator, value, negated = false) => ({ field, operator, value, required: true, negated, confidence: 'HIGH', evidence_ref: 'OFFICIAL_DOCUMENT' })
const rootAll = (...conditions) => [{ code: 'ROOT', parent: null, operator: 'ALL', critical: true, conditions: [typeCondition, ...conditions] }]
const rootWithAlternative = (...conditions) => [
  { code: 'ROOT', parent: null, operator: 'ALL', critical: true, conditions: [typeCondition] },
  { code: 'ALTERNATIVE', parent: 'ROOT', operator: 'ANY', critical: true, conditions },
]
const indexingRequirements = (codes) => codes.map((base) => ({ base, operator: 'ANY', exact_match_allowed: true, confidence: 'HIGH', source_text: base }))

function makeRule({
  id, process, access = 'BOTH', groups = rootAll(), score, indexers = [], evidence,
  requirementLabel = 'Sem requisito adicional estruturado', authorship = null,
  unknown = [], warnings = ['DOCUMENTARY_VALIDATION_REQUIRED'], notes = null,
}) {
  const item = {
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
    scope: { processo_id: process, scope_type: 'Tipo de acesso', access_type: access, inclusion_operator: 'INCLUDE' },
    condition_groups: groups,
    score_formula: score,
    indexing_requirements: indexingRequirements(indexers),
    qualis_requirement: null,
    authorship_requirement: authorship,
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
    review: { automated_technical_review: true, human_review: false, decision: unknown.length ? 'PUBLISH_PARTIAL' : 'APPROVE', method: 'OFFICIAL_SOURCE_REEXTRACTION', reviewer: 'codex-primary-agent' },
    source_metadata: { classification_reason: notes ?? evidence.excerpt, requirement_label: requirementLabel, review_messages: [], source_notes: null },
  }
  item.mapping_hash = crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex')
  return item
}

const rules = [
  makeRule({ id: 'UNITAU-2027-DIRECT-TWO-INDEXERS', process: '2027-SP-UNITAU-PRPPG', access: 'DIRECT', groups: rootAll(condition('production.indexings', 'COUNT_GTE', 2)), score: { type: 'PER_ITEM', points_per_item: 5, maximum_points: 10, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 2 }, requirementLabel: 'Indexação: pelo menos 2 bases cadastradas', evidence: { official_url: sources.UNITAU.url, page: '13', document_sha256: sources.UNITAU.hash, excerpt: 'Publicação nacional ou internacional com ISSN/DOI e indexação em pelo menos duas bases.' } }),
  makeRule({ id: 'UNITAU-2027-PREREQ-TWO-INDEXERS', process: '2027-SP-UNITAU-PRPPG', access: 'PREREQUISITE', groups: rootAll(condition('production.indexings', 'COUNT_GTE', 2)), score: { type: 'PER_ITEM', points_per_item: 10, maximum_points: 20, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 2 }, requirementLabel: 'Indexação: pelo menos 2 bases cadastradas', evidence: { official_url: sources.UNITAU.url, page: '14', document_sha256: sources.UNITAU.hash, excerpt: 'Publicação durante a residência, com ISSN e/ou DOI e indexação em pelo menos duas bases.' } }),
  makeRule({ id: 'UFCSPA-2027-INDEXED-ARTICLE', process: '2027-RS-UFCSPA-FUNDMED', groups: rootAll(condition('production.indexings', 'IN', ['LILACS', 'SCIELO', 'MEDLINE', 'EMBASE'])), score: { type: 'PER_ITEM', points_per_item: 0.5, maximum_points: 2, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 4 }, indexers: ['LILACS', 'SCIELO', 'MEDLINE', 'EMBASE'], requirementLabel: 'Indexação: LILACS, SciELO, MEDLINE ou Embase', evidence: { official_url: sources.UFCSPA.url, page: '34', document_sha256: sources.UFCSPA.hash, excerpt: 'Artigos completos indexados em LILACS, SciELO, MEDLINE ou Embase.' } }),
  makeRule({ id: 'UFCSPA-2027-NONINDEXED-ARTICLE', process: '2027-RS-UFCSPA-FUNDMED', groups: rootAll(condition('production.indexings', 'IN', ['LILACS', 'SCIELO', 'MEDLINE', 'EMBASE'], true)), score: { type: 'PER_ITEM', points_per_item: 0.2, maximum_points: 0.6, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 3 }, requirementLabel: 'Revista sem indexação nas quatro bases listadas pelo edital', evidence: { official_url: sources.UFCSPA.url, page: '34', document_sha256: sources.UFCSPA.hash, excerpt: 'Revistas não indexadas recebem pontuação positiva.' } }),
  makeRule({ id: 'HCPA-2027-DIRECT-INDEXED-ARTICLE', process: '2027-RS-HCPA-FUNDMED', access: 'DIRECT', groups: rootAll(condition('production.indexings', 'IN', ['MEDLINE', 'LILACS', 'SCIELO'])), score: { type: 'MANUAL', maximum_points: 1.5, positive_score_confirmed: true, literal_formula: 'JCR > 1: 1,0; JCR < 1: 0,5; sem JCR: 0,2 por trabalho.' }, indexers: ['MEDLINE', 'LILACS', 'SCIELO'], requirementLabel: 'Indexação: MEDLINE, LILACS ou SciELO; JCR altera somente a pontuação', evidence: { official_url: sources.HCPA.url, page: '50', document_sha256: sources.HCPA.hash, excerpt: 'Produção científica indexada em MEDLINE, LILACS ou SciELO.' } }),
  makeRule({ id: 'HCPA-2027-PREREQ-INDEXED-ARTICLE', process: '2027-RS-HCPA-FUNDMED', access: 'PREREQUISITE', groups: rootAll(condition('production.indexings', 'IN', ['MEDLINE', 'LILACS', 'SCIELO'])), score: { type: 'MANUAL', maximum_points: 2, positive_score_confirmed: true, literal_formula: 'JCR > 1: 0,5; JCR < 1: 0,3; sem JCR: 0,2 por trabalho.' }, indexers: ['MEDLINE', 'LILACS', 'SCIELO'], requirementLabel: 'Indexação: MEDLINE, LILACS ou SciELO; JCR altera somente a pontuação', evidence: { official_url: sources.HCPA.url, page: '52', document_sha256: sources.HCPA.hash, excerpt: 'Produção científica indexada em MEDLINE, LILACS ou SciELO.' } }),
  makeRule({ id: 'HMV-2027-ARTICLE', process: '2027-RS-HMV-FUNDMED', score: { type: 'MANUAL', maximum_points: 2, positive_score_confirmed: true, literal_formula: 'Periódico internacional: 1,0; nacional: 0,5 por trabalho; há variações de área por programa.' }, requirementLabel: 'Qualquer artigo nacional ou internacional pode pontuar; área e abrangência alteram o valor', evidence: { official_url: sources.HMV.url, page: '24–27', document_sha256: sources.HMV.hash, excerpt: 'Produção científica com pontuação para artigo em periódico nacional ou internacional.' }, warnings: ['PROGRAM_SCOPE_AFFECTS_SCORE', 'DOCUMENTARY_VALIDATION_REQUIRED'] }),
  makeRule({ id: 'FMJ-2027-INDEXED-ARTICLE', process: '2027-SP-FMJ-VUNESP', groups: rootAll(condition('production.indexings', 'IN', ['PUBMED', 'MEDLINE', 'SCIELO', 'LILACS', 'WEB_OF_SCIENCE', 'LATINDEX'])), score: { type: 'PER_ITEM', points_per_item: 1, maximum_points: 1, positive_score_confirmed: true, unit: 'ARTICLE' }, indexers: ['PUBMED', 'MEDLINE', 'SCIELO', 'LILACS', 'WEB_OF_SCIENCE', 'LATINDEX'], requirementLabel: 'Indexação: PubMed/MEDLINE, SciELO, LILACS, Web of Science ou Latindex', evidence: { official_url: sources.FMJ.url, page: '18', document_sha256: sources.FMJ.hash, excerpt: 'Autor ou coautor de artigo completo ou relato de caso em revista indexada.' } }),
  makeRule({ id: 'HBAP-CEMETRON-2027-INDEXED-ARTICLE', process: '2027-RO-HBAP-CEMETRON-SESAU', groups: rootAll(condition('production.identifiers.issn', 'IS_TRUE', true), condition('production.indexings', 'HAS_ANY', true)), score: { type: 'MANUAL', maximum_points: 1.5, positive_score_confirmed: true, literal_formula: 'Pontuação varia por tipo de artigo e abrangência internacional, nacional ou local.' }, requirementLabel: 'ISSN e ao menos uma base científica reconhecida', evidence: { official_url: sources.HBAP.url, page: '17–22', document_sha256: sources.HBAP.hash, excerpt: 'Artigo publicado em periódico com ISSN e indexação científica reconhecida.' }, warnings: ['PUBLICATION_SCOPE_AFFECTS_SCORE', 'ARTICLE_TYPE_AFFECTS_SCORE', 'DOCUMENTARY_VALIDATION_REQUIRED'] }),
  makeRule({ id: 'HZSL-2027-INTERNATIONALLY-INDEXED-ARTICLE', process: '2027-PR-HZSL-AMP', access: 'DIRECT', groups: rootAll(condition('production.indexings', 'IN', ['MEDLINE', 'PUBMED', 'LILACS', 'SCIELO'])), score: { type: 'PER_ITEM', points_per_item: 3, maximum_points: 12, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 4 }, indexers: ['MEDLINE', 'PUBMED', 'LILACS', 'SCIELO'], requirementLabel: 'Indexação: MEDLINE, PubMed, LILACS ou SciELO', evidence: { official_url: sources.HZSL.url, page: '8', document_sha256: sources.HZSL.hash, excerpt: 'Artigos científicos médicos em periódicos com indexação internacional.' } }),
  makeRule({ id: 'HZSL-2027-OTHER-JOURNAL-ARTICLE', process: '2027-PR-HZSL-AMP', access: 'DIRECT', groups: rootAll(condition('production.indexings', 'IN', ['MEDLINE', 'PUBMED', 'LILACS', 'SCIELO'], true)), score: { type: 'PER_ITEM', points_per_item: 0.5, maximum_points: 2, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 4 }, requirementLabel: 'Outros periódicos também pontuam', evidence: { official_url: sources.HZSL.url, page: '8', document_sha256: sources.HZSL.hash, excerpt: 'Publicação de artigos científicos médicos em outros periódicos.' } }),
  ...[
    ['APEC-2027-FIRST-A1-A2', 'FIRST_AUTHOR', ['A1', 'A2'], 0.8, 4],
    ['APEC-2027-FIRST-A3-A4', 'FIRST_AUTHOR', ['A3', 'A4'], 0.5, 3.5],
    ['APEC-2027-FIRST-B1-B2', 'FIRST_AUTHOR', ['B1', 'B2'], 0.5, 2.5],
    ['APEC-2027-COAUTHOR-A', 'COAUTHOR', ['A1', 'A2', 'A3', 'A4'], 0.4, 2],
    ['APEC-2027-COAUTHOR-B1-B2', 'COAUTHOR', ['B1', 'B2'], 0.3, 1.5],
  ].map(([id, role, qualis, points, maximum]) => makeRule({ id, process: '2027-CE-APEC-ACEP', access: 'DIRECT', groups: rootAll(condition('production.authorship.role', 'EQ', role), condition('production.qualis', 'IN', qualis)), score: { type: 'PER_ITEM', points_per_item: points, maximum_points: maximum, positive_score_confirmed: true, unit: 'ARTICLE' }, requirementLabel: `Autoria: ${role === 'FIRST_AUTHOR' ? 'primeiro autor' : 'coautor'} · Qualis: ${qualis.join(' ou ')}`, authorship: { roles: [role] }, evidence: { official_url: sources.APEC.url, page: '15', document_sha256: sources.APEC.hash, excerpt: 'Pontuação de artigo por papel de autoria e estrato Qualis.' } })),
  makeRule({ id: 'APEC-2027-B3-B4', process: '2027-CE-APEC-ACEP', access: 'DIRECT', groups: rootAll(condition('production.qualis', 'IN', ['B3', 'B4'])), score: { type: 'PER_ITEM', points_per_item: 0.2, maximum_points: 1, positive_score_confirmed: true, unit: 'ARTICLE' }, requirementLabel: 'Qualis B3 ou B4; autoria não altera a elegibilidade', evidence: { official_url: sources.APEC.url, page: '15', document_sha256: sources.APEC.hash, excerpt: 'Artigo B3, B4 ou B5 recebe pontuação positiva.' }, unknown: ['production.qualis.B5', 'production.qualis.unclassified'], warnings: ['B5_AND_UNCLASSIFIED_NOT_REPRESENTED_BY_CURRENT_QUALIS_ENUM', 'DOCUMENTARY_VALIDATION_REQUIRED'] }),
  makeRule({ id: 'HUC-PUCPR-2027-DIRECT-ARTICLE', process: '2027-PR-HUC-PUCPR', access: 'DIRECT', groups: rootWithAlternative(condition('production.indexings', 'IN', ['PUBMED']), condition('production.qualis', 'IN', ['A1', 'A2', 'A3', 'A4'])), score: { type: 'PER_ITEM', points_per_item: 10, maximum_points: 40, positive_score_confirmed: true, unit: 'ARTICLE' }, requirementLabel: 'PubMed OU Qualis A1, A2, A3 ou A4', evidence: { official_url: sources.HUC.url, page: '35', document_sha256: sources.HUC.hash, excerpt: 'Artigo completo em PubMed ou Qualis A1 a A4.' } }),
  makeRule({ id: 'HUC-PUCPR-2027-PREREQ-ARTICLE', process: '2027-PR-HUC-PUCPR', access: 'PREREQUISITE', groups: rootWithAlternative(condition('production.indexings', 'IN', ['PUBMED']), condition('production.qualis', 'IN', ['A1', 'A2', 'A3', 'A4'])), score: { type: 'PER_ITEM', points_per_item: 10, maximum_points: 50, positive_score_confirmed: true, unit: 'ARTICLE' }, requirementLabel: 'PubMed OU Qualis A1, A2, A3 ou A4', evidence: { official_url: sources.HUC.url, page: '38', document_sha256: sources.HUC.hash, excerpt: 'Artigo completo em PubMed ou Qualis A1 a A4.' } }),
  makeRule({ id: 'HSRC-2027-COMPLETE-ARTICLE', process: '2027-ES-HSRC-IBEST', score: { type: 'PER_ITEM', points_per_item: 0.25, maximum_points: 0.5, positive_score_confirmed: true, unit: 'ARTICLE', item_limit: 2 }, requirementLabel: 'Artigo completo; DOI é premissa operacional e não gera pendência', evidence: { official_url: sources.HSRC.url, page: '15 e 19', document_sha256: sources.HSRC.hash, excerpt: 'Publicação de artigo completo, 0,25 ponto por item.' } }),
  makeRule({ id: 'FUBOG-2027-FULL-TEXT-ARTICLE', process: '2027-GO-FUBOG-SELECTING', access: 'PREREQUISITE', score: { type: 'MANUAL', maximum_points: 2, positive_score_confirmed: true, literal_formula: 'Autor: 0,10; coautor: 0,05 por publicação; máximo 2,0.' }, requirementLabel: 'Texto integral em periódico com corpo editorial; resumo não conta', evidence: { official_url: sources.FUBOG.url, page: '14', document_sha256: sources.FUBOG.hash, excerpt: 'Publicações de texto integral em periódicos com corpo editorial.' }, warnings: ['AUTHORSHIP_AFFECTS_SCORE', 'DOCUMENTARY_VALIDATION_REQUIRED'] }),
]

const assessmentEvidence = {
  '2027-SP-UNITAU-PRPPG': [sources.UNITAU, ['13–14']],
  '2027-RS-UFCSPA-FUNDMED': [sources.UFCSPA, ['34']],
  '2027-RS-HCPA-FUNDMED': [sources.HCPA, ['50 e 52']],
  '2027-RS-HMV-FUNDMED': [sources.HMV, ['24–27']],
  '2027-SP-FMJ-VUNESP': [sources.FMJ, ['18']],
  '2027-RO-HBAP-CEMETRON-SESAU': [sources.HBAP, ['17–22']],
  '2027-RJ-HUV-COREME': [sources.HUV, ['3–6']],
  '2027-PR-HZSL-AMP': [sources.HZSL, ['8']],
  '2027-PR-SJP-SMS': [sources.SJP, ['5']],
  '2027-PR-SANTA-CASA-PG-AMP': [sources.SANTAPG, ['2']],
  '2027-SP-SANTA-CASA-RP-VUNESP': [sources.SANTARP, ['1 e 33']],
  '2027-NACIONAL-OPTY-SELECTING': [sources.OPTY, ['6 e anexos']],
  '2027-CE-APEC-ACEP': [sources.APEC, ['15']],
  '2027-SP-ABHU-UNIMAR': [sources.ABHU, ['9–10']],
  '2027-GO-FUBOG-SELECTING': [sources.FUBOG, ['14']],
  '2027-PR-HUC-PUCPR': [sources.HUC, ['35 e 38']],
  '2027-ES-HSRC-IBEST': [sources.HSRC, ['15 e 19']],
}

const basisByStatus = {
  RULES_PUBLISHED: 'A fonte oficial contém regra objetiva de artigo suficiente para publicação no mecanismo.',
  PARTIAL_RULES: 'As regras representáveis foram publicadas; critérios fora do vocabulário atual permanecem explicitamente parciais.',
  NO_SCIENTIFIC_SCORING: 'A fonte oficial confirma etapa única objetiva ou declara ausência de análise curricular.',
  NO_ARTICLE_SCORING: 'Há análise curricular, mas a tabela oficial não atribui pontos a artigos ou publicações.',
  MANUAL_RULE_ONLY: 'O currículo participa da seleção, mas a fonte não publica regra numérica específica para artigos.',
  SOURCE_PENDING_PUBLICATION: 'A fonte oficial informa que o edital suplementar com as regras ainda será publicado.',
  EXTRACTION_PENDING: 'O processo foi oficialmente publicado, mas o documento integral não pôde ser extraído conclusivamente nesta rodada.',
}

const assessments = edicts.map((edict) => {
  const evidence = assessmentEvidence[edict.source_process_id]
  return {
    source_process_id: edict.source_process_id,
    assessment_status: edict.coverage_status,
    assessment_basis: basisByStatus[edict.coverage_status],
    official_urls: evidence ? [evidence[0].url] : [edict.source_url],
    document_hashes: evidence ? [evidence[0].hash] : [],
    page_references: evidence ? evidence[1] : [],
    notes: edict.coverage_status === 'EXTRACTION_PENDING'
      ? 'Nenhuma compatibilidade foi presumida enquanto o PDF oficial permanecer bloqueado, dinâmico ou indisponível.'
      : 'DOI e situação da publicação foram preservados como evidência, mas não geram pendência por política operacional definida pelo usuário.',
    source_metadata: { method: 'OFFICIAL_NATIONAL_REFRESH', consulted_at: '2026-08-29' },
  }
})

const sourceSha = crypto.createHash('sha256').update(JSON.stringify({ sources, edicts: edicts.map(({ source_notes, ...edict }) => edict) })).digest('hex')
const mappingSha = crypto.createHash('sha256').update(JSON.stringify({ assessments, rules })).digest('hex')
const jsonSql = (tag, value) => `$${tag}$${JSON.stringify(value)}$${tag}$::jsonb`

const migration = `-- National official-source refresh for 2027 residency selection processes.
-- Generated by scripts/build-2027-official-refresh.mjs.
-- Source bundle SHA-256: ${sourceSha}
-- Mapping release: ${releaseCode} (${mappingSha})
-- Conservative rule: blocked, future, vague, or unavailable evidence is never promoted to compatibility.

set local statement_timeout = '120s';

alter table public.scientific_coverage_assessments
  drop constraint if exists scientific_coverage_assessments_status_check;

alter table public.scientific_coverage_assessments
  add constraint scientific_coverage_assessments_status_check check (assessment_status in (
    'RULES_PUBLISHED', 'PARTIAL_RULES', 'MANUAL_RULE_ONLY', 'NO_SCIENTIFIC_SCORING',
    'NO_ARTICLE_SCORING', 'SOURCE_NOT_LOCATED', 'SOURCE_PENDING_PUBLICATION',
    'EXTRACTION_PENDING', 'MAPPING_PENDING'
  ));

insert into public.scientific_import_batches (
  batch_key, core_version, source_file_name, source_sha256,
  mapping_release, mapping_sha256, status, counts
)
values (
  '${batchKey}', '${coreVersion}', 'official-refresh-2026-08-29.json', '${sourceSha}',
  '${releaseCode}', '${mappingSha}', 'PREPARED',
  '${JSON.stringify({ new_edicts: edicts.length, assessments: assessments.length, new_rules: rules.length, rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size })}'::jsonb
)
on conflict (batch_key) do nothing;

with source_edicts as (
  select * from jsonb_to_recordset(${jsonSql('refresh_edicts', edicts)}) as item(
    source_process_id text, name text, coordinator text, published_at date,
    application_deadline date, source_url text, active boolean, minimum_qualis public.qualis_level,
    entry_year integer, publication_year integer, geographic_scope text, state_reference text,
    region text, exam_board text, access_type text, specialties_text text,
    curriculum_analysis_status text, curriculum_weight_percent numeric, curriculum_max_score numeric,
    phase_nature text, validity_status text, document_status text, validation_status text,
    confirmation_level text, consulted_at date, coverage_status text, source_notes text
  )
)
insert into public.institutions (name, normalized_name, state_code, confirmation_level, source_notes)
select distinct coordinator, coordinator,
  nullif(state_reference, 'NACIONAL'), 'Confirmado',
  'Instituição coordenadora confirmada na atualização oficial de 29/08/2026.'
from source_edicts
on conflict (name) do nothing;

with source_edicts as (
  select * from jsonb_to_recordset(${jsonSql('refresh_edicts', edicts)}) as item(
    source_process_id text, name text, coordinator text, published_at date,
    application_deadline date, source_url text, active boolean, minimum_qualis public.qualis_level,
    entry_year integer, publication_year integer, geographic_scope text, state_reference text,
    region text, exam_board text, access_type text, specialties_text text,
    curriculum_analysis_status text, curriculum_weight_percent numeric, curriculum_max_score numeric,
    phase_nature text, validity_status text, document_status text, validation_status text,
    confirmation_level text, consulted_at date, coverage_status text, source_notes text
  )
)
insert into public.edicts (
  institution_id, name, published_at, application_deadline, source_url, active, minimum_qualis,
  source_process_id, entry_year, publication_year, geographic_scope, state_reference, region,
  exam_board, access_type, specialties_text, curriculum_analysis_status, curriculum_weight_percent,
  curriculum_max_score, phase_nature, validity_status, document_status, validation_status,
  confirmation_level, consulted_at, coverage_status, source_notes
)
select institution.id, item.name, item.published_at, item.application_deadline, item.source_url,
  item.active, item.minimum_qualis, item.source_process_id, item.entry_year, item.publication_year,
  item.geographic_scope, item.state_reference, item.region, item.exam_board, item.access_type,
  item.specialties_text, item.curriculum_analysis_status, item.curriculum_weight_percent,
  item.curriculum_max_score, item.phase_nature, item.validity_status, item.document_status,
  item.validation_status, item.confirmation_level, item.consulted_at, item.coverage_status, item.source_notes
from source_edicts item
join public.institutions institution on institution.name = item.coordinator
on conflict (source_process_id) do nothing;

with source_edicts as (
  select * from jsonb_to_recordset(${jsonSql('refresh_links', edicts)}) as item(
    source_process_id text, coordinator text, consulted_at date
  )
)
insert into public.edict_institutions (
  edict_id, institution_id, source_link_id, role, link_status,
  common_rule_or_exception, consulted_at, confirmation_level, source_notes
)
select edict.id, institution.id, 'REFRESH-2027-' || item.source_process_id,
  'Coordenadora', 'Ativo', 'Regra do processo', item.consulted_at, 'Confirmado',
  'Vínculo confirmado por fonte oficial na atualização de 29/08/2026.'
from source_edicts item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.institutions institution on institution.name = item.coordinator
on conflict do nothing;

with source_assessments as (
  select * from jsonb_to_recordset(${jsonSql('refresh_assessments', assessments)}) as item(
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
  null, item.assessment_basis, item.official_urls, item.document_hashes,
  item.page_references, item.notes, item.source_metadata
from source_assessments item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch on batch.batch_key = '${batchKey}'
on conflict (release_code, source_process_id) do nothing;

with source_rules as (
  select * from jsonb_to_recordset(${jsonSql('refresh_rules', rules)}) as item(
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

update public.edicts edict
set coverage_status = assessment.assessment_status
from public.scientific_coverage_assessments assessment
where assessment.release_code = '${releaseCode}'
  and assessment.edict_id = edict.id;

update public.scientific_import_batches
set status = 'APPLIED', completed_at = now(), counts = counts || jsonb_build_object(
  'applied_edicts', (select count(*) from public.edicts where source_process_id in (select jsonb_array_elements_text('${JSON.stringify(edicts.map((edict) => edict.source_process_id))}'::jsonb))),
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
  active_pre_2025 integer;
begin
  select count(*) into edict_count
  from public.edicts
  where source_process_id in (select jsonb_array_elements_text('${JSON.stringify(edicts.map((edict) => edict.source_process_id))}'::jsonb));
  if edict_count <> ${edicts.length} then raise exception 'Expected ${edicts.length} refresh edicts, found %.', edict_count; end if;

  select count(*) into assessment_count from public.scientific_coverage_assessments where release_code = '${releaseCode}';
  if assessment_count <> ${assessments.length} then raise exception 'Expected ${assessments.length} refresh assessments, found %.', assessment_count; end if;

  select count(*), count(distinct source_process_id) into rule_count, rule_process_count
  from public.scientific_rules where release_code = '${releaseCode}';
  if rule_count <> ${rules.length} then raise exception 'Expected ${rules.length} refresh rules, found %.', rule_count; end if;
  if rule_process_count <> ${new Set(rules.map((rule) => rule.source_process_id)).size} then raise exception 'Expected ${new Set(rules.map((rule) => rule.source_process_id)).size} rule processes, found %.', rule_process_count; end if;

  select count(*) into active_pre_2025 from public.edicts where entry_year < 2025 and active;
  if active_pre_2025 <> 0 then raise exception 'Expected zero active pre-2025 edicts, found %.', active_pre_2025; end if;
end $$;
`

await fs.writeFile(migrationPath, migration, 'utf8')
await fs.mkdir(path.dirname(auditPath), { recursive: true })
await fs.writeFile(auditPath, `${JSON.stringify({
  generated_at: '2026-08-29',
  batch_key: batchKey,
  release_code: releaseCode,
  source_sha256: sourceSha,
  mapping_sha256: mappingSha,
  edicts,
  assessments,
  rules,
}, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({
  migration: path.relative(root, migrationPath),
  audit: path.relative(root, auditPath),
  edicts: edicts.length,
  assessments: assessments.length,
  rules: rules.length,
  rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size,
  coverage_statuses: Object.fromEntries([...new Set(edicts.map((edict) => edict.coverage_status))]
    .sort().map((status) => [status, edicts.filter((edict) => edict.coverage_status === status).length])),
  source_sha256: sourceSha,
  mapping_sha256: mappingSha,
}, null, 2))
