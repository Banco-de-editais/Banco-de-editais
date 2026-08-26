import { compareQualis, isQualisLevel } from './qualis.js'

export function evaluateEdictCompatibility(edict, work = {}) {
  const reasons = []
  const workQualis = work.qualis || null
  const workIndexerIds = [...new Set(work.indexerIds ?? [])]
  const edictIndexerIds = edict.indexerIds ?? []

  if (workQualis) {
    if (!isQualisLevel(workQualis)) {
      return { compatible: false, evaluable: false, reasons: [] }
    }

    if (edict.minimum_qualis) {
      const comparison = compareQualis(workQualis, edict.minimum_qualis)
      if (comparison === null) return { compatible: false, evaluable: false, reasons: [] }
      if (comparison < 0) return { compatible: false, evaluable: true, reasons: [] }
      reasons.push(`Qualis ${workQualis} atende ao mínimo ${edict.minimum_qualis}`)
    } else {
      reasons.push('Sem exigência mínima de Qualis')
    }
  }

  if (workIndexerIds.length) {
    if (edictIndexerIds.length) {
      const matchingIndexer = edict.indexers?.find((indexer) => workIndexerIds.includes(indexer.id))
      const hasMatch = matchingIndexer || edictIndexerIds.some((id) => workIndexerIds.includes(id))
      if (!hasMatch) return { compatible: false, evaluable: true, reasons: [] }
      reasons.push(matchingIndexer ? `Indexador aceito: ${matchingIndexer.name}` : 'Indexador aceito pelo edital')
    } else {
      reasons.push('Sem exigência de indexador')
    }
  }

  if (!reasons.length) reasons.push('Nenhum critério de classificação aplicado')

  return {
    compatible: true,
    evaluable: true,
    reasons,
  }
}
