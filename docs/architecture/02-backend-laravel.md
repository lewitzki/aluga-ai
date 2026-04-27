# 02 - Backend Laravel

## Estrutura backend (atual)

- `bootstrap/app.php`: bootstrap da app, roteamento e pipeline de middleware.
- `app/Http/Controllers`: controladores HTTP.
- `app/Http/Middleware`: middlewares de integracao com Inertia e tema.
- `app/Http/Requests`: validacao de entrada por contexto.
- `app/Providers`: defaults globais e configuracao de Fortify.
- `routes/*.php`: definicao de endpoints web.
- `config/*.php`: configuracao de infraestrutura e bibliotecas.

## Middleware e dados compartilhados

### `HandleInertiaRequests`

Compartilha dados globais para todas as paginas Inertia:

- `name` com `config('app.name')`
- `auth.user`
- `sidebarOpen` via cookie `sidebar_state`

### `HandleAppearance`

- Compartilha `appearance` em todas as views usando cookie `appearance` (fallback `system`).
- Cookie `appearance` e `sidebar_state` ficam fora da criptografia de cookies para leitura pelo cliente.

## Rotas atuais

### `routes/web.php`

- Home publica (`/`) via `Route::inertia('welcome')`.
- Dashboard protegido por `auth` + `verified`.

### `routes/settings.php`

- Grupo autenticado para perfil.
- Grupo autenticado e verificado para:
  - delete de perfil
  - seguranca
  - alteracao de senha (throttle `6,1`)
  - pagina de aparencia (`settings/appearance`)

## Autenticacao e seguranca

- Fortify configurado em `config/fortify.php` com:
  - registro
  - reset de senha
  - verificacao de email
  - 2FA com confirmacao e confirmacao de senha
- `FortifyServiceProvider` aponta views para paginas Inertia (`auth/*`).
- Rate limiting configurado para login e two-factor.
- `AppServiceProvider` define:
  - datas imutaveis (`CarbonImmutable`)
  - bloqueio de comandos destrutivos em producao
  - politica forte de senha em producao

## Padrao de camada HTTP

- Controllers enxutos para orquestrar fluxo.
- Regras de validacao em Form Requests por contexto.
- Feedback para UI via `Inertia::flash(...)` (ex.: toasts em sucesso).
