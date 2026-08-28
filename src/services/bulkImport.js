import { isQualisLevel } from '@/domain/qualis'
import { requireSupabase } from '@/lib/supabase'
import { throwIfError, toAppError } from './errors'

export const CSV_TEMPLATE = `entity_type,name,issn,qualis,institution_name,published_at,application_deadline,source_url,active,indexers
institution,Instituto Nacional de Telecomunicações,,,,,,,,
indexer,Scopus,,,,,,,,
journal,Revista de Exemplo,1234-5679,A1,,,,,Scopus
edict,Edital de Residência 2026,,,Instituto Nacional de Telecomunicações,2026-08-01,2026-09-01,https://example.org/edital,true,Scopus`

const KNOWN_HEADERS = new Set(['entity_type', 'name', 'issn', 'qualis', 'institution_name', 'published_at', 'application_deadline', 'source_url', 'active', 'indexers'])
const ENTITY_TYPES = new Set(['institution', 'journal', 'indexer', 'edict'])
const EMPTY_SUMMARY = () => ({ institutions: 0, journals: 0, indexers: 0, edicts: 0, new: 0, existing: 0, duplicate: 0, ignored: 0, error: 0 })

function clean(value) { return String(value ?? '').trim() }
function normalizeUrl(value) { return clean(value) || null }

function parseCsvRecords(text, delimiter) {
  const content = text.replace(/^\uFEFF/, '')
  const records = []
  let record = []
  let field = ''
  let quoted = false
  let startLine = 1
  let line = 1

  for (let position = 0; position < content.length; position += 1) {
    const char = content[position]
    const next = content[position + 1]
    if (quoted) {
      if (char === '"' && next === '"') { field += '"'; position += 1 }
      else if (char === '"') quoted = false
      else { field += char; if (char === '\n') line += 1 }
      continue
    }
    if (char === '"') {
      if (field) throw new Error(`Aspas inesperadas na linha ${line}.`)
      quoted = true
    } else if (char === delimiter) {
      record.push(field)
      field = ''
    } else if (char === '\r' || char === '\n') {
      if (char === '\r' && next === '\n') position += 1
      record.push(field)
      records.push({ line: startLine, values: record })
      record = []
      field = ''
      line += 1
      startLine = line
    } else field += char
  }
  if (quoted) throw new Error(`Aspas não fechadas a partir da linha ${startLine}.`)
  if (field || record.length) { record.push(field); records.push({ line: startLine, values: record }) }
  return records
}

function parseCsv(text) {
  const rawLines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  const firstNonEmpty = rawLines.find((line) => line.trim())
  if (!firstNonEmpty) return []
  const delimiter = (firstNonEmpty.match(/;/g)?.length ?? 0) > (firstNonEmpty.match(/,/g)?.length ?? 0) ? ';' : ','
  return parseCsvRecords(text, delimiter)
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function validIssn(value) {
  const compact = value.replace('-', '').toUpperCase()
  if (!/^\d{7}[\dX]$/.test(compact)) return false
  const sum = compact.slice(0, 7).split('').reduce((total, digit, index) => total + Number(digit) * (8 - index), 0)
  const check = (11 - (sum % 11)) % 11
  return String(check === 10 ? 'X' : check) === compact[7]
}

function parseBoolean(value) {
  const normalized = clean(value).toLocaleLowerCase('pt-BR')
  if (!normalized) return { value: true }
  if (['true', '1', 'sim', 's', 'yes'].includes(normalized)) return { value: true }
  if (['false', '0', 'não', 'nao', 'n', 'no'].includes(normalized)) return { value: false }
  return { error: 'Use true/false, 1/0, sim/não ou yes/no para o campo active.' }
}

function parseIndexerNames(value, errors) {
  const names = clean(value).split(';').map(clean).filter(Boolean)
  if (clean(value) && !names.length) errors.push('Indexadores inválidos.')
  if (new Set(names).size !== names.length) errors.push('Um mesmo indexador foi informado mais de uma vez.')
  return names
}

function makeItem(line, row) {
  const entityType = clean(row.entity_type).toLocaleLowerCase('en-US')
  const errors = []
  if (!entityType && Object.values(row).every((value) => !clean(value))) return { line, entityType: '', label: 'Linha vazia', status: 'ignored', message: 'Linha vazia ignorada.' }
  if (!ENTITY_TYPES.has(entityType)) errors.push('entity_type deve ser institution, journal, indexer ou edict.')
  const data = {
    name: clean(row.name), issn: clean(row.issn).toUpperCase(), qualis: clean(row.qualis).toUpperCase(),
    institution_name: clean(row.institution_name), published_at: clean(row.published_at), application_deadline: clean(row.application_deadline),
    source_url: normalizeUrl(row.source_url), indexer_names: [], active: true,
  }
  if (entityType === 'institution' || entityType === 'indexer') {
    if (!data.name) errors.push('name é obrigatório.')
  }
  if (entityType === 'journal') {
    data.indexer_names = parseIndexerNames(row.indexers, errors)
    if (!data.name) errors.push('name é obrigatório.')
    if (!data.issn) errors.push('issn é obrigatório.')
    else if (!validIssn(data.issn)) errors.push('ISSN inválido; use um ISSN válido de 8 caracteres, como 1234-5679.')
    if (!data.qualis) errors.push('qualis é obrigatório.')
    else if (!isQualisLevel(data.qualis)) errors.push('qualis deve ser B4, B3, B2, B1, A4, A3, A2 ou A1.')
  }
  if (entityType === 'edict') {
    data.indexer_names = parseIndexerNames(row.indexers, errors)
    const parsedActive = parseBoolean(row.active)
    if (parsedActive.error) errors.push(parsedActive.error)
    else data.active = parsedActive.value
    if (!data.name) errors.push('name é obrigatório.')
    if (!data.institution_name) errors.push('institution_name é obrigatório.')
    for (const [field, label] of [['published_at', 'published_at'], ['application_deadline', 'application_deadline']]) {
      if (data[field] && !validDate(data[field])) errors.push(`${label} deve usar uma data real no formato YYYY-MM-DD.`)
    }
    if (data.published_at && data.application_deadline && data.application_deadline < data.published_at) errors.push('application_deadline não pode ser anterior a published_at.')
    if (data.source_url) {
      try { if (!['http:', 'https:'].includes(new URL(data.source_url).protocol)) throw new Error() } catch { errors.push('source_url deve ser uma URL http:// ou https:// válida.') }
    }
    if (data.qualis && !isQualisLevel(data.qualis)) errors.push('minimum qualis deve ser B4, B3, B2, B1, A4, A3, A2 ou A1.')
  }
  const labels = { institution: data.name, indexer: data.name, journal: data.name || data.issn, edict: data.name }
  return { line, entityType, label: labels[entityType] || 'Registro sem identificação', status: errors.length ? 'error' : 'valid', message: errors.join(' '), data }
}

function entityKey(item) {
  if (item.entityType === 'institution' || item.entityType === 'indexer') return item.data.name
  if (item.entityType === 'journal') return item.data.issn
  if (item.entityType === 'edict') return JSON.stringify([item.data.institution_name, item.data.name, item.data.published_at, item.data.application_deadline, item.data.source_url, item.data.active, item.data.qualis, [...item.data.indexer_names].sort()])
  return ''
}

function edictKey(edict) {
  return JSON.stringify([edict.institution_name, edict.name, edict.published_at || '', edict.application_deadline || '', edict.source_url || null, edict.active, edict.minimum_qualis || '', [...(edict.indexer_names ?? [])].sort()])
}

async function loadExistingData() {
  const client = requireSupabase()
  const [institutions, indexers, journals, edicts] = await Promise.all([
    client.from('institutions').select('name'),
    client.from('indexers').select('name'),
    client.from('journals').select('issn'),
    client.from('edicts').select('name,published_at,application_deadline,source_url,active,minimum_qualis,institution:institutions(name),edict_indexers(indexer:indexers(name))'),
  ])
  for (const result of [institutions, indexers, journals, edicts]) throwIfError(result.error, 'Não foi possível verificar os registros já cadastrados.')
  return {
    institutions: new Set((institutions.data ?? []).map((item) => item.name)),
    indexers: new Set((indexers.data ?? []).map((item) => item.name)),
    journals: new Set((journals.data ?? []).map((item) => item.issn)),
    edicts: new Set((edicts.data ?? []).map((item) => edictKey({
      institution_name: item.institution?.name ?? '', name: item.name, published_at: item.published_at, application_deadline: item.application_deadline,
      source_url: item.source_url, active: item.active, minimum_qualis: item.minimum_qualis,
      indexer_names: (item.edict_indexers ?? []).map((link) => link.indexer?.name).filter(Boolean),
    }))),
  }
}

function applyPreview(items, existing) {
  const seen = new Map()
  for (const item of items) {
    if (item.status !== 'valid') continue
    const key = `${item.entityType}:${entityKey(item)}`
    if (seen.has(key)) { item.status = 'duplicate'; item.message = `Duplicado da linha ${seen.get(key)} no arquivo.` }
    else seen.set(key, item.line)
  }
  const incomingInstitutions = new Set(items.filter((item) => item.entityType === 'institution' && item.status === 'valid').map((item) => item.data.name))
  const incomingIndexers = new Set(items.filter((item) => item.entityType === 'indexer' && item.status === 'valid').map((item) => item.data.name))
  for (const item of items) {
    if (item.status !== 'valid') continue
    const isExisting = (item.entityType === 'institution' && existing.institutions.has(item.data.name))
      || (item.entityType === 'indexer' && existing.indexers.has(item.data.name))
      || (item.entityType === 'journal' && existing.journals.has(item.data.issn))
      || (item.entityType === 'edict' && existing.edicts.has(entityKey(item)))
    if (isExisting) { item.status = 'existing'; item.message = 'Registro idêntico ou identificado por constraint UNIQUE já existe; nada será alterado.' }
  }
  for (const item of items) {
    if (item.status !== 'valid') continue
    const errors = []
    if (item.entityType === 'edict' && !existing.institutions.has(item.data.institution_name) && !incomingInstitutions.has(item.data.institution_name)) errors.push(`Instituição "${item.data.institution_name}" não encontrada nem fornecida no CSV.`)
    if (item.entityType === 'journal' || item.entityType === 'edict') {
      for (const indexerName of item.data.indexer_names) if (!existing.indexers.has(indexerName) && !incomingIndexers.has(indexerName)) errors.push(`Indexador "${indexerName}" não encontrado nem fornecido no CSV.`)
    }
    if (errors.length) { item.status = 'error'; item.message = errors.join(' ') }
  }
}

function makePayload(items) {
  const payload = { institutions: [], indexers: [], journals: [], edicts: [] }
  for (const item of items) {
    if (item.status !== 'valid') continue
    const record = { line_number: item.line, ...item.data }
    if (item.entityType === 'institution') payload.institutions.push({ line_number: item.line, name: item.data.name })
    if (item.entityType === 'indexer') payload.indexers.push({ line_number: item.line, name: item.data.name })
    if (item.entityType === 'journal') payload.journals.push({ line_number: item.line, name: item.data.name, issn: item.data.issn, qualis: item.data.qualis, indexer_names: item.data.indexer_names })
    if (item.entityType === 'edict') payload.edicts.push({ ...record, minimum_qualis: item.data.qualis || null })
  }
  return payload
}

function summarize(items) {
  const summary = EMPTY_SUMMARY()
  const plural = { institution: 'institutions', journal: 'journals', indexer: 'indexers', edict: 'edicts' }
  for (const item of items) {
    if (plural[item.entityType]) summary[plural[item.entityType]] += 1
    if (Object.hasOwn(summary, item.status)) summary[item.status] += 1
    if (item.status === 'valid') summary.new += 1
  }
  return summary
}

export async function prepareBulkImport(text) {
  try {
    const records = parseCsv(text)
    if (!records.length) throw new Error('O arquivo CSV está vazio.')
    const [headerRecord, ...dataRecords] = records
    const headers = headerRecord.values.map((value) => clean(value).toLocaleLowerCase('en-US'))
    if (!headers.includes('entity_type')) throw new Error('O cabeçalho obrigatório entity_type não foi encontrado.')
    if (new Set(headers).size !== headers.length) throw new Error('O CSV possui cabeçalhos repetidos.')
    const ignoredHeaders = headers.filter((header) => header && !KNOWN_HEADERS.has(header))
    const items = dataRecords.map((record) => {
      const row = Object.fromEntries(headers.map((header, index) => [header, record.values[index] ?? '']))
      const item = makeItem(record.line, row)
      if (record.values.length > headers.length && item.status !== 'ignored') {
        item.status = 'error'
        item.message = `${item.message ? `${item.message} ` : ''}A linha possui mais colunas que o cabeçalho; use aspas para valores que contêm o separador.`
      }
      return item
    })
    if (!items.length) throw new Error('O CSV não possui linhas de dados.')
    const existing = await loadExistingData()
    applyPreview(items, existing)
    return { items, summary: summarize(items), payload: makePayload(items), ignoredHeaders }
  } catch (error) {
    throw toAppError(error, 'Não foi possível processar o CSV.')
  }
}

export async function importBulkData(payload) {
  try {
    const { data, error } = await requireSupabase().rpc('import_bulk_data', { p_payload: payload })
    throwIfError(error, 'Não foi possível importar os dados. Nenhuma alteração foi aplicada.')
    return data
  } catch (error) {
    throw toAppError(error, 'Não foi possível importar os dados. Nenhuma alteração foi aplicada.')
  }
}
