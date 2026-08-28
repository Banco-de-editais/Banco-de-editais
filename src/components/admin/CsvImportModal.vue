<template>
  <BaseModal :open="open" title="Importar CSV" description="Revise o resultado completo antes de confirmar. Nenhum dado é enviado ao banco durante a análise." :busy="isBusy" size="xl" @close="close">
    <div class="p-5 sm:p-6">
      <template v-if="step === 'upload'">
        <p v-if="error" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ error }}</p>
        <section class="rounded-xl border border-navy-200 bg-navy-50 p-4 text-sm text-navy-950 dark:border-navy-900 dark:bg-navy-950/40 dark:text-navy-100">
          <h3 class="font-bold">Formato oficial</h3>
          <p class="mt-1 leading-6">Use UTF-8, cabeçalho e separador vírgula (ou ponto e vírgula). A coluna <code>entity_type</code> é obrigatória. Cada linha pode ser <code>institution</code>, <code>indexer</code>, <code>journal</code> ou <code>edict</code>.</p>
          <button type="button" class="mt-3 text-sm font-bold underline underline-offset-2" @click="downloadTemplate">Baixar modelo CSV</button>
        </section>
        <label class="mt-5 block rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-navy-400 dark:border-slate-700">
          <span class="block text-sm font-bold text-slate-800 dark:text-slate-100">Selecione o arquivo CSV</span>
          <span class="mt-1 block text-xs text-slate-500">Somente arquivos .csv; o arquivo será analisado localmente antes da confirmação.</span>
          <input class="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-navy-700 dark:text-slate-300" type="file" accept=".csv,text/csv" :disabled="isBusy" @change="selectFile" />
        </label>
        <p v-if="file" class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Arquivo selecionado: {{ file.name }}</p>
        <details class="mt-5 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <summary class="cursor-pointer font-bold text-slate-800 dark:text-slate-100">Colunas e regras</summary>
          <ul class="mt-3 list-disc space-y-1 pl-5 leading-6">
            <li><code>institution</code> e <code>indexer</code>: exigem <code>name</code>.</li>
            <li><code>journal</code>: exige <code>name</code>, <code>issn</code> (com dígito verificador) e <code>qualis</code> (B4–A1). <code>indexers</code> é opcional.</li>
            <li><code>edict</code>: exige <code>name</code> e <code>institution_name</code>. Datas opcionais usam <code>YYYY-MM-DD</code>; <code>source_url</code> deve ser http(s); <code>active</code> aceita true/false, 1/0, sim/não ou yes/no e fica true se vazio.</li>
            <li><code>indexers</code> é uma lista opcional separada por ponto e vírgula, por exemplo <code>Scopus;SciELO</code>. Se o arquivo usar ponto e vírgula como separador de colunas, envolva essa lista em aspas. Relações podem apontar para registros do mesmo arquivo, em qualquer ordem, ou já cadastrados.</li>
            <li>As demais colunas conhecidas são ignoradas para tipos aos quais não se aplicam. Colunas desconhecidas não são importadas.</li>
          </ul>
        </details>
        <footer class="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isBusy" @click="close">Cancelar</button>
          <button type="button" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-60" :disabled="!file || isBusy" @click="process">{{ isProcessing ? 'Analisando...' : 'Analisar arquivo' }}</button>
        </footer>
      </template>

      <template v-else-if="step === 'review'">
        <p v-if="error" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ error }}</p>
        <p v-if="ignoredHeaders.length" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Colunas desconhecidas ignoradas: {{ ignoredHeaders.join(', ') }}.</p>
        <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumo da importação">
          <div v-for="item in totals" :key="item.label" class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"><p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ item.label }}</p><p class="mt-1 text-xl font-black text-slate-950 dark:text-white">{{ item.value }}</p></div>
        </section>
        <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">O banco receberá somente os {{ summary.new }} registro(s) válido(s) marcado(s) como pronto(s). Registros existentes não são atualizados.</p>
        <div class="mt-5 max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table class="min-w-full text-left text-sm">
            <thead class="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800"><tr><th class="px-3 py-3">Linha</th><th class="px-3 py-3">Tipo</th><th class="px-3 py-3">Registro</th><th class="px-3 py-3">Resultado</th></tr></thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800"><tr v-for="item in preview.items" :key="`${item.line}-${item.entityType}-${item.label}`"><td class="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">{{ item.line }}</td><td class="px-3 py-3 text-slate-600 dark:text-slate-300">{{ entityLabel(item.entityType) }}</td><td class="px-3 py-3 font-medium text-slate-900 dark:text-white">{{ item.label }}</td><td class="px-3 py-3"><span class="font-bold" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span><p v-if="item.message" class="mt-1 max-w-md text-xs leading-5 text-slate-500">{{ item.message }}</p></td></tr></tbody>
          </table>
        </div>
        <footer class="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button type="button" class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="isBusy" @click="step = 'upload'">Trocar arquivo</button>
          <button type="button" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700 disabled:opacity-60" :disabled="!summary.new || isBusy" @click="confirm">{{ isImporting ? 'Importando com segurança...' : 'Confirmar e importar' }}</button>
        </footer>
      </template>

      <template v-else>
        <section class="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><h3 class="text-lg font-black">Importação concluída</h3><p class="mt-2 text-sm leading-6">{{ successMessage }}</p></section>
        <footer class="mt-6 flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800"><button type="button" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700" @click="close">Concluir</button></footer>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { CSV_TEMPLATE, importBulkData, prepareBulkImport } from '@/services/bulkImport'

defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'completed'])
const file = ref(null)
const step = ref('upload')
const preview = ref({ items: [] })
const summary = ref({ new: 0 })
const ignoredHeaders = ref([])
const error = ref('')
const isProcessing = ref(false)
const isImporting = ref(false)
const successMessage = ref('')
const isBusy = computed(() => isProcessing.value || isImporting.value)
const totals = computed(() => [
  { label: 'Instituições', value: summary.value.institutions ?? 0 }, { label: 'Revistas', value: summary.value.journals ?? 0 },
  { label: 'Indexadores', value: summary.value.indexers ?? 0 }, { label: 'Editais', value: summary.value.edicts ?? 0 },
  { label: 'Novos', value: summary.value.new ?? 0 }, { label: 'Existentes', value: summary.value.existing ?? 0 },
  { label: 'Duplicados', value: summary.value.duplicate ?? 0 }, { label: 'Com erro', value: summary.value.error ?? 0 },
])

function selectFile(event) {
  const selected = event.target.files?.[0] ?? null
  error.value = ''
  if (selected && !selected.name.toLocaleLowerCase('pt-BR').endsWith('.csv')) { file.value = null; error.value = 'Selecione um arquivo com extensão .csv.'; return }
  file.value = selected
}
function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'modelo-importacao-banco-de-editais.csv'; link.click()
  URL.revokeObjectURL(url)
}
async function process() {
  if (!file.value || isBusy.value) return
  isProcessing.value = true; error.value = ''
  try {
    const prepared = await prepareBulkImport(await file.value.text())
    preview.value = prepared; summary.value = prepared.summary; ignoredHeaders.value = prepared.ignoredHeaders; step.value = 'review'
  } catch (requestError) { error.value = requestError.message }
  finally { isProcessing.value = false }
}
async function confirm() {
  if (isBusy.value || !summary.value.new) return
  isImporting.value = true; error.value = ''
  try {
    const result = await importBulkData(preview.value.payload)
    successMessage.value = `${result.institutions_created} instituição(ões), ${result.indexers_created} indexador(es), ${result.journals_created} revista(s) e ${result.edicts_created} edital(is) foram criados.`
    step.value = 'success'; emit('completed', result)
  } catch (requestError) { error.value = requestError.message }
  finally { isImporting.value = false }
}
function close() {
  if (isBusy.value) return
  file.value = null; step.value = 'upload'; preview.value = { items: [] }; summary.value = { new: 0 }; ignoredHeaders.value = []; error.value = ''; successMessage.value = ''
  emit('close')
}
function entityLabel(value) { return ({ institution: 'Instituição', journal: 'Revista', indexer: 'Indexador', edict: 'Edital' })[value] ?? '—' }
function statusLabel(value) { return ({ valid: 'Pronto para importar', existing: 'Já existente', duplicate: 'Duplicado', ignored: 'Ignorado', error: 'Erro' })[value] ?? value }
function statusClass(value) { return ({ valid: 'text-emerald-700 dark:text-emerald-300', existing: 'text-sky-700 dark:text-sky-300', duplicate: 'text-amber-700 dark:text-amber-300', ignored: 'text-slate-500', error: 'text-red-700 dark:text-red-300' })[value] ?? '' }
</script>
