export function filterEdicts(edicts = [], filters = {}) {
  const edictIds = Array.isArray(filters.edictIds) ? filters.edictIds : []
  const institutionIds = Array.isArray(filters.institutionIds) ? filters.institutionIds : []

  return edicts.filter((edict) =>
    (!filters.activeOnly || edict.active)
    && (!edictIds.length || edictIds.includes(edict.id))
    && (!institutionIds.length || institutionIds.includes(edict.institution_id))
    && (!filters.deadlineFrom || (edict.application_deadline && edict.application_deadline >= filters.deadlineFrom))
    && (!filters.deadlineTo || (edict.application_deadline && edict.application_deadline <= filters.deadlineTo))
    && (!filters.publishedFrom || (edict.published_at && edict.published_at >= filters.publishedFrom))
    && (!filters.publishedTo || (edict.published_at && edict.published_at <= filters.publishedTo)))
}
