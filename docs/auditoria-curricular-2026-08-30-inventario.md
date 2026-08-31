# Inventário local para expansão curricular

Data da inspeção: 2026-08-30. Escopo: monitoria, iniciação científica (IC), projeto de extensão, palestra em congresso, organização de congresso e organização de livro, para ingresso a partir de 2025.

Este documento é um inventário técnico e uma triagem de fontes, **não uma nova release de regras**. Nenhuma alteração no aplicativo, no esquema ou no Supabase foi executada nesta inspeção. A nova camada de planejamento curricular depende de aprovação específica. Fontes primárias e migrações históricas foram preservadas.

## 1. O que existe no repositório

### Camada bruta

O arquivo `.codex-work/normalization/raw/Regras_Curriculares.json`, extraído previamente da planilha CORE, contém **768 linhas de regras brutas de 42 processos**: 650 linhas de ingresso 2026 e 118 de ingresso 2027. Esses números são da extração local, não uma contagem de regras publicadas no site.

Campos úteis já preservados: identificador da regra e do processo, tipo de acesso, grupo de especialidades, categoria, descrição literal, interpretação operacional, pontuação por item, limite de itens, pontuação máxima, janela temporal, documento comprobatório, URL, página, trecho e hash. A existência desses campos não comprova que cada valor foi interpretado corretamente nem dispensa a conferência do documento vigente.

Triagem por palavras em `categoria`, `subcategoria` e `descricao_literal`, normalizando acentos e restringindo ingresso a 2025 ou posterior:

| Tema encontrado por texto | Linhas candidatas | Processos distintos | Ressalva |
| --- | ---: | ---: | --- |
| Monitoria | 59 | 35 | Inclui linhas mistas, como monitoria/liga/estágio. |
| IC ou iniciação científica | 44 | 20 | Inclui IC/extensão e modalidades com/sem bolsa. |
| Extensão | 58 | 26 | Inclui cursos, eventos e projetos; não são equivalentes. |
| Organização | 15 | 7 | Inclui organização de liga e atividades genéricas, não só congressos. |
| Palestra/palestrante | 2 | 2 | As duas menções são atividades comunitárias do Visão Laser; não confirmam palestra em congresso. |

A união dessas buscas contém **154 linhas candidatas em 37 processos**. As colunas não devem ser somadas: uma linha pode mencionar mais de uma atividade. Essas são contagens de busca textual, **não de oportunidades confirmadas**.

### Camada científica publicada por migrações

Foram lidos os arrays JSON de regras nas migrações locais, inclusive o array multilinha do PSU-MG. Resultado: **284 registros declarados**, dos quais **254 têm `published_for_engine: true`**, associados a 86 processos. Isso verifica o conteúdo das migrações; não confirma, por si só, o estado atual do banco remoto.

| Release local | Registros | Marcados para o motor |
| --- | ---: | ---: |
| `APP-SCIENTIFIC-MVP-v2` | 197 | 167 |
| `APP-SCIENTIFIC-PSU-MG-2027-v1` | 4 | 4 |
| `APP-SCIENTIFIC-COVERAGE-v1` | 51 | 51 |
| `APP-SCIENTIFIC-REFRESH-2026-08-29-v1` | 21 | 21 |
| `APP-SCIENTIFIC-REFRESH-2026-08-29-v2` | 3 | 3 |
| `APP-SCIENTIFIC-FELUMA-2027-v1` | 8 | 8 |

“Marcado para o motor” não significa “compatível” ou “pontuação positiva”: há ramos explícitos sem pontuação e regras com condições manuais. Não se deve usar essa contagem como total de oportunidades válidas.

Os únicos tipos aceitos nesses registros são `ARTICLE_PUBLICATION`, `EVENT_PRESENTATION`, `ABSTRACT_PROCEEDINGS`, `BOOK`, `CHAPTER` e `SCIENTIFIC_PRODUCTION`. Não foram encontrados tipos específicos de monitoria, IC, extensão, palestrante ou organizador de congresso. Regras amplas que mencionam iniciação/produção científica não equivalem a cobertura automática de IC.

### Exceção já estruturada: organizador de livro

O script `scripts/build-feluma-2027-non-article-release.mjs` e a migração `supabase/migrations/20260829235500_add_feluma_2027_non_article_rules.sql` declaram duas regras de organização de livro para FELUMA 2027:

| Regra existente | Acesso | Pontos declarados | Limite declarado |
| --- | --- | --- | --- |
| `FELUMA-2027-DIRECT-BOOK-ORGANIZER` | Direto | 1 por livro | 2 documentos; teto 2 compartilhado na seção de publicações |
| `FELUMA-2027-PREREQUISITE-BOOK-ORGANIZER` | Pré-requisito | 1,5 por livro | 2 documentos; teto 3 compartilhado na seção de publicações |

Ambas exigem papel `ORGANIZER`, ISBN e publicação. Não equiparam organizador a autor/coautor de capítulo. A fonte registrada é a [1ª retificação do edital FELUMA 2027](https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf), páginas 63-65 e 82-84, SHA-256 `5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f`.

As pontuações acima descrevem a release local já existente; não constituem uma nova revisão visual da fonte nesta auditoria.

## 2. Acervo local que pode acelerar a conferência

Há três conjuntos de downloads. São contagens de arquivos/lotes, não de editais únicos:

- `.codex-work/normalization/sources/`: o manifesto de 2026-08-29 registra 130 PDFs, entre outros documentos. O mapa de PDFs e processos está em `pdf-analysis.json`.
- `.codex-work/normalization/sources-targeted/`: 8 PDFs, incluindo anexos PSU-MG 2025/2026, UEPA 2025, UVV 2025, FEAS 2025 e CERMAM 2026.
- `.codex-work/normalization/sources-refresh-2027/`: 20 PDFs; há 20 extrações de texto em `extracted-text-refresh-2027/`. O manifesto liga arquivo, processo, URL e SHA-256. Pode haver documentos da mesma edição e duplicação entre conjuntos.

O inventário histórico `.codex-work/normalization/inventory.json` registra 220 editais e estados de cobertura da rodada inicial. **Não deve ser apresentado como fotografia atual do site**, pois antecede as releases complementares e o arquivamento temporal.

### Fontes prioritárias já baixadas - ingresso 2027

Os itens abaixo são **candidatos identificados em extrações locais**. Precisam de confirmação da versão vigente, leitura integral dos itens e revisão visual das tabelas antes de virar regras novas. Nenhuma pontuação nova é aprovada por esta tabela.

Os PDFs da tabela estão em `.codex-work/normalization/sources-refresh-2027/`; os textos têm o padrão `.codex-work/normalization/extracted-text-refresh-2027/<processo>__edital.txt`.

| Processo | Atividades localizadas na triagem | PDF local | Fonte registrada |
| --- | --- | --- | --- |
| `2027-ES-HSRC-IBEST` | Monitoria, IC, extensão, organização, palestra/conferência/mesa científica | `e44a8f832dc37db3c8a4.pdf` | [Edital AFECC/HSRC 2027](https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf) |
| `2027-SP-UNITAU-PRPPG` | Monitoria, IC, projetos de extensão | `04560a6784181f3a516e.pdf` | [Edital revisado UNITAU](https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf) |
| `2027-RS-HCPA-FUNDMED` | Monitoria, IC, extensão, organização de congresso/evento | `f238cb7b9caabfe359e4.pdf` | [Edital HCPA 2027](https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf) |
| `2027-RS-HMV-FUNDMED` | Monitoria, bolsas de pesquisa/IC/extensão; escopos por especialidade | `50de133824aedb9846fa.pdf` | [Edital HMV 2027](https://fundmed.org.br/website/wp-content/uploads/2026/08/HMV-MEDICA-Edital-de-Abertura-das-Inscricoes.pdf) |
| `2027-RS-UFCSPA-FUNDMED` | Monitoria, IC, extensão, seleção por edital e registro oficial | `bce1d56cfef24fdb92d9.pdf` | [Edital UFCSPA 2027](https://fundmed.org.br/website/wp-content/uploads/2026/08/UFCSPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf) |
| `2027-PR-HUC-PUCPR` | Monitoria e IC oficial/voluntária | `ae06006b054eb0d1249e.pdf` | [Edital PUCPR retificado](https://static.pucpr.br/pucpr/2026/08/edital-021-2026_rm_vfinal_ret-1-1.pdf) |
| `2027-PR-HZSL-AMP` | Monitoria/PVA, IC, extensão e organização de evento médico | `1d2d91eb40acb94e13ea.pdf` | [Edital Hospital Dr. Eulalino Ignácio de Andrade](https://cms.amp.org.br/arquivos/bibliotecaarquivos/hospital-dr-eulalino-ignacio-de-andrade_1787059994.pdf) |
| `2027-SP-FMJ-VUNESP` | Monitoria e IC | `446e042d3aa13bb1be9e.pdf` | [Edital FMJ 2027](https://fmj.br/wp-content/uploads/2026/08/EdResidMedica_ESPECIALIDADES_2027_Abertura.pdf) |
| `2027-RO-HBAP-CEMETRON-SESAU` | Pesquisa/IC e monitoria | `afd5ad9baaf3301f9da9.pdf` | [Edital SESAU/RO 2027](https://rondonia.ro.gov.br/wp-content/uploads/2026/08/Edital_75959607_Edital_2026.pdf) |
| `2027-CE-APEC-ACEP` | Bolsas de monitoria e IC | `a9a9acbdecb08c6a5456.pdf` | [Edital APEC/ACEP 2027](https://concursos.acep.org.br/resmedpsi2027/Edital012026.pdf) |
| `2027-SP-ABHU-UNIMAR` | Programas de IC, extensão e monitoria/ligas | `7f96749cad99ac49c15e.pdf` | [Edital ABHU 2027](https://www.hospitalunimar.com.br/wp-content/uploads/2026/06/EDITAL-RESIDENCIA-ABHU-2027.pdf) |

Para UFCSPA também existe `f19b9fedc00a8467eb8d.pdf`, [atualização do edital](https://fundmed.org.br/website/wp-content/uploads/2026/08/UFCSPA-Medica-Atualizacao-do-edital.pdf). A versão principal não deve ser avaliada sem conferir a atualização.

Para PSU-MG 2027, os anexos estão no conjunto `sources/`:

- `ce9446301e2bd105c3a2.pdf`: [anexo de entrada direta](https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf).
- `9e048432cc7928f668ef.pdf`: [anexo de pré-requisito](https://www.galaxcms.com.br/up_crud_comum/601/Anexo2AvaliacaoCurricularPadronizadaPre-RequisitoPSUMG2027-20260716100202.pdf).

O arquivo local FELUMA identificado no primeiro lote, `sources/b8e1634952e12a0a9f1d.pdf`, corresponde ao edital original, **não** à 1ª retificação usada pela última release. Não reutilizá-lo como se fosse a versão final.

### Âncoras úteis para revisão

- HSRC: tabela pp. 14-15 e detalhamento posterior. A extração de texto distingue o item 2D (organização/palestrante/conferencista/mesa) do item 2G (participante); há tetos por bloco e proibição de reutilização do mesmo comprovante entre itens. A extração contém requisitos de duração/carga horária para monitoria, extensão e IC. Conferir divergências entre tabela e detalhamento, se houver.
- UNITAU: extração com “PROJETOS DE EXTENSÃO”, “MONITORIAS” e “PROJETOS DE INICIAÇÃO CIENTÍFICA”. Preserva condições de duração, conclusão e período da graduação, que precisam ficar vinculadas a cada atividade.
- HCPA: “ITEM G) MONITORIAS, PROJETOS E INICIAÇÃO CIENTÍFICA” e trechos específicos de organização de congressos. Há distinção entre entidade profissional de classe e evento estudantil.
- HMV: fichas com “Monitorias - Peso máximo 2,0 pontos” e escopos diferentes por especialidade; verificar limites compartilhados com bolsas.
- UFCSPA: linha conjunta monitoria/IC/extensão, com seleção por edital; não desmembrar o teto conjunto como se cada modalidade tivesse o teto integral.
- HZSL/AMP: o texto local da tabela está concatenado em uma linha longa; obrigatória revisão visual antes de associar coluna, pontos e quantidade.

### Candidatos da planilha que ainda exigem recuperar/conferir a fonte

Exemplos de registros brutos úteis para a fila de auditoria:

- CESUPA 2027: `R02-007`, `R02-008`, `R02-023` - monitoria e pesquisa/extensão.
- FEAS Curitiba 2027: `R03-001`, `R03-004` - monitoria e IC.
- Hospital do Trabalhador/NC-UFPR 2027: `R04-001`, `R04-002`, `R04-007`, `R04-008`, `R04-028`, `R04-029` - ensino, IC, extensão e organização, com distinção de acesso.
- UEL 2027: `R05-006`, `R05-017`, `R05-027` - IC por bolsa/duração, monitoria e projeto de extensão.
- SES-PE 2026: `R15-002`, `R15-004` - monitoria/PID e extensão/PET-Saúde.
- UEM 2026: `R34-003`, `R34-005`, `R34-010`, `R34-023` - extensão, monitoria, bolsa de IC e organização.
- HCPA 2026: `R38-011`, `R38-012`, `R38-018` a `R38-021` - organização, modalidades de monitoria e extensão.

Essas linhas possuem URLs na extração bruta. Não foi localizado vínculo correspondente no `pdf-analysis.json` do primeiro lote para vários desses processos; isso significa “não encontrado nesse índice”, não que o PDF inexista ou que o edital não pontue.

## 3. Adequação do modelo e limites atuais

Referências de código:

- `supabase/migrations/20260828160000_add_scientific_rules.sql`: `scientific_rules`, `score_formula`, `scope`, `condition_groups` e restrição `scientific_rules_family_check`.
- `src/domain/edictCompatibility.js`: hierarquia `PRODUCTION_PARENTS`, `scientificFacts`, campos de entrada e classificação de compatibilidade.
- `src/domain/scientificRules.js`: rótulos de famílias e `scientificScoreLabel`.
- `src/services/edicts.js`: consulta apenas a camada `scientific_rules` junto dos editais.
- `src/views/ConsultationView.vue`: tipos de produção existentes e papel `ORGANIZER` para livro.

O modelo tem boas bases de proveniência, escopo, condições e fórmulas, mas a restrição de família admite somente as cinco famílias científicas atuais. A interface e os fatos do avaliador são orientados a publicações e apresentações. Portanto, apenas acrescentar opções ao seletor não implementaria corretamente o planejamento das novas atividades.

Uma extensão aprovada precisaria representar, no mínimo:

1. Atividade e papel: monitoria, IC, projeto de extensão, palestrante/conferencista, organizador de evento/congresso, organizador de livro; sem confundir participação como ouvinte ou autoria de trabalho.
2. Escopo: edição, instituição, acesso direto/pré-requisito, programa/especialidade e período da graduação.
3. Unidade e duração: horas totais, horas mensais/semanais, meses, semestres concluídos, anos e regras de frações.
4. Vínculo: institucional/oficial, seleção por edital/concurso, registro na pró-reitoria, bolsa/voluntário, supervisão e área exigida.
5. Pontuação: valor por unidade/faixa, teto do item, teto compartilhado, alternativas mutuamente exclusivas e restrições de acúmulo.
6. Evidência: fonte vigente, página/item, hash quando disponível, comprovantes e condições manuais preservadas.
7. Cobertura por atividade: confirmado com pontuação, explicitamente não pontua, parcial/ambíguo, fonte pendente e ainda não auditado.

A exibição atual de pontuação apresenta valor por item e máximo, mas não explicita todos os tetos compartilhados. Um painel de planejamento não deve simplesmente somar máximos de linhas nem comparar pontos brutos de escalas diferentes entre editais. O peso da análise curricular e o máximo da ficha devem ser mostrados quando confirmados; ausência não deve ser preenchida por suposição.

## 4. Riscos que devem bloquear uma normalização automática

- **Palestra não é apresentação oral de resumo.** Certificados e itens são distintos.
- **Curso de extensão não é projeto de extensão.** A triagem textual local deliberadamente inclui ambos como candidatos.
- **Organizar liga não é organizar congresso.** Preservar o papel e a entidade.
- **IC voluntária, bolsista e participação genérica em pesquisa podem pontuar diferentemente.** Não aplicar uma taxa geral.
- **Teto compartilhado não é teto individual.** Não duplicar pontos ao dividir uma linha mista em várias categorias.
- **Escopo específico não é regra de todo edital.** FMB/UNESP, IDOR, HMV e outros possuem fichas por grupo/programa.
- **Sem regra auditada não significa ausência de pontuação.** Exibir cobertura pendente, sem zero inventado.
- **Texto extraído não prova associação correta de colunas.** Tabelas precisam de inspeção visual.
- **Documento antigo ou edital original não substitui retificação vigente.** Preservar edições separadas e conferir anexos/comunicados.
- **Premissas de artigos não se propagam às atividades.** A política de DOI/ISSN/publicação não elimina duração, vínculo ou requisitos de IC/monitoria/extensão.
- **Pontos brutos não são comparáveis entre bancas.** Evitar ranking absoluto enganoso.

## 5. Estado de verificação deste inventário

Realizado: leitura de esquema/código/scripts; contagem dos registros JSON brutos; leitura e contagem dos arrays de regras das migrações; inspeção de manifestos locais; triagem de extrações de texto; identificação de fontes e riscos.

Não realizado por este inventário: consulta ao Supabase remoto, nova revisão visual integral dos PDFs, confirmação de todos os links na internet, aprovação de novas regras, mudança de aplicação, migração de banco ou publicação. As conferências primárias realizadas em dossiês posteriores devem prevalecer sobre os candidatos desta triagem.
