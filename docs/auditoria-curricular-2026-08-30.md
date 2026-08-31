# Expansão curricular: primeira rodada de auditoria

Data: 30/08/2026. Registro da etapa de pesquisa, anterior à aprovação da área separada de planejamento. Nessa etapa, nenhuma regra foi adicionada ao Supabase. Após a confirmação do usuário, a implementação seguiu o contrato e as validações registrados em [Planejamento curricular](planejamento-curricular.md).

## Resultado

Foram revisadas fontes oficiais de sete processos: FELUMA 2027, PSU-MG 2027, FMUSP 2026, UFCSPA 2027, HCPA 2027, UNITAU 2027 e HSRC/AFECC 2027. O recorte é monitoria, iniciação científica/pesquisa, projeto de extensão, palestrante, organização de congresso/evento e organização de livro. Esses processos já estão identificados no projeto: não foram criadas duplicatas para aumentar a contagem de editais.

Esta é uma primeira rodada, não uma auditoria integral de todos os editais. Os dossiês registram pontuação, unidade, limites, escopo, evidência e conflitos; não substituem os textos completos na implementação de cada condição.

| Dossiê | Conteúdo |
| --- | --- |
| [Inventário técnico](auditoria-curricular-2026-08-30-inventario.md) | Cobertura local, regras brutas, fontes disponíveis e lacunas do modelo |
| [FELUMA e PSU-MG](auditoria-curricular-2026-08-30-mg.md) | Acesso direto/pré-requisito, projetos, eventos, livros e ambiguidades do PSU |
| [FMUSP, UFCSPA e HCPA](auditoria-curricular-2026-08-30-outras.md) | Variantes de bolsa/duração, tetos compartilhados e errata da FMUSP |
| [UNITAU e HSRC](auditoria-curricular-2026-08-30-unitau-hsrc.md) | Pontos unitários versus teto, papéis em eventos e conflitos entre tabela e detalhamento |

## Decisão apresentada e posteriormente aprovada pelo usuário

Adicionar uma área **Planejamento curricular**, ao lado da consulta de compatibilidade atual, com camada própria no Supabase. A consulta de revistas, artigos, livros/capítulos e apresentações continuaria funcionando como está.

Motivo: localizar uma atividade que pontua não prova que um currículo individual atende aos critérios. As novas regras exigem duração, vínculo institucional, papel, bolsa e limites compartilhados que não cabem em uma simples opção de tipo de publicação.

### Funcionalidade proposta

- Filtros por uma ou mais atividades, nome do edital, instituição coordenadora, estado, região, ano de ingresso e acesso direto/pré-requisito; incluir especialidade quando a ficha for específica.
- Mostrar pontuação por unidade/faixa, teto do item, teto do grupo, unidade exigida e requisitos de duração/carga horária.
- Mostrar fonte oficial, versão, página/item e data da conferência.
- Distinguir regra com pontuação localizada, regra com ressalva/ambiguidade, explicitamente sem pontuação (apenas quando comprovado) e não auditado/fonte pendente.
- Uma regra que abranja várias atividades será encontrada pelos vários filtros, mas continuará sendo uma só regra, com um só teto.
- Não calcular automaticamente a nota pessoal nem criar ranking entre escalas diferentes nesta primeira versão. O propósito inicial será mapear oportunidades e requisitos.

### Limites preservados

- Ingresso de 2025 em diante; edições e tipos de acesso não herdam regras entre si.
- As premissas já autorizadas para artigos e capítulos permanecem restritas a esses tipos.
- Livro organizado é distinto de capítulo; palestra é distinta de apresentação de trabalho; projeto de extensão é distinto de curso/evento de extensão.
- Dado desconhecido permanece desconhecido. Ausência de regra auditada não vira zero nem compatibilidade.
- Regras originais e migrações anteriores não serão reescritas. Novas regras terão proveniência e versão próprias.
- Vínculo institucional ou atuação como pesquisador/palestrante/organizador precisa ser real e documentável; o nome comercial de uma atividade não comprova elegibilidade.

## Principais pendências da fonte

- PSU-MG: acumulação das alternativas de IC e duração/escopo dos eventos apresentam divergências internas. Registrar como ressalva; não resolver por suposição.
- UNITAU: extensão contém fórmulas conflitantes; IC explicita teto sem pontuação unitária. Não preencher esses campos por inferência.
- FMUSP: a errata de 11/12/2025 substitui valores de organização no acesso direto; não estendê-la ao pré-requisito.
- UFCSPA/HCPA/FELUMA/HSRC: tetos compartilhados impedem somar cada modalidade como oportunidade independente.
- Vários processos ainda precisam de fonte ou auditoria curricular; a fila técnica está no inventário.

## Verificação e preservação na etapa de pesquisa

Em 30/08/2026, `npm test` passou nos 49 testes existentes. A página de revistas online foi conferida, carregando os dois registros existentes após atualização da página. Não foram criados cadastros de teste.

Fontes baixadas novamente foram preservadas em subpastas próprias de `outputs/`, com hashes nos dossiês. As tabelas relevantes tiveram inspeção visual assistida, distinta de revisão humana. Aplicativo, configurações, migrations, registros remotos e implantação permaneceram inalterados. Apenas os cinco documentos desta auditoria e cópias locais das fontes foram acrescentados; nenhum commit ou deploy foi executado.
