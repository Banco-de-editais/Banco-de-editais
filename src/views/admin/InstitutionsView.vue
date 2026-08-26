<template>
  <SimpleEntityView
    title="Instituições" description="Cadastre e organize as instituições responsáveis pelos editais." icon="institution"
    singular="Instituição" :service="institutionsService" create-label="Nova instituição" edit-label="Editar instituição"
    search-label="Buscar instituição" search-placeholder="Pesquisar por nome..." form-description="Informe o nome oficial da instituição."
    empty-title="Nenhuma instituição cadastrada" empty-description="Cadastre a primeira instituição para associá-la a editais."
    delete-title="Excluir instituição?" delete-description="A exclusão só será permitida se nenhum edital estiver associado."
  />
</template>

<script setup>
import SimpleEntityView from './SimpleEntityView.vue'
import { institutionsService } from '@/services/simpleEntities'
</script>
