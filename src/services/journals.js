import { requireSupabase } from '@/lib/supabase'
import { normalizeOptionalIssn } from '@/domain/journals'
import { throwIfError, toAppError } from './errors'

const JOURNAL_SELECT = `
  id,
  name,
  issn,
  qualis,
  journal_indexers (
    indexer_id,
    indexer:indexers ( id, name, code, exact_match_allowed )
  )
`

function normalizeJournal(journal) {
  const associations = journal.journal_indexers ?? []
  const indexers = associations
    .map((item) => item.indexer)
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))

  const { journal_indexers: _associations, ...fields } = journal
  return {
    ...fields,
    indexerIds: associations.map((item) => item.indexer_id),
    indexers,
  }
}

function cleanPayload(id, payload) {
  return {
    p_id: id,
    p_name: payload.name.trim(),
    p_issn: normalizeOptionalIssn(payload.issn),
    p_qualis: payload.qualis,
    p_indexer_ids: [...new Set(payload.indexerIds ?? [])],
  }
}

export async function listJournals() {
  try {
    const { data, error } = await requireSupabase().from('journals').select(JOURNAL_SELECT).order('name')
    throwIfError(error, 'Não foi possível carregar as revistas.')
    return (data ?? []).map(normalizeJournal)
  } catch (error) {
    throw toAppError(error, 'Não foi possível carregar as revistas.')
  }
}

async function saveJournal(id, payload, fallback) {
  try {
    const { data, error } = await requireSupabase().rpc('save_journal', cleanPayload(id, payload))
    throwIfError(error, fallback)
    return { id: data }
  } catch (error) {
    throw toAppError(error, fallback)
  }
}

export function createJournal(payload) {
  return saveJournal(null, payload, 'Não foi possível cadastrar a revista.')
}

export function updateJournal(id, payload) {
  return saveJournal(id, payload, 'Não foi possível atualizar a revista.')
}

export async function deleteJournal(id) {
  try {
    const { error } = await requireSupabase().from('journals').delete().eq('id', id)
    throwIfError(error, 'Não foi possível excluir a revista.')
  } catch (error) {
    throw toAppError(error, 'Não foi possível excluir a revista.')
  }
}
