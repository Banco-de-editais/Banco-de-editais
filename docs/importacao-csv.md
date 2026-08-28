# Importação administrativa por CSV

O modelo oficial está em [`public/modelo-importacao-banco-de-editais.csv`](../public/modelo-importacao-banco-de-editais.csv) e também pode ser baixado no modal **Importar CSV**, na tela de Editais. O arquivo usa UTF-8, cabeçalho e vírgula como separador (ponto e vírgula também é aceito). Valores que contenham o separador devem ser envolvidos por aspas duplas, no padrão CSV.

## Cabeçalho

```csv
entity_type,name,issn,qualis,institution_name,published_at,application_deadline,source_url,active,indexers
```

`entity_type` é obrigatório em toda linha e aceita apenas `institution`, `indexer`, `journal` e `edict`. A estrutura é ampla: as colunas conhecidas que não pertencem ao tipo daquela linha são ignoradas. Colunas desconhecidas são avisadas no preview e nunca são enviadas ao banco.

| Tipo | Colunas obrigatórias | Colunas opcionais |
| --- | --- | --- |
| `institution` | `name` | — |
| `indexer` | `name` | — |
| `journal` | `name`, `issn`, `qualis` | `indexers` |
| `edict` | `name`, `institution_name` | `published_at`, `application_deadline`, `source_url`, `active`, `qualis`, `indexers` |

Para editais, `qualis` representa `minimum_qualis`. Para revistas, representa o `qualis` obrigatório da revista. Os valores aceitos são `B4`, `B3`, `B2`, `B1`, `A4`, `A3`, `A2` e `A1`.

Datas usam exatamente `YYYY-MM-DD`; a deadline não pode ser anterior à publicação. `source_url` deve iniciar com `http://` ou `https://`. `active` aceita `true`/`false`, `1`/`0`, `sim`/`não` e `yes`/`no`; vazio significa `true` (o default da tabela). O ISSN de revista deve ter 8 caracteres e dígito verificador válido, como `1234-5679`.

`indexers` é uma lista de nomes separada por ponto e vírgula: `Scopus;SciELO`. Se o CSV usar ponto e vírgula como separador de colunas, a lista deve estar entre aspas: `"Scopus;SciELO"`. `institution_name` e cada nome de `indexers` podem apontar para uma linha do mesmo arquivo, em qualquer posição, ou para um registro existente. O nome deve coincidir exatamente após a remoção de espaços nas extremidades.

## Exemplos

```csv
institution,Universidade de São Paulo,,,,,,,,
indexer,SciELO,,,,,,,,
journal,Revista Brasileira de Exemplo,1234-5679,A2,,,,,Scopus;SciELO
edict,Edital de Pesquisa 2026,,,Universidade de São Paulo,2026-08-01,2026-09-30,https://usp.br/edital,true,SciELO
```

## Duplicações e consistência

Instituições e indexadores são identificados pelo `name`, e revistas pelo `issn`, conforme as constraints `UNIQUE` do banco. Repetições no CSV são marcadas como duplicadas; registros já existentes são mantidos e nunca atualizados pela importação.

`edicts` não tem constraint `UNIQUE`. Para não presumir que o nome é único, o importador só considera como existente um edital com a mesma instituição, nome, datas, URL, estado ativo, Qualis mínimo e conjunto de indexadores. Um edital com qualquer diferença é permitido pelo modelo atual e será criado. Essa comparação é feita no preview e novamente no banco, com lock transacional para importações concorrentes.

O preview não altera dados. Na confirmação, uma RPC PostgreSQL verifica novamente a role administrativa, campos, referências e constraints; resolve instituições/indexadores antes de revistas/editais; e executa toda a chamada em uma única transação. Qualquer falha faz rollback de toda a importação.
