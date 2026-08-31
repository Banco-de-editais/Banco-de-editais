import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACTIVITY_OPTIONS,
  ACCESS_OPTIONS,
  RULE_STATUS_OPTIONS,
  activityLabel,
  curriculumScoreLabel,
  filterCurriculumPlanning,
} from '../src/domain/curriculumPlanning.js'
import { loadCurriculumPlanningData } from '../src/services/curriculumPlanning.js'
import { AppError } from '../src/services/errors.js'

function edict(id = 1, overrides = {}) {
  return {
    id,
    name: `Edital ${id}`,
    source_process_id: `2027-MG-TEST-${id}`,
    institution_id: 10,
    institution: { id: 10, name: 'Instituição de São José' },
    entry_year: 2027,
    state_reference: 'MG',
    region: 'SUDESTE',
    active: true,
    application_deadline: '2026-10-01',
    published_at: '2026-08-01',
    ...overrides,
  }
}

function rule(id = 1, overrides = {}) {
  return {
    id,
    edict_id: 1,
    source_rule_id: `CURR-TEST-${id}`,
    source_process_id: '2027-MG-TEST-1',
    release_code: 'CURRICULUM-TEST-v1',
    activity_codes: ['RESEARCH'],
    title: `Regra ${id}`,
    access_type: 'DIRECT',
    specialties_text: null,
    source_item: 'Item 5 - iniciação científica',
    status: 'POINTS_CONFIRMED',
    scoring: { type: 'PER_UNIT', points_per_unit: 0.5, unit: 'semestre', max_points: 2 },
    shared_caps: [{ code: 'TEST-CAP', label: 'Grupo de atividades', max_points: 2 }],
    requirements: ['Certificação institucional com duração em semestres.'],
    caveats: ['Não somar automaticamente atividades simultâneas.'],
    ...overrides,
  }
}

function release(ruleCount, edictCount, overrides = {}) {
  return {
    code: 'CURRICULUM-TEST-v1',
    checked_at: '2026-08-30',
    description: 'Release simulado',
    rule_count: ruleCount,
    edict_count: edictCount,
    ...overrides,
  }
}

/** Minimal PostgREST query surface; every completed request remains inspectable. */
function mockedClient({ edicts = [], rules = [], currentRelease = null, releaseError = null, onRange, onMaybeSingle } = {}) {
  const calls = []
  return {
    calls,
    from(table) {
      const call = { table, columns: null, filters: [], orders: [], range: null, maybeSingle: false }
      calls.push(call)
      const query = {
        select(columns) { call.columns = columns; return query },
        eq(column, value) { call.filters.push([column, value]); return query },
        order(column) { call.orders.push(column); return query },
        async maybeSingle() {
          call.maybeSingle = true
          assert.equal(table, 'curriculum_releases')
          const override = await onMaybeSingle?.(call)
          return override === undefined ? { data: currentRelease, error: releaseError } : override
        },
        async range(from, to) {
          call.range = [from, to]
          const override = await onRange?.(call)
          if (override !== undefined) return override
          assert.ok(['edicts', 'curriculum_rules'].includes(table), `Unexpected paginated table: ${table}`)
          const rows = table === 'edicts' ? edicts : rules
          const filtered = rows.filter((row) => call.filters.every(([column, value]) => row[column] === value))
          return { data: filtered.slice(from, to + 1), error: null }
        },
      }
      return query
    },
  }
}

function expectCode(code) {
  return (error) => {
    assert.ok(error instanceof AppError)
    assert.equal(error.code, code)
    return true
  }
}

test('planejamento expõe apenas as seis atividades e os escopos/status previstos', () => {
  assert.deepEqual(ACTIVITY_OPTIONS.map(({ id }) => id), [
    'TEACHING_ASSISTANT', 'RESEARCH', 'EXTENSION_PROJECT',
    'EVENT_SPEAKER', 'EVENT_ORGANIZER', 'BOOK_ORGANIZER',
  ])
  assert.deepEqual(ACCESS_OPTIONS.map(({ id }) => id), ['DIRECT', 'PREREQUISITE'])
  assert.deepEqual(RULE_STATUS_OPTIONS.map(({ id }) => id), ['POINTS_CONFIRMED', 'REVIEW_REQUIRED', 'NO_POINTS'])
  assert.equal(activityLabel('TEACHING_ASSISTANT'), 'Monitoria')
  assert.equal(activityLabel('LEGACY_ACTIVITY'), 'LEGACY_ACTIVITY')
  assert.equal(activityLabel(null), 'Atividade não informada')
})

test('combina edital, instituição, ano, UF, região, atividade, acesso, status e busca', () => {
  const selected = edict(1)
  const edicts = [selected,
    edict(2, { state_reference: 'SP' }),
    edict(3, { institution_id: 11 }),
    edict(4, { entry_year: 2026 }),
    edict(5, { region: 'SUL' }),
  ]
  const wanted = rule(1, { title: 'Iniciação científica com bolsa', access_type: 'BOTH' })
  const rules = [wanted,
    rule(2, { activity_codes: ['TEACHING_ASSISTANT'] }),
    rule(3, { status: 'REVIEW_REQUIRED' }),
    rule(4, { access_type: 'PREREQUISITE' }),
    ...edicts.slice(1).map((item) => rule(10 + item.id, {
      edict_id: item.id, source_process_id: item.source_process_id,
      title: 'Iniciação científica com bolsa',
    })),
  ]
  const result = filterCurriculumPlanning(edicts, rules, {
    edictIds: ['1'], institutionIds: ['10'], entryYears: ['2027'],
    stateCodes: [' mg '], regionCodes: ['sudeste'],
    activityCodes: ['RESEARCH'], accessTypes: ['DIRECT'], statuses: ['POINTS_CONFIRMED'],
    query: '  INICIACAO CIENTIFICA COM BOLSA  ', activeOnly: true,
    deadlineFrom: '2026-09-01', deadlineTo: '2026-10-31',
    publishedFrom: '2026-07-01', publishedTo: '2026-08-31',
  })
  assert.deepEqual(result, { groups: [{ edict: selected, rules: [wanted] }], unmappedEdicts: [], ruleCount: 1 })
})

test('cada filtro de metadados restringe realmente os editais elegíveis', () => {
  const edicts = [
    edict(1),
    edict(2, { state_reference: 'SP', region: 'SUDESTE', institution_id: 11, entry_year: 2026 }),
    edict(3, { state_reference: 'RS', region: 'SUL', institution_id: 12, entry_year: 2025, active: false }),
  ]
  const rules = edicts.map((item) => rule(item.id, { edict_id: item.id, source_process_id: item.source_process_id }))
  const cases = [
    [{ stateCodes: ['MG'] }, [1]],
    [{ regionCodes: ['SUL'] }, [3]],
    [{ institutionIds: ['11'] }, [2]],
    [{ entryYears: [2025] }, [3]],
    [{ edictIds: [2, '3'] }, [2, 3]],
    [{ activeOnly: true }, [1, 2]],
    [{ stateCodes: ['MG'], regionCodes: ['SUL'] }, []],
  ]
  for (const [filters, expected] of cases) {
    assert.deepEqual(filterCurriculumPlanning(edicts, rules, filters).groups.map(({ edict: item }) => item.id), expected)
  }
})

test('aceita IDs de edital e instituição como string ou número sem perder vínculo', () => {
  const numeric = edict(1)
  const string = edict('2', { source_process_id: '2027-MG-TEST-2', institution_id: '20' })
  const rules = [rule(1, { edict_id: '1' }), rule(2, { edict_id: 2, source_process_id: string.source_process_id })]
  assert.equal(filterCurriculumPlanning([numeric], rules, { edictIds: ['1'], institutionIds: ['10'] }).ruleCount, 1)
  assert.equal(filterCurriculumPlanning([string], rules, { edictIds: [2], institutionIds: [20] }).ruleCount, 1)
})

test('busca sem acento encontra nome, instituição, código, título, especialidade, exigência e ressalva', () => {
  const item = edict(1, { name: 'Seleção de São Paulo' })
  const matching = rule(1, {
    title: 'Projeto de extensão', specialties_text: 'Cirurgia pediátrica',
    source_item: 'Avaliação de currículo',
    requirements: ['Certificação válida.'], caveats: ['Duração mínima obrigatória.'],
    activity_codes: ['EVENT_ORGANIZER'],
  })
  for (const query of ['SELECAO', 'sao jose', '2027-mg-test-1', 'extensao', 'pediatrica', 'curriculo', 'certificacao', 'duracao', 'organizacao de evento']) {
    assert.equal(filterCurriculumPlanning([item], [matching], { query }).ruleCount, 1, query)
  }
})

test('BOTH aparece nos dois acessos, sem misturar DIRECT com PREREQUISITE', () => {
  const rules = [rule(1, { access_type: 'DIRECT' }), rule(2, { access_type: 'PREREQUISITE' }), rule(3, { access_type: 'BOTH' })]
  for (const [accessTypes, expected] of [[[], [1, 2, 3]], [['DIRECT'], [1, 3]], [['PREREQUISITE'], [2, 3]], [['DIRECT', 'PREREQUISITE'], [1, 2, 3]]]) {
    assert.deepEqual(filterCurriculumPlanning([edict()], rules, { accessTypes }).groups[0].rules.map(({ id }) => id), expected)
  }
})

test('mantém somente ingresso 2025 em diante e não inventa ano quando desconhecido', () => {
  const edicts = [edict(1, { entry_year: 2024 }), edict(2, { entry_year: 2025 }), edict(3, { entry_year: '2027' }), edict(4, { entry_year: null })]
  const rules = edicts.map((item) => rule(item.id, { edict_id: item.id, source_process_id: item.source_process_id }))
  const result = filterCurriculumPlanning(edicts, rules)
  assert.deepEqual(result.groups.map(({ edict: item }) => item.id), [2, 3, 4])
  assert.deepEqual(filterCurriculumPlanning(edicts, rules, { entryYears: ['2027'] }).groups.map(({ edict: item }) => item.id), [3])
  assert.deepEqual(result.unmappedEdicts, [])
})

test('regra com múltiplas atividades e repetição do mesmo ID não duplica resultado ou teto', () => {
  const shared = rule(1, { activity_codes: ['TEACHING_ASSISTANT', 'RESEARCH', 'EXTENSION_PROJECT'] })
  const result = filterCurriculumPlanning([edict()], [shared, { ...shared }], {
    activityCodes: ['TEACHING_ASSISTANT', 'RESEARCH', 'EXTENSION_PROJECT'],
  })
  assert.equal(result.ruleCount, 1)
  assert.equal(result.groups[0].rules.length, 1)
  assert.deepEqual(result.groups[0].rules[0].shared_caps, shared.shared_caps)
})

test('não herda regra de outra edição apenas porque compartilha instituição', () => {
  const older = edict(1, { name: 'Seleção 2026', source_process_id: '2026-MG-TEST', entry_year: 2026 })
  const newer = edict(2, { name: 'Seleção 2027', source_process_id: '2027-MG-TEST', entry_year: 2027 })
  const result = filterCurriculumPlanning([older, newer], [rule(1, { source_process_id: older.source_process_id })])
  assert.deepEqual(result.groups.map(({ edict: item }) => item.id), [1])
  assert.deepEqual(result.unmappedEdicts.map(({ id }) => id), [2])
})

test('rejeita associação por ID ou processo divergentes no filtro de domínio', () => {
  const invalid = [rule(1, { source_process_id: 'OUTRO-PROCESSO' }), rule(2, { edict_id: 99 })]
  assert.equal(filterCurriculumPlanning([edict()], invalid).ruleCount, 0)
  assert.equal(filterCurriculumPlanning([edict()], invalid).unmappedEdicts.length, 1)
  assert.equal(filterCurriculumPlanning([edict()], [rule(3, { edict_id: null })]).ruleCount, 1)
})

test('ordena por edital e status/título, sem somar ou ranquear pontuação de escalas diferentes', () => {
  const edicts = [edict(2, { name: 'Zeta' }), edict(1, { name: 'Alfa' })]
  const rules = [
    rule(1, { title: 'Zeta alta', scoring: { type: 'FIXED', points_per_unit: 100 } }),
    rule(2, { title: 'Alfa baixa', scoring: { type: 'FIXED', points_per_unit: 0.1 } }),
    rule(3, { title: 'A ressalva', status: 'REVIEW_REQUIRED', scoring: { type: 'MANUAL', max_points: 999 } }),
    rule(4, { title: 'A negativa', status: 'NO_POINTS', scoring: { type: 'FIXED', points_per_unit: 0 } }),
    rule(5, { edict_id: 2, source_process_id: edicts[0].source_process_id, scoring: { type: 'FIXED', points_per_unit: 1000 } }),
  ]
  const before = structuredClone({ edicts, rules })
  const result = filterCurriculumPlanning(edicts, rules)
  assert.deepEqual(result.groups.map(({ edict: item }) => item.name), ['Alfa', 'Zeta'])
  assert.deepEqual(result.groups[0].rules.map(({ id }) => id), [2, 1, 3, 4])
  assert.deepEqual(Object.keys(result).sort(), ['groups', 'ruleCount', 'unmappedEdicts'])
  assert.deepEqual(Object.keys(result.groups[0]).sort(), ['edict', 'rules'])
  assert.equal(result.ruleCount, 5)
  assert.deepEqual({ edicts, rules }, before)
})

test('regra escondida por status ou busca não transforma cobertura localizada em pendência', () => {
  const items = [edict(1, { name: 'Seleção auditada' }), edict(2, { name: 'Seleção pendente' })]
  const rules = [rule(1, { status: 'REVIEW_REQUIRED', title: 'Projeto científico' })]
  const statusHidden = filterCurriculumPlanning(items, rules, { statuses: ['POINTS_CONFIRMED'] })
  assert.equal(statusHidden.ruleCount, 0)
  assert.deepEqual(statusHidden.unmappedEdicts.map(({ id }) => id), [2])
  const queryHidden = filterCurriculumPlanning(items, rules, { query: 'expressao inexistente' })
  assert.equal(queryHidden.ruleCount, 0)
  assert.deepEqual(queryHidden.unmappedEdicts, [])
  const filtered = filterCurriculumPlanning(items, rules, { statuses: ['POINTS_CONFIRMED'], query: 'selecao' })
  assert.equal(filtered.ruleCount, 0)
  assert.deepEqual(filtered.unmappedEdicts.map(({ id }) => id), [2])
})

test('pendência respeita atividade/acesso e não equivale a não pontuar', () => {
  const rules = [rule(1, { activity_codes: ['RESEARCH'], access_type: 'DIRECT' })]
  const result = filterCurriculumPlanning([edict()], rules, { activityCodes: ['EXTENSION_PROJECT'], accessTypes: ['PREREQUISITE'] })
  assert.deepEqual(result.groups, [])
  assert.equal(result.unmappedEdicts.length, 1)
  assert.equal(result.ruleCount, 0)
  const explicit = filterCurriculumPlanning([edict()], [rule(2, { status: 'NO_POINTS' })])
  assert.equal(explicit.ruleCount, 1)
  assert.deepEqual(explicit.unmappedEdicts, [])
})

test('ignora status desconhecido e aceita entrada vazia', () => {
  assert.deepEqual(filterCurriculumPlanning(), { groups: [], unmappedEdicts: [], ruleCount: 0 })
  const result = filterCurriculumPlanning([edict()], [rule(1, { status: 'LEGACY_UNKNOWN' })])
  assert.equal(result.ruleCount, 0)
  assert.equal(result.unmappedEdicts.length, 1)
})

test('formata MAX_ONLY sem transformar teto em valor unitário', () => {
  assert.equal(curriculumScoreLabel({ scoring: { type: 'MAX_ONLY', points_per_unit: 15, max_points: 15 } }), 'Teto informado: 15 ponto(s) · valor unitário não definido')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'MAX_ONLY', max_points: 0 } }), 'Teto informado: 0 ponto(s) · valor unitário não definido')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'MAX_ONLY', max_points: null } }), 'Valor unitário não informado')
})

test('formata MANUAL, NO_POINTS e zero sem anunciar pontos positivos inexistentes', () => {
  assert.equal(curriculumScoreLabel({ scoring: { type: 'MANUAL', points_per_unit: 4, max_points: 8 } }), 'Pontuação exige conferência')
  assert.equal(curriculumScoreLabel({ status: 'NO_POINTS', scoring: { type: 'PER_UNIT', points_per_unit: 5 } }), 'Não pontua neste item')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'PER_UNIT', points_per_unit: 0, unit: 'atividade' } }), '0 ponto(s) por atividade')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'FIXED', points_per_unit: 0 } }), '0 ponto(s) pela condição descrita')
  assert.equal(curriculumScoreLabel(null), 'Pontuação não estruturada')
})

test('formata faixas usando ordenação numérica e preserva decimais em português', () => {
  assert.equal(curriculumScoreLabel({ scoring: { type: 'TIERS', tiers: [{ points: 10 }, { points: 2 }, { points: '0.25' }, { points: null }, { points: -1 }, { points: 'inválido' }] } }), 'Faixas de 0,25 a 10 ponto(s)')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'TIERS', tiers: [{ points: 0 }, { points: 1 }] } }), 'Faixas de 0 a 1 ponto(s)')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'TIERS', tiers: [{ points: -1 }, { points: null }] } }), 'Pontuação por faixa; confira as condições')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'PER_UNIT', points_per_unit: '0.3', unit: 'semestre' } }), '0,3 ponto(s) por semestre')
  assert.equal(curriculumScoreLabel({ scoring: { type: 'FIXED', points_per_unit: 2 } }), '2 ponto(s) pela condição descrita')
})

test('carrega release íntegro com IDs numéricos/string e consulta somente release atual', async () => {
  const item = edict(1)
  const matching = rule(1, { edict_id: '1' })
  const published = release(1, 1)
  const client = mockedClient({ edicts: [item], rules: [matching, rule(2, { release_code: 'OLD' })], currentRelease: published })
  assert.deepEqual(await loadCurriculumPlanningData(client), { edicts: [item], rules: [matching], release: published })
  const metadata = client.calls.find(({ table }) => table === 'curriculum_releases')
  assert.equal(metadata.maybeSingle, true)
  assert.deepEqual(metadata.filters, [['is_current', true]])
  assert.match(metadata.columns, /rule_count,edict_count/)
  const query = client.calls.find(({ table }) => table === 'curriculum_rules')
  assert.deepEqual(query.filters, [['release_code', published.code]])
  assert.deepEqual(query.orders, ['id'])
  assert.deepEqual(query.range, [0, 499])
  assert.match(query.columns, /record_hash/)
})

for (const size of [500, 501]) {
  test(`carrega todas as páginas de ${size} editais/regras com intervalos inclusivos de 500`, async () => {
    const edicts = Array.from({ length: size }, (_, index) => edict(index + 1))
    const rules = edicts.map((item) => rule(item.id, { edict_id: String(item.id), source_process_id: item.source_process_id }))
    const client = mockedClient({ edicts, rules, currentRelease: release(size, size) })
    const result = await loadCurriculumPlanningData(client)
    assert.equal(result.edicts.length, size)
    assert.equal(result.rules.length, size)
    assert.equal(new Set(result.rules.map(({ id }) => id)).size, size)
    for (const table of ['edicts', 'curriculum_rules']) {
      assert.deepEqual(client.calls.filter((call) => call.table === table).map(({ range }) => range), [[0, 499], [500, 999]])
      assert.ok(client.calls.filter((call) => call.table === table).every(({ orders }) => orders[0] === 'id'))
    }
  })
}

test('detecta página final truncada pelo rule_count e não retorna sucesso parcial', async () => {
  const edicts = Array.from({ length: 501 }, (_, index) => edict(index + 1))
  const rules = edicts.map((item) => rule(item.id, { edict_id: item.id, source_process_id: item.source_process_id }))
  const client = mockedClient({
    edicts, rules, currentRelease: release(501, 501),
    onRange: ({ table, range }) => table === 'curriculum_rules' && range[0] === 500 ? { data: [], error: null } : undefined,
  })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('INCOMPLETE_RELEASE'))
})

test('rejeita divergência do número de regras esperado na release', async () => {
  const client = mockedClient({ edicts: [edict()], rules: [rule()], currentRelease: release(2, 1) })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('INCOMPLETE_RELEASE'))
})

test('rejeita divergência do número de processos mesmo com rule_count correto', async () => {
  const client = mockedClient({ edicts: [edict()], rules: [rule(1), rule(2)], currentRelease: release(2, 2) })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('INCOMPLETE_RELEASE'))
})

test('valida release completa antes de ocultar editais anteriores a 2025', async () => {
  const old = edict(1, { entry_year: 2024 })
  const current = edict(2, { entry_year: 2025 })
  const rules = [rule(1), rule(2, { edict_id: 2, source_process_id: current.source_process_id })]
  const client = mockedClient({ edicts: [old, current], rules, currentRelease: release(2, 2) })
  const result = await loadCurriculumPlanningData(client)
  assert.deepEqual(result.edicts, [current])
  assert.equal(result.rules.length, 2)
  assert.equal(result.release.rule_count, 2)
})

for (const overrides of [{ edict_id: 99 }, { source_process_id: 'WRONG-PROCESS' }, { edict_id: null }]) {
  test(`rejeita vínculo inválido sem herdar por instituição: ${JSON.stringify(overrides)}`, async () => {
    const client = mockedClient({ edicts: [edict()], rules: [rule(1, overrides)], currentRelease: release(1, 1) })
    await assert.rejects(loadCurriculumPlanningData(client), expectCode('INVALID_RULE_LINK'))
  })
}

test('ausência real de release retorna estado vazio explícito e não consulta regras', async () => {
  const item = edict()
  const client = mockedClient({ edicts: [item], rules: [rule()], currentRelease: null })
  assert.deepEqual(await loadCurriculumPlanningData(client), { edicts: [item], rules: [], release: null })
  assert.equal(client.calls.some(({ table }) => table === 'curriculum_rules'), false)
})

test('release vazia explicitamente publicada permanece distinguível de release ausente', async () => {
  const published = release(0, 0)
  const client = mockedClient({ edicts: [edict()], currentRelease: published })
  const result = await loadCurriculumPlanningData(client)
  assert.deepEqual(result.rules, [])
  assert.deepEqual(result.release, published)
})

test('falha na consulta da release não é convertida para estado vazio bem-sucedido', async () => {
  const client = mockedClient({ releaseError: { code: '42501', message: 'permission denied' } })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('FORBIDDEN'))
  assert.deepEqual(client.calls.map(({ table }) => table), ['curriculum_releases'])
})

test('exceção de transporte na release é propagada como erro da aplicação', async () => {
  const client = mockedClient({ onMaybeSingle() { throw new Error('network unavailable') } })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('UNKNOWN'))
})

for (const table of ['edicts', 'curriculum_rules']) {
  test(`erro ao carregar ${table} impede exibição de sucesso parcial`, async () => {
    const client = mockedClient({
      edicts: [edict()], rules: [rule()], currentRelease: release(1, 1),
      onRange: (call) => call.table === table ? { data: null, error: { code: '42501', message: 'blocked' } } : undefined,
    })
    await assert.rejects(loadCurriculumPlanningData(client), expectCode('FORBIDDEN'))
  })

  test(`resposta sem array em ${table} é release incompleta, não lista vazia`, async () => {
    const client = mockedClient({
      edicts: [edict()], rules: [rule()], currentRelease: release(1, 1),
      onRange: (call) => call.table === table ? { data: null, error: null } : undefined,
    })
    await assert.rejects(loadCurriculumPlanningData(client), expectCode('INCOMPLETE_RELEASE'))
  })
}

test('sem release, falha nos editais continua sendo erro em vez de sucesso vazio', async () => {
  const client = mockedClient({ onRange: () => ({ data: null, error: { code: 'NETWORK_ERROR' } }) })
  await assert.rejects(loadCurriculumPlanningData(client), expectCode('NETWORK_ERROR'))
})
