# Importação auditada do CORE v2.3

Esta carga transforma a planilha `BANCO_EDITAIS_CORE_v2_3_AUDITADO (1).xlsx` em uma camada operacional do Banco de Editais sem alterar a fonte e sem completar lacunas por inferência.

## Fontes fixadas

- CORE: `CORE-v2.3-AUDITADO`
- SHA-256 do XLSX: `7d7cbbadb10f09ba88f389b92f296595caccd0623749f5c2f204ce0d900d11dd`
- Mapping científico: `APP-SCIENTIFIC-MVP-v2`
- SHA-256 do mapping: `535a53b7319fedc714ace0ac8ed4a478373cf17aea37d20a991a3c5c41f2de55`

O mapping contém uma revisão técnica automatizada. Ela não é apresentada como revisão humana.

## Projeção operacional

| Destino | Quantidade | Regra |
| --- | ---: | --- |
| Instituições | 398 | Nome e identificador canônicos preservados. |
| Editais | 220 | Exige exatamente um vínculo canônico de instituição coordenadora. |
| Vínculos edital–instituição | 462 | Coordenadoras e participantes permanecem distintos. |
| Indexadores | 15 | PubMed e MEDLINE permanecem distintos; ISI legado não vira Web of Science. |
| Regras científicas candidatas | 197 | Condições, pontuação, evidência e incerteza ficam estruturadas. |
| Regras publicadas para consulta | 167 | Somente mappings aprovados. |
| Regras bloqueadas | 30 | Permanecem armazenadas, mas nunca são tratadas como válidas. |
| Revistas | 0 | A fonte não contém catálogo confiável de nome, ISSN e Qualis por revista. |

O processo histórico `2025-NACIONAL-PRMMT-NIEPS` não possui vínculo canônico de instituição coordenadora. Ele fica no relatório de exclusões e não é criado com uma instituição presumida. Assim, 220 dos 221 processos entram como editais.

`application_deadline` permanece vazio em todos os editais porque a planilha não fornece esse campo estruturado. `minimum_qualis` e `edict_indexers` também não são preenchidos: as exigências de Qualis e indexação variam por regra científica e não podem ser reduzidas corretamente a um único valor por edital.

## Modelo aditivo

A migração `20260828160000_add_scientific_rules.sql` mantém as tabelas existentes e adiciona:

- metadados de origem e cobertura em `institutions`, `indexers` e `edicts`;
- `edict_institutions`, para os vínculos muitos-para-muitos;
- `scientific_rules`, para as condições científicas normalizadas;
- `scientific_import_batches`, para hash, versão e reconciliação da carga.

A migração `20260828161000_import_core_v2_3_scientific_data.sql` é idempotente por chaves de origem e termina com uma reconciliação transacional. Qualquer divergência nas contagens aborta a migração.

## Semântica da consulta

A consulta usa três resultados:

- **Compatível:** ao menos uma regra publicada foi completamente atendida.
- **Precisa conferir:** existe regra potencial, mas falta informação ou a condição é manual.
- **Incompatível:** todas as regras aplicáveis falharam.

Editais sem regra publicada nunca são promovidos a compatíveis. Valores desconhecidos continuam desconhecidos. Requisitos documentais são exibidos para conferência e não são inventados a partir da ausência de dados.

## Aplicação e verificação

```sh
npx supabase migration list --linked
npx supabase db push --linked
npm test
npm run build
```

Após a carga, a verificação remota deve confirmar exatamente 398 instituições de origem, 220 editais de origem, 462 vínculos, 15 indexadores com código, 197 regras da release e 167 regras publicadas. Registros manuais preexistentes ficam fora dessas contagens e são preservados.
