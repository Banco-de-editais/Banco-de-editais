<template>
  <SimpleEntityView
    title="Indexadores" description="Gerencie as bases de indexação disponíveis para classificação das revistas." icon="indexer"
    singular="Indexador" :service="indexersService" create-label="Novo indexador" edit-label="Editar indexador"
    search-label="Buscar indexador" search-placeholder="Pesquisar por nome..." form-description="Use o nome oficial da base de indexação."
    empty-title="Nenhum indexador cadastrado" empty-description="Cadastre bases como PubMed, SciELO ou outras presentes nos editais."
    delete-title="Excluir indexador?" delete-description="As associações deste indexador com revistas também serão removidas."
  />
</template>

<script setup>
import SimpleEntityView from './SimpleEntityView.vue'
import { indexersService } from '@/services/simpleEntities'
</script>
