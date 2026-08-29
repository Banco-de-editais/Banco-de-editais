export function normalizeOptionalIssn(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function normalizeOptionalQualis(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  return normalized || null
}

export function journalOptionLabel(journal) {
  return [journal?.name, journal?.issn].filter(Boolean).join(' · ')
}

export function journalMetadataLabel(journal) {
  return [journal?.issn ? `ISSN ${journal.issn}` : null, journal?.qualis ? `Qualis ${journal.qualis}` : null]
    .filter(Boolean)
    .join(' · ')
}
