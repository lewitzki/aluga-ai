# 03 - Frontend Inertia + React

## Bootstrap da aplicacao

Arquivo de entrada: `resources/js/app.tsx`.

Responsabilidades atuais:

- Inicializa Inertia (`createInertiaApp`).
- Define titulo da pagina com `VITE_APP_NAME`.
- Resolve layout por convencao de nome de pagina.
- Injeta providers globais (`TooltipProvider`, `Toaster`).
- Configura barra de progresso do Inertia.
- Inicializa tema com `initializeTheme()`.

## Organizacao frontend

- `resources/js/pages`: paginas Inertia (rotas visuais).
- `resources/js/layouts`: layouts compostos (auth, app, settings).
- `resources/js/components`: componentes reutilizaveis.
- `resources/js/components/ui`: base de design system (shadcn/Radix).
- `resources/js/hooks`: hooks de comportamento e estado.
- `resources/js/lib`: utilitarios (ex.: `cn`, helpers de URL).
- `resources/js/types`: tipos compartilhados.

## Convencao de layouts em runtime

- `welcome` sem layout.
- Paginas `auth/*` usam `AuthLayout`.
- Paginas `settings/*` usam layout composto (`AppLayout` + `SettingsLayout`).
- Demais paginas usam `AppLayout`.

## Navegacao e composicao

- Navegacao principal e de settings via componentes dedicados (`nav-*`, `app-*`).
- Breadcrumbs e estrutura de shell reutilizaveis.
- Inertia Link usado para navegacao SPA-like mantendo semantica web.

## Tooling e build frontend

- `vite.config.ts` com plugins:
  - `laravel-vite-plugin`
  - `@inertiajs/vite`
  - `@vitejs/plugin-react` com `babel-plugin-react-compiler`
  - `@tailwindcss/vite`
  - `@laravel/vite-plugin-wayfinder`

## Tipagem e aliases

- TypeScript em modo estrito (`strict`, `noImplicitAny`).
- Alias `@/* -> resources/js/*` definido em `tsconfig.json`.
- Alias de componentes/hook tambem presentes em `components.json` (shadcn).
