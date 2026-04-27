# 05 - Organizacao de Pastas e Convencoes

## Visao de pastas (raiz)

```text
app/            # Dominio HTTP, providers, models e regras de backend
bootstrap/      # Bootstrap da aplicacao Laravel
config/         # Configuracoes por contexto
database/       # Migrations, seeders e factories
public/         # Assets publicos e ponto de entrada web
resources/      # Frontend (React/Inertia), CSS e views
routes/         # Rotas web/console
storage/        # Arquivos gerados e cache local
tests/          # Testes de feature/unidade
docs/           # Documentacao (C4 e arquitetura detalhada)
```

## Convencoes de backend

- Controllers por dominio em `app/Http/Controllers/*`.
- Validacoes encapsuladas em `app/Http/Requests/*`.
- Middleware para preocupacoes transversais (tema, props Inertia).
- Providers para defaults globais e integracoes framework.

## Convencoes de frontend

- `pages/`: cada pagina corresponde a uma view Inertia.
- `layouts/`: cascas de pagina e composicao de estrutura.
- `components/`: reutilizacao de UI e blocos funcionais.
- `components/ui/`: primitives e wrappers do design system.
- `hooks/`: logica reutilizavel sem acoplamento visual.
- `types/`: contratos TS compartilhados.
- `lib/`: funcoes utilitarias puras.

## Convencoes de qualidade

- Formato: Prettier (`singleQuote`, `semi`, `printWidth: 80`).
- Lint: ESLint + React Hooks + TypeScript + regras de import.
- PHP style: Laravel Pint.
- Tipagem frontend em modo estrito.

## Como manter essa organizacao

- Novas features devem seguir separacao por responsabilidade.
- Evitar regra de negocio em componentes de UI.
- Reaproveitar `components/ui` antes de criar variacoes novas.
- Toda mudanca estrutural relevante deve atualizar `docs/architecture`.
