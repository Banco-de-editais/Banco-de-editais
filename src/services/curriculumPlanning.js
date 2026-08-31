import { currentPeriodEdicts } from '../domain/consultationFilters.js'
import { AppError, throwIfError, toAppError } from './errors.js'

const PAGE_SIZE = 500
const EDICT_COLUMNS = `id,name,institution_id,institution:institutions(id,name),source_process_id,
  entry_year,state_reference,region,source_url,active,access_type,curriculum_max_score,curriculum_weight_percent`
const RULE_COLUMNS = `id,edict_id,source_process_id,source_rule_id,release_code,activity_codes,title,
  access_type,specialties_text,source_item,status,scoring,shared_caps,requirements,caveats,evidence,checked_at,record_hash`

async function allPages(makeQuery) {
  const rows = []
  for (let offset = 0; offset < 100000; offset += PAGE_SIZE) {
    const { data, error } = await makeQuery().range(offset, offset + PAGE_SIZE - 1)
    throwIfError(error, 'Não foi possível carregar o planejamento curricular.')
    if (!Array.isArray(data)) throw new AppError('Resposta incompleta do planejamento curricular.', 'INCOMPLETE_RELEASE')
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
  throw new AppError('A consulta excedeu o limite seguro de carregamento.', 'RESULT_LIMIT')
}

export async function loadCurriculumPlanningData(clientOverride) {
  try {
    const client = clientOverride ?? (await import('../lib/supabase.js')).requireSupabase()
    const { data: release, error } = await client.from('curriculum_releases')
      .select('code,checked_at,description,rule_count,edict_count')
      .eq('is_current', true).maybeSingle()
    throwIfError(error, 'O planejamento curricular ainda não está disponível. Tente novamente em instantes.')

    const [edicts, rules] = await Promise.all([
      allPages(() => client.from('edicts').select(EDICT_COLUMNS).order('id')),
      release ? allPages(() => client.from('curriculum_rules').select(RULE_COLUMNS)
        .eq('release_code', release.code).order('id')) : Promise.resolve([]),
    ])
    if (release && (rules.length !== release.rule_count
      || new Set(rules.map((rule) => rule.source_process_id)).size !== release.edict_count)) {
      throw new AppError('A carga curricular está incompleta. Atualize a página; os dados parciais não serão exibidos.', 'INCOMPLETE_RELEASE')
    }
    const byId = new Map(edicts.map((edict) => [String(edict.id), edict]))
    if (rules.some((rule) => byId.get(String(rule.edict_id))?.source_process_id !== rule.source_process_id)) {
      throw new AppError('Há uma inconsistência no vínculo de uma regra curricular. Os dados não serão exibidos.', 'INVALID_RULE_LINK')
    }
    return { edicts: currentPeriodEdicts(edicts), rules, release }
  } catch (error) {
    throw toAppError(error, 'Não foi possível carregar o planejamento curricular.')
  }
}
