export const SCIENTIFIC_FAMILY_LABELS = {
  ARTIGO_PUBLICACAO: 'Artigo / publicação',
  APRESENTACAO_EVENTO: 'Apresentação em evento',
  RESUMO_ANAIS: 'Resumo em anais',
  LIVRO_CAPITULO: 'Livro / capítulo',
  PRODUCAO_CIENTIFICA_AMPLA: 'Produção científica ampla',
}

export function scientificFamilyLabel(value) {
  return SCIENTIFIC_FAMILY_LABELS[value] ?? value ?? 'Regra científica'
}

export function scientificScoreLabel(rule) {
  const score = rule?.score_formula
  if (!score) return 'Pontuação não estruturada'
  if (score.type === 'MANUAL') return score.literal_formula ? `Cálculo manual: ${score.literal_formula}` : 'Cálculo manual'
  if (score.points_per_item != null && score.maximum_points != null) {
    return `${score.points_per_item} ponto(s) por item · máximo ${score.maximum_points}`
  }
  if (score.maximum_points != null) return `Máximo ${score.maximum_points} ponto(s)`
  return score.normalized_expression || 'Pontuação conforme o edital'
}

export function scientificRequirementLabel(rule) {
  const parts = []
  if ((rule?.indexing_requirements ?? []).some((item) => item.operator === 'HAS_ANY')) {
    parts.push('Indexação: qualquer base científica cadastrada')
  }
  const exactIndexers = (rule?.indexing_requirements ?? [])
    .filter((item) => item.exact_match_allowed && !['MANUAL', 'HAS_ANY'].includes(item.operator))
    .map((item) => item.base)
  if (exactIndexers.length) parts.push(`Indexação: ${[...new Set(exactIndexers)].join(', ')}`)
  if (rule?.qualis_requirement) {
    const minimum = rule.qualis_requirement.minimum_stratum
      ?? rule.qualis_requirement.minimum
      ?? rule.qualis_requirement.stratum
    const exact = rule.qualis_requirement.exact_match_allowed !== false
      && rule.qualis_requirement.operator !== 'MANUAL'
      && minimum
    parts.push(exact ? `Qualis mínimo: ${minimum}` : 'Qualis: conferência manual de área/período')
  }
  if (rule?.authorship_requirement?.roles?.length) parts.push(`Autoria: ${rule.authorship_requirement.roles.join(', ')}`)
  if ((rule?.unknown_data ?? []).length) parts.push(`${rule.unknown_data.length} dado(s) desconhecido(s)`)
  return parts.length ? parts.join(' · ') : 'Sem requisito adicional estruturado'
}

export function scientificScopeLabel(rule) {
  const scope = rule?.scope ?? {}
  const parts = []
  const accessType = String(scope.access_type ?? '').toUpperCase()
  if (accessType === 'DIRECT') parts.push('Acesso direto')
  else if (accessType === 'PREREQUISITE') parts.push('Pré-requisito / ano adicional')
  else if (accessType === 'BOTH') parts.push('Todos os tipos de acesso')

  const specialty = scope.specialty_group_text ?? scope.specialty_group
  if (specialty) parts.push(specialty)
  const institution = scope.institution_name
  if (institution) parts.push(`Instituição: ${institution}`)
  return parts.length ? `Escopo: ${parts.join(' · ')}` : 'Escopo: consultar a regra do edital'
}
