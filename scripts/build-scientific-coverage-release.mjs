import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const outputPath = resolve(repositoryRoot, 'supabase/migrations/20260829220000_add_scientific_coverage_release.sql')
const inventoryPath = resolve(repositoryRoot, '.codex-work/normalization/inventory.json')

const RELEASE_CODE = 'APP-SCIENTIFIC-COVERAGE-v1'
const BATCH_KEY = 'SCIENTIFIC-COVERAGE-2026-08-29-v1'
const CORE_VERSION = 'CORE-v2.3-AUDITADO+OFFICIAL-REEXTRACTION-2026-08-29'
const SOURCE_FILE_NAME = 'BANCO_EDITAIS_CORE_v2_3_AUDITADO (1).xlsx'
const SOURCE_SHA256 = '7d7cbbadb10f09ba88f389b92f296595caccd0623749f5c2f204ce0d900d11dd'

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

function score(pointsPerItem, maximumPoints, extra = {}) {
  return {
    type: 'PER_ITEM',
    points_per_item: pointsPerItem,
    maximum_points: maximumPoints,
    positive_score_confirmed: Number(pointsPerItem) > 0 || Number(maximumPoints) > 0,
    unit: 'ARTICLE',
    ...extra,
  }
}

function manualScore(literalFormula) {
  return {
    type: 'MANUAL',
    positive_score_confirmed: true,
    literal_formula: literalFormula,
  }
}

function exactIndexers(codes) {
  return [...new Set(codes)].map((code) => ({
    base: code,
    operator: 'ANY',
    exact_match_allowed: true,
    confidence: 'HIGH',
    source_text: code,
  }))
}

function anyIndexer() {
  return [{
    base: 'ANY_SCIENTIFIC_DATABASE',
    operator: 'HAS_ANY',
    exact_match_allowed: true,
    confidence: 'HIGH',
    source_text: 'periódico indexado',
  }]
}

function manualCondition(kind, reviewMessage) {
  return {
    field: 'manual.source_condition',
    operator: 'MANUAL',
    value: { kind },
    required: true,
    negated: false,
    confidence: 'HIGH',
    evidence_ref: 'OFFICIAL_DOCUMENT',
    review_message: reviewMessage,
  }
}

function makeArticleRule({
  processId,
  ruleId,
  evidence,
  scoreFormula = null,
  indexers = [],
  qualis = null,
  issn = false,
  doi = false,
  accessType = 'BOTH',
  institutionName = null,
  specialty = null,
  sourceItem = null,
  dateWindow = null,
  manualReviews = [],
  documentRequirements = [],
  confidence = 'HIGH',
  mappingStatus = 'APPROVED',
  classificationReason,
  sourceNotes = null,
}) {
  const conditions = [{
    field: 'production.type',
    operator: 'EQ',
    value: 'ARTICLE_PUBLICATION',
    required: true,
    negated: false,
    confidence: 'HIGH',
    evidence_ref: 'OFFICIAL_DOCUMENT',
  }]

  if (issn) conditions.push({
    field: 'production.identifiers.issn',
    operator: 'IS_TRUE',
    value: true,
    required: true,
    negated: false,
    confidence: 'HIGH',
    evidence_ref: 'OFFICIAL_DOCUMENT',
  })
  if (doi) conditions.push({
    field: 'production.identifiers.doi',
    operator: 'IS_TRUE',
    value: true,
    required: true,
    negated: false,
    confidence: 'HIGH',
    evidence_ref: 'OFFICIAL_DOCUMENT',
  })
  conditions.push(...manualReviews.map(({ kind, message }) => manualCondition(kind, message)))

  const rule = {
    source_rule_id: ruleId,
    source_process_id: processId,
    release_code: RELEASE_CODE,
    core_version: CORE_VERSION,
    family: 'ARTIGO_PUBLICACAO',
    production_type: 'ARTICLE_PUBLICATION',
    accepted_production_types: ['ARTICLE_PUBLICATION'],
    initial_eligibility: scoreFormula ? 'SIM_SEM_CALCULO' : 'REVISAR',
    mapping_status: mappingStatus,
    published_for_engine: true,
    mapping_confidence: confidence,
    matrix_row: null,
    scope: {
      processo_id: processId,
      scope_type: institutionName ? 'Instituição participante' : 'Tipo de acesso',
      access_type: accessType,
      inclusion_operator: 'INCLUDE',
      ...(institutionName ? { institution_name: institutionName } : {}),
      ...(specialty ? { specialty_group_text: specialty } : {}),
      ...(sourceItem ? { source_item: sourceItem } : {}),
    },
    condition_groups: [{ code: 'ROOT', parent: null, operator: 'ALL', critical: true, conditions }],
    score_formula: scoreFormula,
    indexing_requirements: indexers,
    qualis_requirement: qualis ? {
      minimum_stratum: qualis,
      stratum: qualis,
      operator: 'AT_LEAST',
      exact_match_allowed: true,
      system: 'QUALIS_CAPES',
      source_text: `Qualis mínimo ${qualis}`,
    } : null,
    authorship_requirement: null,
    document_requirements: documentRequirements,
    date_window: dateWindow,
    presentation_formats: [],
    event_scopes: [],
    publication_scopes: [],
    event_organizer: null,
    subject_area_requirement: null,
    evidence: {
      official_url: evidence.url,
      page: evidence.page,
      document_sha256: evidence.sha256,
      source_status: 'Confirmado em fonte oficial',
      excerpt: evidence.item,
    },
    unknown_data: [
      ...manualReviews.map(({ kind }) => `manual.${kind.toLowerCase()}`),
      ...(dateWindow ? ['production.publication_age'] : []),
    ],
    warnings: [
      ...(manualReviews.length ? ['MANUAL_CONDITION_REVIEW_REQUIRED'] : []),
      ...(dateWindow ? ['DATE_WINDOW_REQUIRES_REVIEW'] : []),
      ...(!scoreFormula ? ['SCORING_FORMULA_NOT_STRUCTURED'] : []),
      'DOCUMENTARY_VALIDATION_REQUIRED',
    ],
    review: {
      automated_technical_review: true,
      human_review: false,
      decision: scoreFormula ? 'APPROVE' : 'PUBLISH_FOR_MANUAL_REVIEW',
      method: 'OFFICIAL_SOURCE_REEXTRACTION',
      reviewer: 'codex-primary-agent',
    },
    source_metadata: {
      classification_reason: classificationReason,
      review_messages: manualReviews.map(({ message }) => message),
      source_notes: sourceNotes,
    },
  }

  rule.mapping_hash = sha256(stableJson(rule))
  return rule
}

const sources = {
  cermam: { url: 'https://cermam.com.br/wp-content/uploads/2025/10/Manual-do-Candidato-CERMAM-2025-2026-atual.pdf', sha256: 'fb24fa718e393710caa0bdafedd693dada907fdf64931e90d368745e237912be' },
  psuMg2026Direct: { url: 'https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2026-20250922124319.pdf', sha256: '119cd4d8fb591f5267ccb467f6b108789643bcfcb065ac4c20f6a3b029dcf251' },
  psuMg2026Prereq: { url: 'https://www.galaxcms.com.br/up_crud_comum/601/Anexo2-AvaliacaoCurricularPadronizadaEntradaPreRequisito-PSUMG2026-20250821105200.pdf', sha256: '1dd4e3101b8dc7b618e51d4a184bb02f02b37aae53177584cb6ad8cf3fb10571' },
  psuMg2025Direct: { url: 'https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2025-20240918141708.pdf', sha256: '55a68cc9209bcf8604df6c960f69ea099f2420a0d3a1b899fdc7e3994af7058c' },
  psuMg2025Prereq: { url: 'https://www.galaxcms.com.br/up_crud_comum/601/Anexo2-AvaliacaoCurricularPadronizadaPreRequisitoPSUMG2025-20240913143832.pdf', sha256: '4f9742940d25c5156f74ee5ec850f902915cf699c5461fbfc9373c4e169e79ad' },
  feluma2027: { url: 'https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027.pdf', sha256: '98f521cf8f737d823095433505c6bf192255f173295fe902a7c8be33aea88595' },
  feluma2026: { url: 'https://residencia.cmmg.edu.br/wp-content/uploads/2025/07/Edital-de-Inscricao-028-2025-Residencia-Medica-2026-Biocor-e-HUCM-2a-Retificacao.pdf', sha256: '5799b542609d79d38ae39ea4c2f511e24938b858bb1134ef7bfa23904648347c' },
  sesDf: { url: 'https://www.iades.com.br/inscricao/upload/1363/2025102019529686.pdf', sha256: '5061efb4a55530f1faf348c49bc1c76e0a19f91af5684cb6d5c45fc741bed3dc' },
  vitoria: { url: 'https://www.vitoria.es.gov.br/download.php?id=4363&tipo=1', sha256: 'fb45893a531dfcd6f98a46a4df65762fb4545a7649686a01cdf8f23113453e70' },
  feas2026: { url: 'https://feas.curitiba.pr.gov.br/images/ensinoPesquisa/residencia_medica/2026/Edital%20N%202_2025%20-%20PRM_2025%20-%20Assinado.pdf', sha256: '24f5aac1385ad242d06e0fd139cc2b8323f88cab36f846e1ba2af007b22af6c0' },
  feas2025: { url: 'https://feas.curitiba.pr.gov.br/images/ensinoPesquisa/residencia_medica/2024/EDITAL%20N%2009_2024_Processo%20Seletivo%20PRM%202025_assinado.pdf', sha256: '8bdac0e618f8e4beb656df1fd27b575f182f263695c20c909a3c2d240ff416e2' },
  uvv2025: { url: 'https://uvv.br/wp-content/uploads/2024/10/20241030-edital-residencia-medica.pdf', sha256: '73e7bcf8fb9b2e11669df8d6eb07dc2826c180f20018a8d1c02779e128ba8df9' },
  uepa2025: { url: 'https://prosel.uepa.br/wp-content/uploads/edital1172024.pdf', sha256: '58b2e12ef99e6883f063bcefe8d13911438cb2d1b48159a449ba9db4a532bc2d' },
  fmusp2026: { url: 'https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf', sha256: '9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd' },
  unicamp2026: { url: 'https://portal.fcm.unicamp.br/wp-content/uploads/sites/58/2025/09/001-Edital-Acesso-Direto-2026.pdf', sha256: '59b6e7ff1f1ed85e822c3cb1acbd19422485ec33f916124fd813a29523ad6f99' },
  unicampRem2026: { url: 'https://portal.fcm.unicamp.br/wp-content/uploads/sites/58/2026/02/007-Edital-Acesso-Direto-2026-Vagas-Remanescentes.pdf', sha256: '0958370ca8e44ca64cca912cbd9e3c1aa5425c270d76c37c4a609bc244aa2dcc' },
  hbap2026: { url: 'https://rondonia.ro.gov.br/wp-content/uploads/2025/09/Edital-no-26-Abertura-COREME-HBAP.pdf', sha256: '907758619522e3c16418e6d381b077780eff6a01b86cea8662481401b83299a8' },
  hrms2026: { url: 'https://www.hospitalregional.ms.gov.br/wp-content/uploads/2025/10/FUNSAU-EDITAL-2025-COM-COTAS-01-10-1.pdf', sha256: '2ea2b020b35f68090dc1ef0c6c7e86b9581e0704c3af4867f23c8185797bfcb4' },
  hbap2025: { url: 'https://rondonia.ro.gov.br/wp-content/uploads/2024/09/Edital-no-20-2024-Abertura-2.pdf', sha256: 'c1b0afc6381757ec4e72b792e61982d09e10645b2b238d4a51f7cdfeec191f6e' },
  unifacisa: { url: 'https://unifacisa.edu.br/wp-content/uploads/2026/01/EDITAL_001_2026_RESIDENCIA-MEDICA.pdf', sha256: '235cc270e85ea6eca75e4f6b5a7dfab45be809e45886fa5c5ed03982c13e8489' },
  hsc: { url: 'https://www.saocamilonortenordeste.org.br/recursos/files/processo%20seletivo%202026%20para%20publica%C3%A7%C3%A3o.pdf', sha256: '32bab1745e1bd1732a89449f6d05617a0e15944e0b7ba8395f25a940a52252bf' },
  medImagem: { url: 'https://s3.amazonaws.com/cdn.concursos.selecting.com.br/edital/1/34/64d5bb01d6334f8efd8fde36e0caa0c8.pdf', sha256: '654f9c1ef723405a91f46d95e88390256634975bc6603296deffd1736457b8d3' },
  unifesp: { url: 'https://site.unifesp.br/coreme/images/Processo_Seletivo_2026/Edital_632_2025_-_PSRM_2025_2026_.pdf', sha256: '7f2365688cdbc94b8ed4a663a8ee99e7d0da3f5f0a5b2bfe8137c0b5b9655175' },
  unifespSupplementary: { url: 'https://site.unifesp.br/coreme/images/Processo_Seletivo_2026/Edital_II_n%C2%BA_78_2026.pdf', sha256: 'b82f2d049a4f9e24678f0e3a062251a4395d8549008d1901f73517212ce2a0e4' },
}

const broadMedicalIndexers = ['LATINDEX', 'MEDLINE', 'EMBASE', 'LILACS', 'SCIENCE_CITATION_INDEX', 'SCIELO']
const felumaIndexers = ['LATINDEX', 'PUBMED', 'MEDLINE', 'EMBASE', 'LILACS', 'WEB_OF_SCIENCE', 'SCIENCE_CITATION_INDEX', 'SCIELO', 'SCOPUS', 'COCHRANE']
const rules = []
const add = (definition) => rules.push(makeArticleRule(definition))

add({ processId: '2026-AM-CERMAM-CERMAM', ruleId: 'CERMAM-2026-DIRECT-ARTICLE', evidence: { ...sources.cermam, page: '9', item: 'Produção científica — acesso direto' }, scoreFormula: score(0.5, 1, { item_limit: 2 }), indexers: anyIndexer(), issn: true, accessType: 'DIRECT', dateWindow: { kind: 'ROLLING_YEARS', years: 5, source_text: 'últimos cinco anos' }, classificationReason: 'Artigo completo indexado com ISSN e pontuação positiva; resumos não são aceitos.' })
add({ processId: '2026-AM-CERMAM-CERMAM', ruleId: 'CERMAM-2026-PREREQ-ARTICLE', evidence: { ...sources.cermam, page: '11–12', item: 'Artigo em revista indexada — pré-requisito/ano adicional' }, scoreFormula: score(1, 5, { item_limit: 5 }), indexers: exactIndexers(['LATINDEX', 'SCOPUS', 'MEDLINE', 'SCIELO', 'LILACS', 'PUBMED', 'WEB_OF_SCIENCE']), issn: true, doi: true, accessType: 'PREREQUISITE', dateWindow: { kind: 'ROLLING_YEARS', years: 5, source_text: 'últimos cinco anos' }, classificationReason: 'Artigo completo em uma das bases nomeadas, com ISSN e DOI.' })

const psuManual = [{ kind: 'AUTHOR_COMPOSITION_AND_ADVISOR_RQE', message: 'Confirmar composição de autoria e a exigência de médico orientador especialista com RQE quando aplicável.' }]
add({ processId: '2026-MG-PSU-MG-AREMG', ruleId: 'PSU-MG-2026-DIRECT-11C', evidence: { ...sources.psuMg2026Direct, page: '23–26', item: 'Item 11c' }, scoreFormula: score(0.7, 0.7, { item_limit: 1 }), indexers: exactIndexers(broadMedicalIndexers), qualis: 'B2', accessType: 'DIRECT', manualReviews: psuManual, classificationReason: 'Artigo médico completo publicado, indexado e com Qualis mínimo B2; ressalvas de autoria/orientação permanecem manuais.' })
add({ processId: '2026-MG-PSU-MG-AREMG', ruleId: 'PSU-MG-2026-PREREQ-6', evidence: { ...sources.psuMg2026Prereq, page: '11–13', item: 'Item 6' }, scoreFormula: manualScore('1 artigo = 1,0 ponto; 2 artigos = 2,0 pontos.'), indexers: exactIndexers(['LATINDEX', ...broadMedicalIndexers]), qualis: 'B2', accessType: 'PREREQUISITE', dateWindow: { kind: 'ROLLING_YEARS', years: 5, source_text: 'últimos cinco anos' }, manualReviews: psuManual, classificationReason: 'Artigo médico completo publicado, indexado e com Qualis mínimo B2; quantidade, janela temporal e autoria exigem conferência.' })
add({ processId: '2025-MG-PSU-MG-AREMG', ruleId: 'PSU-MG-2025-DIRECT-11C', evidence: { ...sources.psuMg2025Direct, page: '23–26', item: 'Item 11c' }, scoreFormula: score(0.7, 0.7, { item_limit: 1 }), indexers: exactIndexers(broadMedicalIndexers), accessType: 'DIRECT', manualReviews: psuManual, classificationReason: 'A edição 2025 exige indexação, mas o item 11c não estabelece Qualis mínimo; nenhuma exigência de Qualis foi inventada.' })
add({ processId: '2025-MG-PSU-MG-AREMG', ruleId: 'PSU-MG-2025-PREREQ-6', evidence: { ...sources.psuMg2025Prereq, page: '12–13', item: 'Item 6' }, scoreFormula: manualScore('1 artigo = 1,0 ponto; 2 artigos = 2,0 pontos.'), indexers: exactIndexers(['LATINDEX', ...broadMedicalIndexers]), accessType: 'PREREQUISITE', dateWindow: { kind: 'ROLLING_YEARS', years: 5, source_text: 'últimos cinco anos' }, manualReviews: psuManual, classificationReason: 'A edição 2025 exige indexação, mas não Qualis mínimo; janela e autoria permanecem para conferência.' })

for (const [year, processId, source] of [[2026, '2026-MG-FELUMA-FELUMA', sources.feluma2026], [2027, '2027-MG-FELUMA-FELUMA', sources.feluma2027]]) {
  add({ processId, ruleId: `FELUMA-${year}-DIRECT-ARTICLE`, evidence: { ...source, page: year === 2026 ? '55–56' : '60–61', item: 'Artigos completos em periódicos indexados — acesso direto' }, scoreFormula: score(1, 2, { item_limit: 2 }), indexers: exactIndexers(felumaIndexers), issn: true, accessType: 'DIRECT', classificationReason: 'Artigo completo publicado em periódico indexado, com ISSN.' })
  add({ processId, ruleId: `FELUMA-${year}-PREREQ-ARTICLE`, evidence: { ...source, page: year === 2026 ? '74–75' : '79–80', item: 'Artigos completos em periódicos indexados — pré-requisito' }, scoreFormula: score(1.5, 3, { item_limit: 2 }), indexers: exactIndexers(felumaIndexers), issn: true, accessType: 'PREREQUISITE', classificationReason: 'Artigo completo publicado em periódico indexado, com ISSN.' })
}

add({ processId: '2026-DF-SES-DF-IADES', ruleId: 'SES-DF-2026-INDEXED-ARTICLE', evidence: { ...sources.sesDf, page: '11–12', item: 'Artigo médico indexado' }, scoreFormula: score(0.5, 1, { item_limit: 2 }), indexers: exactIndexers(['DOAJ', 'SCOPUS', 'MEDLINE', 'SCIELO', 'LILACS']), issn: true, doi: true, classificationReason: 'Ramo indexado com DOI, ISSN e ao menos uma base nomeada.' })
add({ processId: '2026-DF-SES-DF-IADES', ruleId: 'SES-DF-2026-NONINDEXED-ARTICLE', evidence: { ...sources.sesDf, page: '11–12', item: 'Artigo médico não indexado' }, scoreFormula: score(0.2, null), manualReviews: [{ kind: 'NON_INDEXED_BRANCH', message: 'Confirmar documentalmente que o artigo se enquadra no ramo não indexado; ausência de dado no aplicativo não prova essa condição.' }], classificationReason: 'O edital pontua artigo não indexado, mas a ausência de indexador não pode ser inferida automaticamente.' })
add({ processId: '2026-ES-VITORIA-MFC-PREFEITURA', ruleId: 'VITORIA-MFC-2026-INDEXED-ARTICLE', evidence: { ...sources.vitoria, page: '4', item: 'Artigo publicado ou aceito em revista indexada' }, scoreFormula: score(0.75, 1.5, { item_limit: 2 }), indexers: anyIndexer(), classificationReason: 'O edital exige revista indexada sem nomear base; a regra aceita qualquer indexador científico cadastrado.' })
add({ processId: '2026-PR-FEAS-CURITIBA', ruleId: 'FEAS-2026-ARTICLE', evidence: { ...sources.feas2026, page: '29', item: 'Artigo ou capítulo publicado' }, scoreFormula: manualScore('0,5 como autor principal ou 0,25 como coautor; máximo de quatro produções e 2,0 pontos.'), classificationReason: 'Qualquer artigo publicado pode gerar pontuação; o valor depende da autoria.' })
add({ processId: '2025-PR-FEAS-CURITIBA', ruleId: 'FEAS-2025-ARTICLE', evidence: { ...sources.feas2025, page: '23', item: 'Artigo ou capítulo publicado' }, scoreFormula: manualScore('0,5 como autor principal ou 0,25 como coautor; máximo de quatro produções e 2,0 pontos.'), classificationReason: 'Qualquer artigo publicado pode gerar pontuação; o valor depende da autoria.' })
add({ processId: '2025-ES-UVV-COREME', ruleId: 'UVV-2025-INDEXED-ARTICLE', evidence: { ...sources.uvv2025, page: '21–22', item: 'Publicação em periódico indexado' }, scoreFormula: score(15, 15, { item_limit: 1 }), indexers: exactIndexers(['PUBMED', 'LILACS', 'SCIELO']), dateWindow: { kind: 'ROLLING_YEARS', years: 6, source_text: 'últimos seis anos' }, classificationReason: 'Artigo em PubMed ou LILACS/SciELO, sujeito à janela de seis anos.' })

for (const [accessType, page, pubmedPoints, scieloPoints] of [['DIRECT', '27', 10, 8], ['PREREQUISITE', '32', 10, 6]]) {
  add({ processId: '2026-SP-FMUSP-FUVEST', ruleId: `FMUSP-2026-${accessType}-PUBMED`, evidence: { ...sources.fmusp2026, page, item: 'Artigo PubMed' }, scoreFormula: score(pubmedPoints, pubmedPoints, { item_limit: 1 }), indexers: exactIndexers(['PUBMED']), accessType, classificationReason: 'Artigo publicado com candidato entre os autores e indexado no PubMed.' })
  add({ processId: '2026-SP-FMUSP-FUVEST', ruleId: `FMUSP-2026-${accessType}-SCIELO`, evidence: { ...sources.fmusp2026, page, item: 'Artigo SciELO' }, scoreFormula: score(scieloPoints, scieloPoints, { item_limit: 1 }), indexers: exactIndexers(['SCIELO']), accessType, classificationReason: 'Artigo publicado com candidato entre os autores e indexado no SciELO.' })
}

for (const [code, points] of [['PUBMED', 10], ['SCIELO', 5]]) {
  add({ processId: '2026-SP-UNICAMP-COMVEST', ruleId: `UNICAMP-2026-DIRECT-${code}`, evidence: { ...sources.unicamp2026, page: '7', item: `Artigo ${code}` }, scoreFormula: score(points, 15), indexers: exactIndexers([code]), doi: true, accessType: 'DIRECT', classificationReason: 'Artigo completo publicado ou aceito, com DOI e candidato entre os autores.' })
}
for (const [accessType, code, points] of [['DIRECT', 'PUBMED', 10], ['DIRECT', 'SCIELO', 5], ['PREREQUISITE', 'PUBMED', 10], ['PREREQUISITE', 'SCIELO', 5]]) {
  add({ processId: '2026-SP-UNICAMP-REMANESCENTES-COMVEST', ruleId: `UNICAMP-REM-2026-${accessType}-${code}`, evidence: { ...sources.unicampRem2026, page: accessType === 'DIRECT' ? '5–6' : '9–11', item: `Artigo ${code}` }, scoreFormula: score(points, points), indexers: exactIndexers([code]), doi: true, accessType, classificationReason: 'Artigo completo publicado ou aceito, com DOI e candidato entre os autores.' })
}
add({ processId: '2026-SP-UNICAMP-REMANESCENTES-COMVEST', ruleId: 'UNICAMP-REM-2026-DIRECT-OTHER-QUALIS-A', evidence: { ...sources.unicampRem2026, page: '5–6', item: 'Outra base com Qualis A em Medicina I, II ou III' }, scoreFormula: score(1, 1), accessType: 'DIRECT', manualReviews: [{ kind: 'QUALIS_AREA_AND_PERIOD', message: 'Confirmar Qualis A na área e no período indicados pelo edital; o Qualis geral informado no aplicativo não basta.' }], classificationReason: 'Ramo dependente de área/período do Qualis; mantido como conferência manual.' })

const consespStandard = [
  ['2026-GO-HOA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4706_aparecidadegoiniares.mdica.pdf', '9aafd6a16d39932dda026ad5e2e2f917162fcc1103468e600ea7225bc18ea347'],
  ['2026-MS-HCOR-MS-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4728_campograndehospitaldocoraoresidnciamdica.pdf', 'a12959b4a5d5f2ac0492420152cf9dcda03c703ca56d840b794ca07734f6d4ab'],
  ['2026-MS-SANTA-CASA-CAMPO-GRANDE-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4675_campogranderesidnciamdicaadepr..pdf', '7bb9e55c7ce7bcf5c1767b6f23a642226a21362013027a6a4fd1e7fa5b11a66a'],
  ['2026-MT-UNIVAG-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4727_varzeagranderesidenciamdica2026.pdf', '989104779fa527149fd587ace98599acba0692bc7738c8d791dade94a0184957'],
  ['2026-SP-CENTRO-MEDICO-CAMPINAS-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4699_campinascentromdicores.mdica....pdf', '726bdc5d90c65402e55263ad638c7b22065c53e279b0e0472a45ac86546f037e'],
  ['2026-SP-FAI-ADAMANTINA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4692_adamantinafairesidnciamdica.pdf', '6c8cf87221030c88a8a2bbb1a47582d80ac6b12229495fd6fefd43d33ae3445d'],
  ['2026-SP-GUARUJA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4696_guarujresidenciamdica2026.pdf', 'a91eee567087854cc50c0cb76be37a727021854469499af82304c0c9b14fedcd'],
  ['2026-SP-HOSPITAL-CARLOS-MALZONI-MATAO-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4658_matoresidnciamdica2026.....pdf', '9f15ec23c62707be61acbe8ae7f0b9a2c9543d6275b6018c8409bf2612c60ad1'],
  ['2026-SP-IGESP-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4701_sopaulohospitaligespres.mdica2026.pdf', '55a423f0fc8e1b727e5e239a837643fe2903f140769aca79fa2f058637ab1147'],
  ['2026-SP-SANTA-CASA-ADAMANTINA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4700_adamantinasantacasaresidnciamdica....pdf', '79417c7aa012e7779bec5269a9c4aac74ce042fe743cf898712994385c136403'],
  ['2026-SP-SANTA-CASA-BIRIGUI-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4678_biriguiresidenciamdica2026..pdf', 'ce86ae091a60532be3562407d013e974a3b8b8e06815804855573e87c61599ef'],
  ['2026-SP-SANTA-CASA-RIBEIRAO-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4707_ribeiropretobeneficnciaresidncia2026.pdf', '708371ba3ac9a38f4375fd44e8cb80d3db3f1d68142582bb6cfe715b93369309'],
  ['2026-SP-SANTA-CASA-SAO-CARLOS-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4689_socarlosresidnciamdica2026.pdf', 'd092fc2b810c9ce64663c34b4e4d8298f6c0e6d002049ff13a48d999c1b87bcd'],
  ['2026-SP-SANTA-MARCELINA-SEGUNDA-ENTRADA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4899_sopaulosantamarcelinarm.....pdf', '9ed415f3d31c53fea99a09be48e50f3d2ade7b2dd134c9ac8c43c564d158c840'],
]
for (const [processId, url, documentHash] of consespStandard) {
  add({ processId, ruleId: `${processId}-ARTICLE`, evidence: { url, sha256: documentHash, page: 'tabela de títulos', item: 'Publicação em periódico/revista com corpo editorial' }, scoreFormula: manualScore('Pontuação positiva varia conforme autoria; consultar a tabela do edital.'), manualReviews: [{ kind: 'EDITORIAL_BOARD', message: 'Confirmar que a revista/periódico possui corpo editorial e conferir a faixa de autoria.' }], classificationReason: 'A publicação gera pontuação positiva, mas o corpo editorial e a faixa de autoria exigem conferência documental.' })
}

for (const [processId, url, documentHash] of [
  ['2026-SP-SANTA-CASA-ARACATUBA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4669_araatubaresidnciamdica2026..pdf', '676805447067475c43f39c046c36d4689d240e3eba74fcba0536057eb1f64d8e'],
  ['2026-SP-SANTA-CASA-ARACATUBA-SEGUNDA-ENTRADA-CONSESP', 'https://sis.consesp.com.br/imagens_arquivos/concursos/arquivos/4877_araatubaresidnciamdica20262semestre....pdf', '021e365dd7c24c0c804b753e5328dc6f769dfde8c1d4f7294497ff2dd04684fb'],
]) {
  add({ processId, ruleId: `${processId}-BROAD-ARTICLE`, evidence: { url, sha256: documentHash, page: 'análise curricular', item: 'Trabalhos publicados' }, manualReviews: [{ kind: 'SCORING_TABLE_NOT_EXTRACTED', message: 'Confirmar a tabela de pontuação de trabalhos publicados no documento oficial.' }], confidence: 'MEDIUM', mappingStatus: 'PARTIAL', classificationReason: 'O edital declara avaliação de trabalhos publicados, mas a fórmula não pôde ser estruturada com segurança.' })
}

add({ processId: '2026-NACIONAL-AMRIGS-ACM-AMMS-FUNDATEC', ruleId: 'AMRIGS-2026-HBAP-ARTICLE', evidence: { ...sources.hbap2026, page: '13–14', item: 'Artigo completo — HBAP' }, scoreFormula: manualScore('Internacional 0,30; nacional 0,20; local 0,10; máximo 0,60.'), institutionName: 'Hospital de Base Dr. Ary Pinheiro — HBAP', manualReviews: [{ kind: 'INSTITUTION_SCOPE', message: 'Esta regra vale especificamente para o HBAP; confirmar a instituição/programa escolhido.' }], classificationReason: 'Regra institucional dentro do processo guarda-chuva AMRIGS; não foi propagada às demais instituições.' })
add({ processId: '2026-NACIONAL-AMRIGS-ACM-AMMS-FUNDATEC', ruleId: 'AMRIGS-2026-HRMS-ARTICLE', evidence: { ...sources.hrms2026, page: '15', item: 'Artigo indexado — FUNSAU/HRMS' }, scoreFormula: score(10, 20, { item_limit: 2 }), indexers: anyIndexer(), institutionName: 'Fundação de Serviços de Saúde de Mato Grosso do Sul — FUNSAU/HRMS', dateWindow: { kind: 'ROLLING_YEARS', years: 5, source_text: 'últimos cinco anos' }, manualReviews: [{ kind: 'INSTITUTION_SCOPE', message: 'Esta regra vale especificamente para FUNSAU/HRMS; confirmar a instituição/programa escolhido.' }], classificationReason: 'Regra institucional dentro do processo guarda-chuva AMRIGS; exige prova de indexação e janela de cinco anos.' })
add({ processId: '2025-RO-HBAP-CEMETRON-SESAU', ruleId: 'HBAP-CEMETRON-2025-ARTICLE', evidence: { ...sources.hbap2025, page: '14', item: 'Artigo completo' }, scoreFormula: manualScore('Internacional 0,30; nacional 0,20; local 0,10; máximo 0,60.'), classificationReason: 'Artigo completo gera pontuação positiva; valor depende da abrangência.' })
add({ processId: '2026-PB-UNIFACISA-HELP-UNIFACISA', ruleId: 'UNIFACISA-2026-ARTICLE', evidence: { ...sources.unifacisa, page: '8', item: 'Artigo completo em periódico com ISSN' }, scoreFormula: score(0.1, 0.1), issn: true, classificationReason: 'Artigo completo publicado em periódico científico com ISSN; não há requisito de Qualis ou indexador.' })
add({ processId: '2026-AP-HSC-HCAL-SESA', ruleId: 'HSC-HCAL-2026-ANESTHESIOLOGY-ARTICLE', evidence: { ...sources.hsc, page: '3', item: 'Trabalhos publicados em revista médica — Anestesiologia' }, scoreFormula: manualScore('1 artigo = 0,5; 2 artigos = 1,0; mais de 3 = 1,5; a redação não esclarece exatamente 3.'), specialty: 'Anestesiologia', manualReviews: [{ kind: 'SPECIALTY_SCOPE', message: 'Confirmar que a candidatura é para Anestesiologia e conferir a ambiguidade da faixa de três artigos.' }], classificationReason: 'Regra restrita à Anestesiologia e com faixa quantitativa ambígua; mantida para conferência.' })
add({ processId: '2026-PI-HOSPITAL-MED-IMAGEM-SELECTING', ruleId: 'MED-IMAGEM-2026-BROAD-SCIENCE', evidence: { ...sources.medImagem, page: '9', item: 'Iniciação e produção científica' }, manualReviews: [{ kind: 'UNSTRUCTURED_SCIENTIFIC_SECTION', message: 'O documento menciona produção científica sem fornecer fórmula decisória estruturável; conferir manualmente.' }], confidence: 'LOW', mappingStatus: 'PARTIAL', classificationReason: 'Critério científico amplo sem pontuação discriminada na fonte extraída.' })
add({ processId: '2026-SP-UNIFESP-COREME', ruleId: 'UNIFESP-2026-BROAD-SCIENCE', evidence: { ...sources.unifesp, page: '23–66', item: 'Iniciação e produção científica' }, manualReviews: [{ kind: 'PROGRAM_SPECIFIC_MANUAL_SCORING', message: 'A produção científica é avaliada em fichas específicas por programa; conferir a ficha correspondente.' }], confidence: 'LOW', mappingStatus: 'PARTIAL', classificationReason: 'Há avaliação científica, mas os critérios variam por programa e não sustentam uma regra geral automática.' })
add({ processId: '2026-SP-UNIFESP-SUPLEMENTAR-COREME', ruleId: 'UNIFESP-SUPPLEMENTARY-2026-BROAD-SCIENCE', evidence: { ...sources.unifespSupplementary, page: '15–27', item: 'Iniciação e produção científica' }, manualReviews: [{ kind: 'PROGRAM_SPECIFIC_MANUAL_SCORING', message: 'A produção científica é avaliada em fichas específicas por programa; conferir a ficha correspondente.' }], confidence: 'LOW', mappingStatus: 'PARTIAL', classificationReason: 'Há avaliação científica, mas os critérios variam por programa e não sustentam uma regra geral automática.' })

const manualOnlyProcesses = new Set([
  ...consespStandard.map(([processId]) => processId),
  '2026-SP-SANTA-CASA-ARACATUBA-CONSESP',
  '2026-SP-SANTA-CASA-ARACATUBA-SEGUNDA-ENTRADA-CONSESP',
  '2026-AP-HSC-HCAL-SESA',
  '2026-PI-HOSPITAL-MED-IMAGEM-SELECTING',
  '2026-SP-UNIFESP-COREME',
  '2026-SP-UNIFESP-SUPLEMENTAR-COREME',
])
const partialProcesses = new Set(['2026-NACIONAL-AMRIGS-ACM-AMMS-FUNDATEC'])

const assessmentsByProcess = new Map()
for (const rule of rules) {
  const current = assessmentsByProcess.get(rule.source_process_id) ?? {
    source_process_id: rule.source_process_id,
    assessment_status: manualOnlyProcesses.has(rule.source_process_id)
      ? 'MANUAL_RULE_ONLY'
      : partialProcesses.has(rule.source_process_id) ? 'PARTIAL_RULES' : 'RULES_PUBLISHED',
    assessment_basis: manualOnlyProcesses.has(rule.source_process_id)
      ? 'A fonte oficial contém critério científico, mas ao menos uma condição decisiva permanece manual.'
      : partialProcesses.has(rule.source_process_id)
        ? 'Foram publicadas somente regras institucionais confirmadas; o processo guarda-chuva permanece parcial.'
        : 'Regra de artigo reextraída de documento oficial e publicada para o mecanismo de consulta.',
    official_urls: [],
    document_hashes: [],
    page_references: [],
    notes: 'Nenhum dado ausente foi promovido a compatibilidade.',
    source_metadata: { method: 'OFFICIAL_SOURCE_REEXTRACTION' },
  }
  current.official_urls.push(rule.evidence.official_url)
  current.document_hashes.push(rule.evidence.document_sha256)
  current.page_references.push(`${rule.source_rule_id}: ${rule.evidence.page}`)
  assessmentsByProcess.set(rule.source_process_id, current)
}

for (const assessment of assessmentsByProcess.values()) {
  assessment.official_urls = [...new Set(assessment.official_urls)]
  assessment.document_hashes = [...new Set(assessment.document_hashes)]
  assessment.page_references = [...new Set(assessment.page_references)]
}

assessmentsByProcess.set('2025-PA-PSU-UEPA', {
  source_process_id: '2025-PA-PSU-UEPA',
  assessment_status: 'NO_SCIENTIFIC_SCORING',
  assessment_basis: 'O edital oficial define prova objetiva como etapa única e 100% da nota final; não há pontuação curricular científica.',
  official_urls: [sources.uepa2025.url],
  document_hashes: [sources.uepa2025.sha256],
  page_references: ['10–12'],
  notes: 'Produção científica não foi tratada como incompatível; foi classificada como sem pontuação científica.',
  source_metadata: { method: 'OFFICIAL_SOURCE_REEXTRACTION', stage: 'single_objective_exam' },
})

const assessments = [...assessmentsByProcess.values()].sort((left, right) => left.source_process_id.localeCompare(right.source_process_id))
rules.sort((left, right) => left.source_process_id.localeCompare(right.source_process_id) || left.source_rule_id.localeCompare(right.source_rule_id))

const duplicateRuleIds = rules.filter((rule, index) => rules.findIndex((item) => item.source_rule_id === rule.source_rule_id) !== index)
if (duplicateRuleIds.length) throw new Error(`Duplicate source_rule_id: ${duplicateRuleIds.map((item) => item.source_rule_id).join(', ')}`)

if (existsSync(inventoryPath)) {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')).inventory
  const known = new Set(inventory.map((item) => item.source_process_id))
  const missing = assessments.map((item) => item.source_process_id).filter((processId) => !known.has(processId))
  if (missing.length) throw new Error(`Target processes missing from audited inventory: ${missing.join(', ')}`)
  if (inventory.length !== 220) throw new Error(`Expected 220 imported processes in audited inventory, found ${inventory.length}`)
}

const mappingSha256 = sha256(stableJson({ assessments, rules }))
const jsonSql = (tag, value) => `$${tag}$${JSON.stringify(value)}$${tag}$::jsonb`
const rulesJson = jsonSql('coverage_rules', rules)
const assessmentsJson = jsonSql('coverage_assessments', assessments)

const migration = `-- Scientific coverage release generated by scripts/build-scientific-coverage-release.mjs.
-- Source workbook SHA-256: ${SOURCE_SHA256}
-- Release: ${RELEASE_CODE} (${mappingSha256})
-- Conservative rule: missing, vague, future, or institution-specific evidence is never promoted to compatibility.

set local statement_timeout = '120s';

create table public.scientific_coverage_assessments (
    id bigint generated always as identity primary key,
    import_batch_id bigint not null references public.scientific_import_batches(id) on delete restrict,
    edict_id bigint not null references public.edicts(id) on delete restrict,
    source_process_id text not null,
    release_code text not null,
    assessment_status text not null,
    previous_coverage_status text,
    assessment_basis text not null,
    official_urls jsonb not null default '[]'::jsonb,
    document_hashes jsonb not null default '[]'::jsonb,
    page_references jsonb not null default '[]'::jsonb,
    notes text,
    source_metadata jsonb not null default '{}'::jsonb,
    assessed_at timestamptz not null default now(),
    constraint scientific_coverage_assessments_release_process_unique unique (release_code, source_process_id),
    constraint scientific_coverage_assessments_status_check check (assessment_status in (
        'RULES_PUBLISHED', 'PARTIAL_RULES', 'MANUAL_RULE_ONLY', 'NO_SCIENTIFIC_SCORING',
        'SOURCE_NOT_LOCATED', 'SOURCE_PENDING_PUBLICATION', 'EXTRACTION_PENDING', 'MAPPING_PENDING'
    )),
    constraint scientific_coverage_assessments_official_urls_array_check check (jsonb_typeof(official_urls) = 'array'),
    constraint scientific_coverage_assessments_document_hashes_array_check check (jsonb_typeof(document_hashes) = 'array'),
    constraint scientific_coverage_assessments_page_references_array_check check (jsonb_typeof(page_references) = 'array')
);

create index idx_scientific_coverage_assessments_edict_id on public.scientific_coverage_assessments(edict_id);
create index idx_scientific_coverage_assessments_status on public.scientific_coverage_assessments(assessment_status);

alter table public.scientific_coverage_assessments enable row level security;
create policy "Active users can read scientific coverage assessments"
on public.scientific_coverage_assessments for select to authenticated
using ((select public.is_active_account()));
revoke all on table public.scientific_coverage_assessments from anon;
revoke all on table public.scientific_coverage_assessments from authenticated;
grant select on table public.scientific_coverage_assessments to authenticated;
revoke all on sequence public.scientific_coverage_assessments_id_seq from anon;
revoke all on sequence public.scientific_coverage_assessments_id_seq from authenticated;

insert into public.scientific_import_batches (
    batch_key, core_version, source_file_name, source_sha256,
    mapping_release, mapping_sha256, status, counts
)
values (
    '${BATCH_KEY}', '${CORE_VERSION}', '${SOURCE_FILE_NAME}', '${SOURCE_SHA256}',
    '${RELEASE_CODE}', '${mappingSha256}', 'PREPARED',
    '{"expected_imported_edicts":220,"new_rule_processes":${new Set(rules.map((rule) => rule.source_process_id)).size},"new_rules":${rules.length},"targeted_assessments":${assessments.length}}'::jsonb
)
on conflict (batch_key) do nothing;

insert into public.scientific_coverage_assessments (
    import_batch_id, edict_id, source_process_id, release_code, assessment_status,
    previous_coverage_status, assessment_basis, official_urls, document_hashes,
    page_references, notes, source_metadata
)
select
    batch.id,
    edict.id,
    edict.source_process_id,
    '${RELEASE_CODE}',
    case edict.coverage_status
      when 'RULES_PUBLISHED' then 'RULES_PUBLISHED'
      when 'NO_CURRICULUM' then 'NO_SCIENTIFIC_SCORING'
      when 'NO_SCIENTIFIC_SCORING' then 'NO_SCIENTIFIC_SCORING'
      when 'NOT_EXTRACTED' then 'EXTRACTION_PENDING'
      when 'EXTRACTION_PENDING' then 'EXTRACTION_PENDING'
      when 'EXTRACTED_NOT_MAPPED' then 'MAPPING_PENDING'
      when 'MAPPING_PENDING' then 'MAPPING_PENDING'
      when 'RULES_BLOCKED' then 'MANUAL_RULE_ONLY'
      when 'MANUAL_RULE_ONLY' then 'MANUAL_RULE_ONLY'
      when 'PARTIAL' then 'PARTIAL_RULES'
      when 'PARTIAL_RULES' then 'PARTIAL_RULES'
      else 'SOURCE_NOT_LOCATED'
    end,
    edict.coverage_status,
    case edict.coverage_status
      when 'RULES_PUBLISHED' then 'Regra científica já publicada na versão auditada anterior.'
      when 'NO_CURRICULUM' then 'A fonte auditada não identificou etapa curricular científica.'
      when 'NOT_EXTRACTED' then 'Fonte cadastrada, mas extração científica ainda pendente.'
      when 'EXTRACTED_NOT_MAPPED' then 'Conteúdo extraído, mas ainda sem regra decisória aprovada.'
      when 'RULES_BLOCKED' then 'Critério localizado, porém vago, conflitante ou dependente de conferência manual.'
      when 'PARTIAL' then 'Somente parte do escopo científico foi confirmada.'
      else 'Fonte ou regra científica conclusiva ainda não localizada.'
    end,
    case when edict.source_url is null then '[]'::jsonb else jsonb_build_array(edict.source_url) end,
    '[]'::jsonb,
    '[]'::jsonb,
    'Classificação de cobertura; não constitui aceitação automática do trabalho.',
    jsonb_build_object('method', 'PRIOR_AUDITED_COVERAGE_TRANSLATION')
from public.edicts edict
join public.scientific_import_batches batch on batch.batch_key = '${BATCH_KEY}'
where edict.source_process_id is not null
on conflict (release_code, source_process_id) do nothing;

with overrides as (
  select * from jsonb_to_recordset(${assessmentsJson}) as item(
    source_process_id text,
    assessment_status text,
    assessment_basis text,
    official_urls jsonb,
    document_hashes jsonb,
    page_references jsonb,
    notes text,
    source_metadata jsonb
  )
)
update public.scientific_coverage_assessments assessment
set assessment_status = item.assessment_status,
    assessment_basis = item.assessment_basis,
    official_urls = item.official_urls,
    document_hashes = item.document_hashes,
    page_references = item.page_references,
    notes = item.notes,
    source_metadata = item.source_metadata
from overrides item
where assessment.release_code = '${RELEASE_CODE}'
  and assessment.source_process_id = item.source_process_id;

with source_rules as (
  select * from jsonb_to_recordset(${rulesJson}) as item(
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
select
    batch.id, edict.id, item.source_rule_id, item.source_process_id, item.release_code, item.core_version,
    item.family, item.production_type, item.accepted_production_types, item.initial_eligibility,
    item.mapping_status, item.published_for_engine, item.mapping_confidence, item.matrix_row,
    item.scope, item.condition_groups, item.score_formula, item.indexing_requirements,
    item.qualis_requirement, item.authorship_requirement, item.document_requirements,
    item.date_window, item.presentation_formats, item.event_scopes, item.publication_scopes,
    item.event_organizer, item.subject_area_requirement, item.evidence, item.unknown_data,
    item.warnings, item.review, item.source_metadata, item.mapping_hash
from source_rules item
join public.edicts edict on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch on batch.batch_key = '${BATCH_KEY}'
on conflict (release_code, source_rule_id) do nothing;

update public.edicts edict
set coverage_status = assessment.assessment_status
from public.scientific_coverage_assessments assessment
where assessment.release_code = '${RELEASE_CODE}'
  and assessment.edict_id = edict.id;

do $$
declare
    imported_count integer;
    assessment_count integer;
    override_count integer;
    rule_count integer;
    rule_process_count integer;
begin
    select count(*) into imported_count from public.edicts where source_process_id is not null;
    if imported_count <> 220 then raise exception 'Expected 220 imported edicts, found %.', imported_count; end if;

    select count(*) into assessment_count from public.scientific_coverage_assessments where release_code = '${RELEASE_CODE}';
    if assessment_count <> 220 then raise exception 'Expected 220 coverage assessments, found %.', assessment_count; end if;

    select count(*) into override_count
      from public.scientific_coverage_assessments
     where release_code = '${RELEASE_CODE}'
       and source_metadata->>'method' = 'OFFICIAL_SOURCE_REEXTRACTION';
    if override_count <> ${assessments.length} then raise exception 'Expected ${assessments.length} official assessments, found %.', override_count; end if;

    select count(*), count(distinct source_process_id) into rule_count, rule_process_count
      from public.scientific_rules where release_code = '${RELEASE_CODE}';
    if rule_count <> ${rules.length} then raise exception 'Expected ${rules.length} new rules, found %.', rule_count; end if;
    if rule_process_count <> ${new Set(rules.map((rule) => rule.source_process_id)).size} then raise exception 'Expected ${new Set(rules.map((rule) => rule.source_process_id)).size} rule processes, found %.', rule_process_count; end if;
end
$$;

update public.scientific_import_batches batch
set status = 'APPLIED',
    completed_at = now(),
    counts = batch.counts || jsonb_build_object(
      'assessed_edicts', (select count(*) from public.scientific_coverage_assessments where release_code = '${RELEASE_CODE}'),
      'rules_published', (select count(*) from public.scientific_rules where release_code = '${RELEASE_CODE}'),
      'coverage_statuses', (select jsonb_object_agg(assessment_status, status_count)
        from (select assessment_status, count(*) status_count
              from public.scientific_coverage_assessments
              where release_code = '${RELEASE_CODE}' group by assessment_status) grouped)
    )
where batch.batch_key = '${BATCH_KEY}';
`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, migration, 'utf8')
console.log(JSON.stringify({
  output: outputPath,
  release: RELEASE_CODE,
  mapping_sha256: mappingSha256,
  rules: rules.length,
  rule_processes: new Set(rules.map((rule) => rule.source_process_id)).size,
  targeted_assessments: assessments.length,
}, null, 2))
