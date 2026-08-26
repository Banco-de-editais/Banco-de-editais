import { requireSupabase } from '@/lib/supabase'
import { toAppError } from './errors'

export async function signInWithPassword(email, password) {
  try {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })

    if (error) {
      const message = error.status === 400
        ? 'Email ou senha inválidos.'
        : 'Não foi possível entrar. Tente novamente.'
      throw toAppError(error, message)
    }

    return data
  } catch (error) {
    throw toAppError(error, 'Não foi possível entrar. Tente novamente.')
  }
}

export async function signOut() {
  try {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
  } catch (error) {
    throw toAppError(error, 'Não foi possível encerrar a sessão.')
  }
}
