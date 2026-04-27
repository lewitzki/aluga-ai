# Backlog de Implementacao do MVP

Fontes utilizadas:
- `docs/c4/README.md`
- `docs/c4/01-contexto.md`
- `docs/c4/02-containers.md`
- `docs/c4/03-componentes.md`
- `docs/architecture/README.md`
- `docs/architecture/01-visao-geral.md`
- `docs/architecture/02-backend-laravel.md`
- `docs/architecture/03-frontend-inertia-react.md`
- `docs/architecture/04-estilizacao-e-temas.md`
- `docs/architecture/05-organizacao-de-pastas.md`

Data de geracao: 2026-04-26

## Ordem priorizada de tarefas

1. [01-login-e-logout-admin-e-cliente.md](./01-login-e-logout-admin-e-cliente.md)
2. [02-registro-admin-e-cliente-com-perfis.md](./02-registro-admin-e-cliente-com-perfis.md)
3. [03-autorizacao-por-perfil-admin-e-cliente.md](./03-autorizacao-por-perfil-admin-e-cliente.md)
4. [04-modelagem-do-dominio-core.md](./04-modelagem-do-dominio-core.md)
5. [05-catalogo-publico-de-ferramentas-com-filtros.md](./05-catalogo-publico-de-ferramentas-com-filtros.md)
6. [06-pagina-publica-de-detalhe-da-ferramenta.md](./06-pagina-publica-de-detalhe-da-ferramenta.md)
7. [07-admin-crud-de-ferramentas.md](./07-admin-crud-de-ferramentas.md)
8. [08-admin-upload-e-gestao-de-fotos.md](./08-admin-upload-e-gestao-de-fotos.md)
9. [09-cliente-solicitacao-de-emprestimo.md](./09-cliente-solicitacao-de-emprestimo.md)
10. [10-validacao-de-disponibilidade-por-periodo.md](./10-validacao-de-disponibilidade-por-periodo.md)
11. [11-cliente-painel-de-emprestimos-e-historico.md](./11-cliente-painel-de-emprestimos-e-historico.md)
12. [12-fechamento-de-emprestimo-e-calculo-final.md](./12-fechamento-de-emprestimo-e-calculo-final.md)
13. [13-pagamento-mockado-e-historico.md](./13-pagamento-mockado-e-historico.md)
14. [14-admin-painel-operacional.md](./14-admin-painel-operacional.md)
15. [15-admin-painel-financeiro.md](./15-admin-painel-financeiro.md)
16. [16-testes-integrados-e-criterios-de-pronto.md](./16-testes-integrados-e-criterios-de-pronto.md)

## Observacoes de priorizacao

- Autenticacao e perfis vem primeiro para habilitar ownership e permissoes.
- Modelagem de dominio vem antes dos CRUDs para evitar retrabalho de schema.
- Catalogo publico precede fluxo de emprestimo para garantir descoberta.
- Fluxo transacional de emprestimo/pagamento antecede dashboards consolidados.
- Testes integrados fecham o ciclo para garantir entrega pronta para demonstracao.
# Backlog Tecnico Derivado do C4

## Fontes de arquitetura utilizadas

- `docs/c4/README.md`
- `docs/c4/01-contexto.md`
- `docs/c4/02-containers.md`
- `docs/c4/03-componentes.md`
- `docs/architecture/README.md`
- `docs/architecture/01-visao-geral.md`
- `docs/architecture/02-backend-laravel.md`
- `docs/architecture/03-frontend-inertia-react.md`
- `docs/architecture/04-estilizacao-e-temas.md`
- `docs/architecture/05-organizacao-de-pastas.md`

## Data de geracao

- 2026-04-26

## Premissas consideradas

- O projeto atual parte de um starter Laravel + Inertia + React com autenticacao Fortify ja funcional.
- O dominio de negocio (ferramentas, emprestimos, pagamentos, dashboards de negocio) ainda precisa ser implementado.
- Todas as tarefas abaixo seguem os padroes de pasta, tipagem, middleware, qualidade e stack ja adotados no repositorio.

## Containers e arquivos de tarefas

- Frontend Web: `docs/tasks/frontend-web.md`
- Backend API / Aplicacao: `docs/tasks/backend-api-aplicacao.md`
- Banco de Dados Relacional: `docs/tasks/banco-de-dados-relacional.md`
- Armazenamento de Midia: `docs/tasks/armazenamento-de-midia.md`
- Modulo de Pagamento Mockado: `docs/tasks/modulo-de-pagamento-mockado.md`
