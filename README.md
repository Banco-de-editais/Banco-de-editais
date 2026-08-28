# Banco-de-editais

This template should help get you started developing with Vue 3 in Vite.

## Importação CSV

Administradores podem importar instituições, revistas, indexadores e editais juntos pela tela **Editais → Importar CSV**. O fluxo analisa e mostra um preview antes de qualquer escrita; a confirmação executa uma RPC transacional protegida por RLS e pela role administrativa. Consulte [a especificação do CSV](docs/importacao-csv.md) para as colunas, exemplos e regras de duplicação.

A carga auditada da planilha CORE v2.3 usa uma projeção separada, com vínculos institucionais, regras científicas, incertezas e rastreabilidade. Consulte [a especificação da importação CORE v2.3](docs/importacao-core-v2-3.md). Ela não cria revistas sem nome, ISSN e Qualis comprovados.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Convites e ativação de conta

Administradores criam contas na tela de usuários, que também lista todas as contas sem expor dados sensíveis de autenticação. A Edge Function `admin-create-user` envia um convite para o e-mail informado e define a role exclusivamente em `app_metadata.role`.

O Supabase cria uma sessão temporária ao abrir um convite. Para que ela não seja confundida com uma sessão de acesso, a conta é criada com `app_metadata.account_status = pending`. Enquanto estiver pendente, ela não pode acessar rotas, dados protegidos por RLS ou operações administrativas. A Edge Function `activate-invited-user` recebe a nova senha, aplica a política de senha e muda o status para `active` na mesma operação administrativa. Só então o cliente renova a sessão e libera o acesso.

O cliente Supabase do projeto mantém `detectSessionInUrl` habilitado para processar o hash do fluxo de convite. A rota de ativação também aceita um `code` do fluxo PKCE quando recebido e o troca usando o cliente oficial do Supabase. Nenhum token é validado manualmente e nenhuma role, status de ativação ou credencial administrativa é recebida ou alterada pelo frontend.

### Configuração local

O Vite deste projeto usa a porta padrão `5173`. A configuração local do Supabase já define a **Site URL** como a origem da aplicação e permite os redirects abaixo em `supabase/config.toml`:

```text
http://localhost:5173
http://localhost:5173/auth/confirm
http://127.0.0.1:5173/auth/confirm
```

Após alterar `supabase/config.toml`, reinicie a stack local do Supabase para aplicar as URLs.

### Configuração de produção

O domínio de produção não está configurado neste repositório. Substitua `<DOMINIO-DA-APLICACAO>` pelo domínio real, sempre com `https`.

1. Em **Authentication → URL Configuration** do Supabase, defina **Site URL** como `https://<DOMINIO-DA-APLICACAO>`.
2. Em **Redirect URLs**, inclua `https://<DOMINIO-DA-APLICACAO>/auth/confirm` e, se for testar a aplicação local contra o projeto hospedado, `http://localhost:5173/auth/confirm`.
3. Faça o deploy das Edge Functions após publicar o código. Nenhuma variável ou secret adicional é necessária para os convites.

Também configure em **Authentication → Providers → Email**:

1. Desative novos cadastros públicos por e-mail; as contas devem ser criadas somente por administradores.
2. Defina o tamanho mínimo da senha como `12` e exija letras maiúsculas, minúsculas e números.

Por fim, publique a migração e as três funções: `admin-create-user`, `activate-invited-user` e `admin-list-users`. A migração marca contas existentes com senha como ativas e restringe as políticas de leitura a contas ativas. Após a publicação, usuários já logados devem entrar novamente uma vez para receber o novo claim de ativação no JWT.

```sh
npx supabase db push
npx supabase functions deploy admin-create-user
npx supabase functions deploy activate-invited-user
npx supabase functions deploy admin-list-users
```

O convite usa a **Site URL** configurada no Supabase, sem `redirectTo` ou variável de ambiente na Edge Function. Ao chegar à origem da aplicação, uma conta pendente é encaminhada automaticamente para `/auth/confirm`. Se o projeto tiver um template de e-mail de convite personalizado, mantenha `{{ .ConfirmationURL }}` para preservar esse redirecionamento.

### Como testar

1. Inicie o Vite com `npm run dev` e confirme que a Site URL local é `http://localhost:5173`.
2. Autentique-se com uma conta administradora e crie um usuário comum, deixando a opção **Administrador** desmarcada.
3. Abra o e-mail de convite e confirme que a URL chega em `/auth/confirm`. Antes de definir a senha, tente acessar `/`: a aplicação deve redirecionar para o login e as consultas ao banco devem ser negadas por RLS. Defina uma senha de 12 caracteres ou mais, com maiúsculas, minúsculas e números, e então faça login com a nova conta. Ela não deve acessar as rotas administrativas.
4. Crie outro usuário marcando **Administrador**. Após definir a senha e entrar, a conta deve acessar as rotas administrativas.
5. Para validar erros, abra a rota `/auth/confirm` diretamente ou reutilize um link de convite já consumido. A aplicação deve informar que o link é inválido ou expirou. Para testar expiração, reduza temporariamente **Email OTP Expiration** no projeto de testes, envie um novo convite e aguarde o prazo antes de abri-lo.

Nenhuma secret key, `service_role` key ou credencial administrativa é adicionada ao frontend ou ao Git. As operações administrativas permanecem nas Edge Functions, que exigem um JWT válido com `app_metadata.role === "admin"` e `account_status === "active"`; somente as roles `user` e `admin` são aceitas.
