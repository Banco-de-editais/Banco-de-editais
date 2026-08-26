<template>
  <div>
    <PageHeader title="Usuários" description="Contas autenticadas e permissões de acesso à aplicação." icon="users" eyebrow="Administração">
      <template #actions>
        <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" @click="showDetails = true"><AppIcon name="plus" class="h-5 w-5" />Novo usuário</button>
      </template>
    </PageHeader>

    <div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/35">
      <div class="flex items-start gap-3">
        <AppIcon name="warning" class="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <div>
          <h2 class="font-bold text-amber-900 dark:text-amber-100">Integração administrativa necessária</h2>
          <p class="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">O Supabase Auth não permite listar ou criar outros usuários com uma chave pública. Fazer isso no navegador exigiria expor uma chave privilegiada, o que seria inseguro. Esta tela permanece deliberadamente sem essas ações até a aprovação de uma Edge Function protegida para administradores.</p>
        </div>
      </div>
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900" aria-label="Filtros de usuários indisponíveis">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Buscar por email</span>
          <span class="relative block"><AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input type="search" disabled placeholder="Disponível após integração segura" class="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800" /></span>
        </label>
        <label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ordenação</span><select disabled class="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800"><option>Email: A–Z</option></select></label>
      </div>
    </section>

    <EmptyState class="mt-6" icon="users" title="Listagem protegida não configurada" description="Nenhum dado do Auth foi exposto. Aprove a integração server-side proposta para habilitar a listagem e o cadastro." />

    <BaseModal :open="showDetails" title="Cadastro de usuário indisponível" description="Esta ação precisa ser executada em um ambiente server-side confiável." size="md" @close="showDetails = false">
      <div class="space-y-4 p-5 text-sm leading-6 text-slate-600 sm:p-6 dark:text-slate-300">
        <p>A solução segura é uma Edge Function que valide o JWT do solicitante, confirme <code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">app_metadata.role = admin</code> e só então use a API administrativa do Auth.</p>
        <p>A chave de serviço deve existir somente como segredo da função e nunca em variáveis <code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">VITE_*</code>.</p>
        <div class="rounded-xl border border-navy-200 bg-navy-50 p-4 text-navy-800 dark:border-navy-900 dark:bg-navy-950/50 dark:text-navy-200"><strong>Aguardando aprovação:</strong> nenhum recurso do Supabase foi criado ou alterado.</div>
      </div>
      <footer class="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40"><button type="button" class="h-11 rounded-xl bg-navy-600 px-5 text-sm font-bold text-white hover:bg-navy-700" @click="showDetails = false">Entendi</button></footer>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
const showDetails = ref(false)
</script>
