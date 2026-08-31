# Auditoria curricular: UNITAU e HSRC 2027

Consulta das fontes: 30/08/2026. Extração assistida e revisão visual de tabelas; não é revisão humana da banca. Este documento prepara dados, não publica regras nem altera o Supabase.

## Fontes e versão

| Processo já identificado no projeto | Página oficial | Documento conferido | SHA-256 |
| --- | --- | --- | --- |
| `2027-SP-UNITAU-PRPPG` | [UNITAU: Residência Médica 2027](https://unitau.br/concursos/658/processo-seletivo-residencia-medica-2027/) | [Edital revisado em 05/08](https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf) | `77df9b6538427c3977f6a3abe9d8e16cefba7fffd0ec92489f08b132dea1307b` |
| `2027-ES-HSRC-IBEST` | [Ibest: processo 67](https://www.institutoibest.org.br/informacoes/67/) | [Edital 1, de 25/08/2026](https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf) | `c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32` |

Os dois PDFs foram baixados novamente com sucesso e seus hashes coincidem com as cópias da pesquisa anterior. As páginas oficiais consultadas continuam ligando esses arquivos; não foi localizado nelas outro edital/retificação curricular posterior nesta checagem. Isso não substitui conferência antes de inscrição.

Cópias locais adicionais, sem sobrescrever as anteriores: `outputs/research-root-20260830/unitau-2027.pdf` e `outputs/research-root-20260830/hsrc-2027.pdf`. Páginas renderizadas e inspecionadas: UNITAU 12-14; HSRC 14-15 e 17-18. Numeração do PDF igual à impressa nas páginas citadas.

## UNITAU: acesso direto

| Atividade / item | Pontos e teto na fonte | Requisitos principais | Tratamento proposto |
| --- | --- | --- | --- |
| Monitoria, 2(e), p. 13 | 5 por monitoria; 10 para duas ou mais | Pelo menos 20 horas mensais e um semestre letivo; realizada até fim do 4º ano/8º período de Medicina; documento oficial validado pela IES de origem | Valor e teto estruturáveis. Manter horas mensais distintas de horas totais e semestre letivo distinto de seis meses corridos |
| Iniciação científica, 3(f), p. 13 | Coluna de pontuação máxima: 15; não há valor unitário explícito | Projeto concluído, regular, com ou sem bolsa; um ano ou dois semestres; regulação/certificação por IES e/ou CNPq/FAP; validação pela IES de origem; até colação de grau | `MAX_ONLY`: mostrar teto 15, sem inventar 15 por projeto nem quantidade necessária para atingir o teto |
| Projeto de extensão, 1(b), p. 12 | Teto 5; o texto menciona 1 por atividade e 5 para cinco ou mais, mas também repete fórmula de estágio 10/20 | Projeto regular na IES por ao menos um ano; concluído até fim do 4º ano/8º período de Medicina; documento oficial e validação da IES | Pontuação ambígua. Não selecionar silenciosamente uma das fórmulas; pode aparecer como oportunidade com ressalva, sem cálculo automático |

O item 1(b) também abrange gestão de ligas acadêmicas: o teto 5 é do item compartilhado, não um teto independente por tipo. O subtotal do bloco 1 é 40. Monitoria tem subtotal 10. IC integra o bloco de produção científica, subtotal 40 (p. 14). Nesse bloco não se pode reutilizar o mesmo trabalho/publicação em itens diferentes. Currículo total: 100.

Não transformar a palavra "organizador" nos exemplos documentais do item 3(h) em nova regra de organização: esse item pontua trabalho apresentado. O item 3(j), p. 14, trata de ouvinte/participante, não de palestrante. Não transferir as regras de acesso direto para pré-requisito, cujo quadro começa na p. 14.

## Hospital Santa Rita de Cássia / AFECC: acesso direto

O edital oferece Anestesiologia, Cirurgia Geral, Clínica Médica e Radiologia e Diagnóstico por Imagem sem pré-requisito de residência (p. 1). Pontos abaixo pertencem à escala curricular de 0 a 10, não são automaticamente pontos da nota final.

| Atividade / item | Pontos por ocorrência | Teto do item | Teto compartilhado do bloco | Requisitos e ressalvas |
| --- | ---: | ---: | ---: | --- |
| Projeto de extensão / comunidade, 2A, p. 14 | 0,5 | 1,0 | 5,0 (bloco 2) | Pelo menos 120 horas; instituição identifica atividade, papel, período/carga e assina. Detalhamento 17.5, p. 17, agrupa extensão com estágios; preservar essas condições documentais para conferência |
| Monitoria, 2C, p. 14 | 0,25 | 0,5 | 5,0 (bloco 2) | Quadro: 80 horas totais OU 4 meses. Detalhamento 17.5.3, p. 17, também menciona um semestre letivo; não apagar esse qualificador ao normalizar |
| Palestrante / conferencista, 2D, p. 14 | 0,5 | 1,0 | 5,0 (bloco 2) | Evento científico com vínculo de ensino; certificado identifica função, evento, período/carga e instituição. Simples participante não é elegível a este item |
| Organização / comissão organizadora / coordenação de evento, 2D, p. 14 | 0,5 | O MESMO 1,0 de 2D | O MESMO 5,0 do bloco 2 | Mesma regra oficial da linha anterior. Os filtros podem encontrar ambos os papéis, mas não duplicar regra, comprovante ou teto |
| Iniciação científica com bolsa ou voluntária, 3B, p. 15 | 0,25 | 0,25 | 2,5 (bloco 3) | Ao menos um ano; institucional/CNPq/fundação estadual; participação como aluno pesquisador ou função diretamente ligada à pesquisa; documento oficial. Não aceitar função administrativa, auxiliar/contratado como equivalente |

Detalhamento dos eventos e da IC: p. 18, itens 17.5.4 e 17.6.2. Eventos científicos incluem congresso, fórum, seminário, simpósio e outros formatos enumerados; workshop somente dentro desses eventos. Curso de capacitação não identificado como evento científico não é equivalente. A atividade de participante do item 2G não pode usar a mesma comprovação de organização de eventos.

Organização de livro não foi confirmada como atividade autônoma: o item 3A é de publicação de capítulo e o detalhamento 17.6.1 lista organizador entre papéis documentais. Essa menção isolada não autoriza criar regra de livro organizado nem aplicar a premissa operacional de ISBN dos capítulos a livros completos.

## Consequências para a futura consulta

- Um registro oficial pode atender a vários filtros de atividade; deve manter um único identificador e um único teto compartilhado.
- Distinguir pontuação unitária, teto de item, teto de bloco e escala do currículo. Não ordenar oportunidades de instituições diferentes como se essas escalas fossem iguais.
- Mostrar "regra localizada com ressalva" para contradição da fonte, sem confundir com ausência de regra.
- "Não localizada nesta auditoria" não significa "não pontua".
- Preservar duração, carga horária, fase de formação, bolsa e papel real no evento. Premissas anteriores de revistas/capítulos não se estendem automaticamente a atividades curriculares.
