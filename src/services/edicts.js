import { requireSupabase } from '@/lib/supabase'
import { throwIfError, toAppError } from './errors'

const EDICT_SELECT = `
  id,
  institution_id,
  name,
  published_at,
  application_deadline,
  source_url,
  active,
  minimum_qualis,
  created_at,
  institution:institutions ( id, name ),
  edict_indexers (
    indexer_id,
    indexer:indexers ( id, name )
  )
`

function normalizeEdict(edict) {
  const associations = edict.edict_indexers ?? []
  const indexers = associations
    .map((item) => item.indexer)
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))

  const { edict_indexers: _associations, ...fields } = edict
  return {
    ...fields,
    indexerIds: associations.map((item) => item.indexer_id),
    indexers,
  }
}

function cleanPayload(id, payload) {
  return {
    p_id: id,
    p_institution_id: payload.institution_id,
    p_name: payload.name.trim(),
    p_published_at: payload.published_at || null,
    p_application_deadline: payload.application_deadline || null,
    p_source_url: payload.source_url?.trim() || null,
    p_active: Boolean(payload.active),
    p_minimum_qualis: payload.minimum_qualis || null,
    p_indexer_ids: [...new Set(payload.indexerIds ?? [])],
  }
}

export async function listEdicts() {
  try {
    const { data, error } = await requireSupabase()
      .from('edicts')
      .select(EDICT_SELECT)
      .order('application_deadline', { ascending: true, nullsFirst: false })
    throwIfError(error, 'Não foi possível carregar os editais.')
    return (data ?? []).map(normalizeEdict)
  } catch (error) {
    throw toAppError(error, 'Não foi possível carregar os editais.')
  }
}

async function saveEdict(id, payload, fallback) {
  try {
    const { data, error } = await requireSupabase().rpc('save_edict', cleanPayload(id, payload))
    throwIfError(error, fallback)
    return { id: data }
  } catch (error) {
    throw toAppError(error, fallback)
  }
}

export function createEdict(payload) {
  return saveEdict(null, payload, 'Não foi possível cadastrar o edital.')
}

export function updateEdict(id, payload) {
  return saveEdict(id, payload, 'Não foi possível atualizar o edital.')
}

export async function deleteEdict(id) {
  try {
    const { error } = await requireSupabase().from('edicts').delete().eq('id', id)
    throwIfError(error, 'Não foi possível excluir o edital.')
  } catch (error) {
    throw toAppError(error, 'Não foi possível excluir o edital.')
  }
}
