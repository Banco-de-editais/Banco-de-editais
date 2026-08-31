# Planejamento curricular

Área separada da consulta de compatibilidade, disponível pela rota `/planejamento` para contas ativas. Reúne regras documentadas para planejar atividades; **não avalia a elegibilidade de um currículo pessoal**.

## Escopo da primeira versão

- Código: `CURRICULUM-PLANNING-2026-08-30-v1`.
- Conferência das fontes: `2026-08-30`.
- SHA-256 do conjunto normalizado: `1cb180bee1b01772f61cf263140f245611dc684407842392c5e7293823cfc1f5`.
- 41 regras de 7 processos: 31 com pontuação prevista, 10 com ressalva e nenhuma exclusão explícita de pontuação nesta versão.
- Ingresso a partir de 2025. A cobertura é parcial: não representa todas as atividades, fichas ou especialidades de cada edital.

| Processo | Regras | Pontuação prevista | Com ressalva |
| --- | ---: | ---: | ---: |
| FELUMA 2027 | 9 | 9 | 0 |
| PSU-MG 2027 | 7 | 2 | 5 |
| FMUSP/FUVEST 2026 | 7 | 5 | 2 |
| HCPA 2027 | 10 | 10 | 0 |
| UFCSPA 2027 | 1 | 1 | 0 |
| HSRC/IBEST 2027 | 4 | 2 | 2 |
| UNITAU 2027 | 3 | 2 | 1 |
| **Total** | **41** | **31** | **10** |

As contagens são de regras únicas, não de atividades aceitas nem de pontos acumuláveis. Uma mesma regra pode conter vários códigos de atividade.

## Consulta e interpretação

Há seis atividades pesquisáveis:

| Código | Atividade |
| --- | --- |
| `TEACHING_ASSISTANT` | Monitoria |
| `RESEARCH` | Iniciação científica / pesquisa |
| `EXTENSION_PROJECT` | Projeto de extensão |
| `EVENT_SPEAKER` | Palestrante em evento / congresso |
| `EVENT_ORGANIZER` | Organização de evento / congresso |
| `BOOK_ORGANIZER` | Organização de livro |

Filtros independentes: atividade, edital, coordenadora, estado, região, ano de ingresso, tipo de acesso, situação da regra e texto livre. Os resultados são agrupados por edital e ordenados por nome/ano, sem ranking de pontos entre escalas diferentes.

O acesso da regra é `DIRECT`, `PREREQUISITE` ou `BOTH`. Uma regra `BOTH` aparece tanto na seleção de acesso direto quanto na de pré-requisito, sem ser duplicada. A ficha e as especialidades permanecem explícitas no cartão.

Situações:

- `POINTS_CONFIRMED` / **Pontuação prevista**: critério e pontuação identificados na fonte; requisitos e comprovantes continuam necessários.
- `REVIEW_REQUIRED` / **Regra com ressalva**: existe uma condição, ambiguidade ou limitação que exige conferência específica.
- `NO_POINTS` / **Não pontua (expresso)**: somente para exclusão expressa da fonte; ausência de regra nunca gera esse estado.

Os cartões mostram pontos por unidade ou faixa, teto do item, todos os tetos compartilhados, requisitos, ressalvas e evidência. **Não há soma automática**: tetos de seção, alternativas, duração, bolsa e escopo podem impedir o acúmulo. O máximo/peso curricular cadastrado é apenas contexto, não um cálculo de nota.

A seção “Sem regra mapeada neste recorte” mantém visíveis as pendências. Falta de cobertura não significa zero pontos. Esconder uma regra por situação/texto não transforma seu edital em não mapeado. Quando há busca textual, a lista sem regras só pode pesquisar nome do edital, coordenadora e identificador do processo.

## Arquitetura e proteção

- `public.curriculum_releases`: versões do conjunto, data, hash e contagens. O índice `curriculum_releases_one_current` permite no máximo uma versão com `is_current = true`.
- `public.curriculum_rules`: regras vinculadas à versão e ao edital, com unicidade em `(release_code, source_rule_id)`.
- Ambas têm RLS. O acesso de contas autenticadas é somente leitura (`SELECT`), condicionado a `public.is_active_account()`. Não há permissão de leitura anônima nem escrita pelo navegador, inclusive para administradores da aplicação.
- `src/services/curriculumPlanning.js` carrega somente a versão atual e pagina os registros. Confere contagens e vínculos; uma carga incompleta/inconsistente produz erro, não dados parciais presumidos. Sem versão atual, retorna editais com regras vazias e a interface informa a ausência de publicação.
- `src/domain/curriculumPlanning.js` filtra o catálogo e formata pontuações. Não chama o avaliador de compatibilidade pessoal.
- `CurriculumPlanningView.vue` e `CurriculumRuleCard.vue` apresentam a nova área. A consulta científica existente permanece separada.

Dados revisados: `data/curriculum/2026-08-30/mg.json`, `other.json` e `unitau-hsrc.json`. Cada regra preserva `source_process_id`, `source_rule_id`, item, acesso, requisitos, data e fontes com URL, páginas e SHA-256 do documento. O `record_hash` identifica o conteúdo canônico de cada regra; o `source_sha256` da release identifica o conjunto normalizado, **não um único PDF**.

## Validação e importação

No PowerShell, antes de aplicar ou publicar:

```powershell
npm.cmd run validate:curriculum-release
npm.cmd test
npm.cmd run build
```

`validate:curriculum-release` deve executar o builder em modo `--check`: valida tipos, evidência, pontos, limites, IDs e igualdade entre fontes revisadas e SQL gerado, sem sobrescrever a migração. O comando direto equivalente é `node scripts/build-curriculum-release.mjs --check`.

Migrações desta versão:

1. `20260830120000_add_curriculum_planning.sql`: cria a camada separada e suas políticas.
2. `20260830121000_import_curriculum_planning_v1.sql`: importa a versão de forma transacional e a ativa somente após reconciliação.

Confirme o projeto vinculado, o histórico remoto e a lista de migrações antes da escrita. Com autenticação autorizada para o projeto correto:

```powershell
npx.cmd supabase migration list --linked
npx.cmd supabase db push --linked --skip-vault --dry-run
npx.cmd supabase db push --linked --skip-vault
```

`--skip-vault` impede a atualização de segredos do Vault a partir do `config.toml`; não desativa validações nem RLS. Não acrescente `--include-all`, `--include-seed` ou `--include-roles` para contornar divergências de histórico. Pare e confira qualquer migração inesperada. Não registre credenciais em arquivos ou saídas.

A importação confere processo/período, hashes, conteúdo e contagens. Também compara as tabelas preexistentes protegidas antes/depois, abortando se editais, revistas, instituições, indexadores, regras científicas ou vínculos forem alterados. Após aplicar, confirme no banco: versão atual, hash, 41 regras, 7 processos e distribuição 31/10/0. Teste a interface autenticada e a rota direta; build local não comprova publicação remota.

Para verificar especificamente esta versão congelada, envie o arquivo inteiro em uma única chamada:

```powershell
npx.cmd supabase db query --linked --file scripts/verify-curriculum-planning.sql
```

O verificador usa transação somente leitura, identidades sintéticas locais e `ROLLBACK`. Confere RLS, permissões efetivas, metadados, vínculos e visibilidade: conta ativa lê 41 regras; pendente/bloqueada não lê nenhuma; anônimo não tem privilégio de leitura. Não altera contas nem acessa perfis ou credenciais. Não execute suas instruções separadamente em um cliente que ignore erros.

## Atualizações e recuperação

Não edite migrações já aplicadas, os dados congelados dessa versão nem seus hashes para incluir novas regras. Crie nova pasta de fontes, novo código de release e nova migração, mantendo as evidências e versões anteriores. O builder desta versão é fixado em suas fontes/data; executá-lo sem `--check` reescreve a migração e não é o caminho para uma atualização publicada.

Uma nova versão deve ser completa e reconciliada antes da troca transacional de `is_current`; o importador inicial deliberadamente bloqueia a substituição silenciosa de outra versão atual. Se for preciso reverter, publique uma migração explícita de seleção da versão anterior preservada, sem excluir o histórico. Valide novamente contagens, permissões e leitura pela aplicação.

## Estado operacional deste documento

Em 30/08/2026, as duas migrações foram aplicadas no Supabase vinculado e o verificador remoto passou. Permaneceram 242 editais, 2 revistas, 284 regras científicas, 413 instituições e 16 indexadores. O conjunto curricular tem 41 regras, sete processos e o hash indicado acima.

Também passaram 92 testes automatizados, o build e a verificação visual local dos filtros e cartões em desktop/celular. A publicação do frontend depende do envio ao GitHub, do workflow de deploy e da conferência da rota autenticada `/planejamento`; o registro dessas validações de banco/local não substitui a verificação final do site.
