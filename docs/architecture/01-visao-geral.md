# 01 - Visao Geral

## Stack adotada

- Backend: Laravel 13 (PHP 8.3).
- Frontend: React 19 + TypeScript + Inertia.js.
- Build: Vite 8 + `laravel-vite-plugin`.
- UI/Design System: Tailwind CSS v4 + shadcn/ui (estilo `new-york`) + Radix UI.
- Auth: Laravel Fortify com views Inertia.

## Fluxo tecnico principal

1. A requisicao chega no Laravel (`routes/web.php` e `routes/settings.php`).
2. Controller ou rota `Route::inertia()` retorna uma pagina Inertia.
3. `HandleInertiaRequests` compartilha props globais (`auth.user`, `name`, estado de sidebar).
4. No cliente, `resources/js/app.tsx` escolhe layout por nome da pagina:
   - `auth/*` -> `AuthLayout`
   - `settings/*` -> `AppLayout + SettingsLayout`
   - default -> `AppLayout`
5. React renderiza componentes e paginas com navegacao Inertia sem recarregar a pagina.

## Decisoes arquiteturais observadas

- Renderizacao mista com Inertia: backend controla roteamento HTTP e frontend controla UI.
- SSR habilitado em `config/inertia.php` (`ssr.enabled = true`).
- Tema (light/dark/system) persistido em `localStorage` e cookie (`appearance`) para SSR.
- Compartilhamento de estado global feito por middleware backend, nao por API separada.
- Convenioes de pasta no frontend por responsabilidade (pages, layouts, components, hooks, lib, types).

## Dependencias relevantes (resumo)

- PHP: `inertiajs/inertia-laravel`, `laravel/fortify`, `laravel/wayfinder`.
- JS: `@inertiajs/react`, `@inertiajs/vite`, `tailwindcss`, `sonner`, `lucide-react`.

## Scripts padrao

- Desenvolvimento full stack: `composer dev` (servidor Laravel + queue + Vite).
- Frontend local: `npm run dev`.
- Build: `npm run build`.
- Qualidade frontend: `npm run lint`, `npm run format`, `npm run types:check`.
- Qualidade backend: `composer lint` (Pint).
