import { requireSupabase } from '@/lib/supabase'
import { AppError, toAppError } from './errors'

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

export async function createUser({ name, email, isAdmin }) {
  try {
    const { data, error } = await requireSupabase().functions.invoke('admin-create-user', {
      body: {
        name,
        email,
        role: isAdmin ? 'admin' : 'user',
      },
    })

    if (error) {
      const response = error.context
      const payload = response instanceof Response ? await response.json().catch(() => null) : null
      throw new AppError(payload?.message ?? 'Não foi possível criar o usuário.', String(response?.status ?? error.name), error)
    }

    return data
  } catch (error) {
    throw toAppError(error, 'Não foi possível criar o usuário.')
  }
}

export async function updatePassword(password) {
  try {
    const { data, error } = await requireSupabase().auth.updateUser({ password })
    if (error) throw error
    return data
  } catch (error) {
    throw toAppError(error, 'Não foi possível definir a senha. Tente novamente.')
  }
}
