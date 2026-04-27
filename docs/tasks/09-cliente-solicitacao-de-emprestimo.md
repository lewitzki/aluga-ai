# 09 - Cliente solicitacao de emprestimo

## Objetivo
Permitir ao cliente autenticado abrir uma solicitacao de emprestimo com periodo definido.

## Escopo tecnico
- Criar formulario de solicitacao (inicio e fim previsto).
- Criar endpoint de criacao de `Rental` para cliente.
- Definir status inicial (`scheduled` ou equivalente).

## Criterios de aceitacao
- [ ] Cliente autenticado consegue solicitar emprestimo de ferramenta elegivel.
- [ ] Visitante anonimo e redirecionado para login ao tentar emprestar.
- [ ] Solicitacao invalida (datas inconsistentes) retorna erro de validacao.
- [ ] Emprestimo criado fica associado ao cliente e ferramenta.

## Dependencias
- `06-pagina-publica-de-detalhe-da-ferramenta.md`
- `04-modelagem-do-dominio-core.md`
