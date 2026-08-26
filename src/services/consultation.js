import { institutionsService, indexersService } from './simpleEntities'
import { listJournals } from './journals'
import { listEdicts } from './edicts'

export async function loadConsultationData() {
  const [institutions, indexers, journals, edicts] = await Promise.all([
    institutionsService.list(),
    indexersService.list(),
    listJournals(),
    listEdicts(),
  ])

  return { institutions, indexers, journals, edicts }
}
