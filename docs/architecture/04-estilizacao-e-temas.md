# 04 - Estilizacao e Temas

## Base de estilo

- Arquivo central: `resources/css/app.css`.
- Tailwind CSS v4 com sintaxe `@theme` e tokens via CSS variables.
- Plugin `tw-animate-css` para animacoes utilitarias.

## Tokens de design

O projeto mapeia variaveis de tema para tokens utilitarios:

- cores base (`background`, `foreground`, `primary`, `secondary`, etc.)
- tokens de interface (`border`, `input`, `ring`)
- tokens de graficos (`chart-1` a `chart-5`)
- tokens de sidebar (`sidebar-*`)
- escalas de radius (`sm`, `md`, `lg` derivadas de `--radius`)

## Estrategia de tema (light/dark/system)

- Estado de tema gerenciado em `resources/js/hooks/use-appearance.tsx`.
- Persistencia em:
  - `localStorage` (cliente)
  - cookie `appearance` (backend/SSR)
- Tema aplicado no `document.documentElement`:
  - classe `dark`
  - `color-scheme` (`light` ou `dark`)
- Mudanca de tema do sistema operacional e observada com `matchMedia`.

## Design system e componentes

- shadcn/ui configurado em `components.json`:
  - estilo `new-york`
  - `cssVariables: true`
  - base em `resources/css/app.css`
- Primitivos acessiveis com Radix UI.
- Utilitarios de classe com `clsx` + `tailwind-merge`.

## Qualidade e padrao visual

- Prettier com `prettier-plugin-tailwindcss` para ordenar classes.
- ESLint aplicado no frontend com regras de estilo e importacao.
