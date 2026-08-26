import { requireSupabase } from '@/lib/supabase'
import { throwIfError, toAppError } from './errors'

export function createSimpleEntityService(table, singularLabel) {
  return {
    async list() {
      try {
        const { data, error } = await requireSupabase().from(table).select('id,name').order('name')
        throwIfError(error, `Não foi possível carregar ${singularLabel}.`)
        return data ?? []
      } catch (error) {
        throw toAppError(error, `Não foi possível carregar ${singularLabel}.`)
      }
    },

    async create(name) {
      try {
        const { data, error } = await requireSupabase()
          .from(table)
          .insert({ name })
          .select('id,name')
          .single()
        throwIfError(error, `Não foi possível cadastrar ${singularLabel}.`)
        return data
      } catch (error) {
        throw toAppError(error, `Não foi possível cadastrar ${singularLabel}.`)
      }
    },

    async update(id, name) {
      try {
        const { data, error } = await requireSupabase()
          .from(table)
          .update({ name })
          .eq('id', id)
          .select('id,name')
          .single()
        throwIfError(error, `Não foi possível atualizar ${singularLabel}.`)
        return data
      } catch (error) {
        throw toAppError(error, `Não foi possível atualizar ${singularLabel}.`)
      }
    },

    async remove(id) {
      try {
        const { error } = await requireSupabase().from(table).delete().eq('id', id)
        throwIfError(error, `Não foi possível excluir ${singularLabel}.`)
      } catch (error) {
        throw toAppError(error, `Não foi possível excluir ${singularLabel}.`)
      }
    },
  }
}

export const institutionsService = createSimpleEntityService('institutions', 'a instituição')
export const indexersService = createSimpleEntityService('indexers', 'o indexador')
