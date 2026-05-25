# 16 - Testes integrados e criterios de pronto

## Objetivo
Consolidar qualidade do MVP com testes ponta-a-ponta dos fluxos principais de negocio.

## Escopo tecnico
- Cobrir fluxos criticos com testes de feature Laravel.
- Validar caminhos principais no frontend (Inertia + UI states).
- Definir checklist de pronto para demonstracao e deploy.

## Criterios de aceitacao
- [x] Fluxo completo cliente: registro/login -> catalogo -> emprestimo -> pagamento mockado.
- [x] Fluxo completo admin: login -> CRUD ferramenta -> painel operacional/financeiro.
- [x] Casos de erro de autorizacao e indisponibilidade possuem teste.
- [x] Checklist final inclui comandos de qualidade (`npm run lint`, `npm run types:check`, `composer lint`, testes).

## Dependencias
- `01` ate `15` concluidas.

## Entregaveis
- `tests/Feature/IntegratedClientFlowTest.php`
- `tests/Feature/IntegratedAdminFlowTest.php`
- `tests/Feature/IntegratedErrorCasesTest.php`
- `e2e/client-full-flow.spec.ts`
- `e2e/admin-full-flow.spec.ts`
- `docs/checklist-pronto-mvp.md`
