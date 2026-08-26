import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateEdictCompatibility } from '../src/domain/edictCompatibility.js'
import { compareQualis, QUALIS_LEVELS } from '../src/domain/qualis.js'
import { formatDate, safeExternalUrl } from '../src/lib/formatters.js'

test('mantém a ordem do Qualis da menor para a maior classificação', () => {
  assert.deepEqual(QUALIS_LEVELS, ['B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'])
  assert.ok(compareQualis('A1', 'B4') > 0)
  assert.ok(compareQualis('B4', 'A1') < 0)
})

test('aceita Qualis igual ou superior ao mínimo do edital', () => {
  const exact = evaluateEdictCompatibility({ minimum_qualis: 'A3' }, { qualis: 'A3' })
  const higher = evaluateEdictCompatibility({ minimum_qualis: 'B1' }, { qualis: 'A4' })
  const lower = evaluateEdictCompatibility({ minimum_qualis: 'A2' }, { qualis: 'A3' })

  assert.equal(exact.compatible, true)
  assert.equal(higher.compatible, true)
  assert.equal(lower.compatible, false)
})

test('considera compatível quando existe ao menos um indexador aceito', () => {
  const edict = {
    indexerIds: [1, 2],
    indexers: [{ id: 1, name: 'SciELO' }, { id: 2, name: 'Scopus' }],
  }

  assert.equal(evaluateEdictCompatibility(edict, { indexerIds: [2, 3] }).compatible, true)
  assert.equal(evaluateEdictCompatibility(edict, { indexerIds: [3] }).compatible, false)
})

test('ignora critérios do trabalho que não foram informados', () => {
  const result = evaluateEdictCompatibility({ minimum_qualis: 'A1', indexerIds: [10] }, {})

  assert.equal(result.evaluable, true)
  assert.equal(result.compatible, true)
  assert.deepEqual(result.reasons, ['Nenhum critério de classificação aplicado'])
})

test('rejeita uma classificação Qualis inválida', () => {
  const result = evaluateEdictCompatibility({ minimum_qualis: 'B4' }, { qualis: 'C' })

  assert.equal(result.evaluable, false)
  assert.equal(result.compatible, false)
})

test('formata datas sem deslocamento de fuso horário', () => {
  assert.equal(formatDate('2026-08-24'), '24/08/2026')
})

test('permite apenas links externos HTTP e HTTPS', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), '')
  assert.equal(safeExternalUrl('not a url'), '')
  assert.equal(safeExternalUrl('https://example.com/edital'), 'https://example.com/edital')
})
