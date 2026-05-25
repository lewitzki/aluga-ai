# Checklist de pronto — MVP Aluga AI

Use esta lista antes de demonstração ou deploy do MVP.

## Fluxos de negócio validados

- [ ] **Cliente:** registro/login → catálogo → empréstimo → pagamento mockado
- [ ] **Admin:** login → CRUD de ferramenta → painel operacional → painel financeiro
- [ ] **Erros:** autorização por perfil (403) e indisponibilidade/conflito de período cobertos por testes

## Comandos de qualidade

Execute na raiz do repositório:

```bash
# PHP — formatação e testes de feature/unit
composer lint
php artisan test

# Frontend — lint, tipos e build
npm run lint:check
npm run types:check
npm run build

# E2E — fluxos no navegador (migrate:fresh --seed + build automáticos no globalSetup)
npm run test:e2e
```

Atalho que combina lint PHP + testes:

```bash
composer test
```

CI local equivalente (lint JS + format + tipos + testes PHP):

```bash
composer ci:check
```

## Pré-requisitos locais

- PHP 8.3+, Composer, Node.js 20+
- Extensões PHP usuais do Laravel (pdo, mbstring, etc.)
- `.env` configurado (copiar de `.env.example` se necessário)
- `php artisan key:generate` e `php artisan migrate --seed` para ambiente de desenvolvimento
- Para E2E: Chromium do Playwright (`npx playwright install` na primeira execução)

## Critérios de aceite da task 16

| Critério | Cobertura |
|----------|-----------|
| Fluxo completo cliente | `tests/Feature/IntegratedClientFlowTest.php`, `e2e/client-full-flow.spec.ts` |
| Fluxo completo admin | `tests/Feature/IntegratedAdminFlowTest.php`, `e2e/admin-full-flow.spec.ts` |
| Erros de autorização e indisponibilidade | `tests/Feature/IntegratedErrorCasesTest.php` + testes de domínio existentes |
| Checklist com comandos de qualidade | Este documento |

## Observações para deploy

- Garantir `APP_ENV=production`, `APP_DEBUG=false` e credenciais seguras no `.env`
- Executar `php artisan config:cache`, `route:cache` e `view:cache` em produção
- Publicar assets com `npm run build` antes do deploy
- Configurar fila/cron se houver jobs assíncronos no futuro (MVP usa fluxo síncrono)
