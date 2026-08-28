# Banco-de-editais

This template should help get you started developing with Vue 3 in Vite.

## Importação CSV

Administradores podem importar instituições, revistas, indexadores e editais juntos pela tela **Editais → Importar CSV**. O fluxo analisa e mostra um preview antes de qualquer escrita; a confirmação executa uma RPC transacional protegida por RLS e pela role administrativa. Consulte [a especificação do CSV](docs/importacao-csv.md) para as colunas, exemplos e regras de duplicação.

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

Administradores criam contas na tela de usuários. A Edge Function `admin-create-user` envia um convite para o e-mail informado e define a role exclusivamente em `app_metadata.role`. Ao abrir o link, a pessoa é direcionada para `/auth/confirm`, onde a sessão criada pelo Supabase é validada antes de permitir a definição da senha.

O cliente Supabase do projeto mantém `detectSessionInUrl` habilitado para processar o hash do fluxo de convite. A rota de ativação também aceita um `code` do fluxo PKCE quando recebido e o troca usando o cliente oficial do Supabase. Nenhum token é validado manualmente e nenhuma role é recebida ou alterada pelo frontend.

### Configuração local

O Vite deste projeto usa a porta padrão `5173`. A configuração local do Supabase já permite os redirects abaixo em `supabase/config.toml`:

```text
http://localhost:5173
http://localhost:5173/auth/confirm
http://127.0.0.1:5173/auth/confirm
```

Crie `supabase/functions/.env` a partir de `supabase/functions/.env.example` e mantenha o seguinte valor para a Edge Function local:

```dotenv
FRONTEND_URL=http://localhost:5173
```

Após alterar `supabase/config.toml`, reinicie a stack local do Supabase para aplicar as URLs.

### Configuração de produção

O domínio de produção não está configurado neste repositório. Substitua `<DOMINIO-DA-APLICACAO>` pelo domínio real, sempre com `https`.

1. Em **Authentication → URL Configuration** do Supabase, defina **Site URL** como `https://<DOMINIO-DA-APLICACAO>`.
2. Em **Redirect URLs**, inclua os valores exatos `https://<DOMINIO-DA-APLICACAO>/auth/confirm` e, se for testar a aplicação local contra o projeto hospedado, `http://localhost:5173/auth/confirm`.
3. Em **Edge Functions → Secrets**, configure `FRONTEND_URL=https://<DOMINIO-DA-APLICACAO>`. Alternativamente, use `npx supabase secrets set FRONTEND_URL=https://<DOMINIO-DA-APLICACAO>` no projeto vinculado.
4. Faça o deploy da Edge Function após publicar o código. `FRONTEND_URL` é uma configuração da função, não uma variável `VITE_*` e não é enviada ao navegador.

O `redirectTo` do convite é montado pela função com `FRONTEND_URL + /auth/confirm`. A URL precisa estar na lista de **Redirect URLs**; caso contrário, o Supabase ignora o `redirectTo` e usa a Site URL. Se o projeto tiver um template de e-mail de convite personalizado, mantenha `{{ .ConfirmationURL }}` para preservar esse redirecionamento.

### Como testar

1. Inicie o Vite com `npm run dev` e confirme que `FRONTEND_URL` aponta para `http://localhost:5173`.
2. Autentique-se com uma conta administradora e crie um usuário comum, deixando a opção **Administrador** desmarcada.
3. Abra o e-mail de convite e confirme que a URL chega em `/auth/confirm`; defina uma senha com pelo menos 6 caracteres e faça login com a nova conta. Ela não deve acessar as rotas administrativas.
4. Crie outro usuário marcando **Administrador**. Após definir a senha e entrar, a conta deve acessar as rotas administrativas.
5. Para validar erros, abra a rota `/auth/confirm` diretamente ou reutilize um link de convite já consumido. A aplicação deve informar que o link é inválido ou expirou. Para testar expiração, reduza temporariamente **Email OTP Expiration** no projeto de testes, envie um novo convite e aguarde o prazo antes de abri-lo.

Nenhuma secret key, `service_role` key ou credencial administrativa é adicionada ao frontend ou ao Git. As operações administrativas permanecem na Edge Function, que exige um JWT válido com `app_metadata.role === "admin"` e aceita somente as roles `user` e `admin`.
