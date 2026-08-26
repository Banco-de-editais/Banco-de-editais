export function formatDate(value) {
  if (!value) return 'Não informada'
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return 'Não informada'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

export function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export function safeExternalUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}
