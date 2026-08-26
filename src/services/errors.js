const DUPLICATE_CODE = '23505'
const FOREIGN_KEY_CODE = '23503'

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN', cause = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
  }
}

export function toAppError(error, fallback = 'Não foi possível concluir a operação.') {
  if (error instanceof AppError) return error

  if (error?.message === 'SUPABASE_NOT_CONFIGURED') {
    return new AppError(
      'Configure a URL e a chave pública do Supabase para usar a aplicação.',
      'SUPABASE_NOT_CONFIGURED',
      error,
    )
  }

  if (error?.code === DUPLICATE_CODE) {
    return new AppError('Já existe um registro com esses dados.', 'DUPLICATE', error)
  }

  if (error?.code === FOREIGN_KEY_CODE) {
    return new AppError('Este registro está em uso e não pode ser excluído.', 'IN_USE', error)
  }

  if (error?.code === '42501') {
    return new AppError('Você não tem permissão para realizar esta ação.', 'FORBIDDEN', error)
  }

  return new AppError(fallback, error?.code ?? 'UNKNOWN', error)
}

export function throwIfError(error, fallback) {
  if (error) throw toAppError(error, fallback)
}
