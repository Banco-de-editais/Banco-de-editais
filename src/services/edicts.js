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
  source_process_id,
  entry_year,
  publication_year,
  geographic_scope,
  state_reference,
  region,
  exam_board,
  access_type,
  specialties_text,
  curriculum_analysis_status,
  curriculum_weight_percent,
  curriculum_max_score,
  phase_nature,
  validity_status,
  document_status,
  validation_status,
  confirmation_level,
  consulted_at,
  coverage_status,
  source_notes,
  created_at,
  institution:institutions ( id, name ),
  edict_indexers (
    indexer_id,
    indexer:indexers ( id, name, code, exact_match_allowed )
  ),
  scientific_rules (
    id,
    source_rule_id,
    source_process_id,
    release_code,
    family,
    production_type,
    accepted_production_types,
    initial_eligibility,
    mapping_status,
    published_for_engine,
    mapping_confidence,
    matrix_row,
    scope,
    condition_groups,
    score_formula,
    indexing_requirements,
    qualis_requirement,
    authorship_requirement,
    document_requirements,
    date_window,
    presentation_formats,
    event_scopes,
    publication_scopes,
    event_organizer,
    subject_area_requirement,
    evidence,
    unknown_data,
    warnings,
    review,
    source_metadata,
    mapping_hash
  )
`

function normalizeEdict(edict) {
  const associations = edict.edict_indexers ?? []
  const indexers = associations
    .map((item) => item.indexer)
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))

  const scientificRules = [...(edict.scientific_rules ?? [])]
    .sort((left, right) => Number(right.published_for_engine) - Number(left.published_for_engine)
      || left.family.localeCompare(right.family)
      || left.source_rule_id.localeCompare(right.source_rule_id))

  const { edict_indexers: _associations, scientific_rules: _scientificRules, ...fields } = edict
  return {
    ...fields,
    indexerIds: associations.map((item) => item.indexer_id),
    indexers,
    scientificRules,
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
