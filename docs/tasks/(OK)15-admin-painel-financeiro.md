# 15 - Admin painel financeiro

## Objetivo
Disponibilizar visao financeira para admin com ganhos acumulados e historico de pagamentos.

## Escopo tecnico
- Criar agregacoes de receita por periodo.
- Exibir total acumulado e historico paginado.
- Permitir filtros por status de pagamento e intervalo de data.

## Criterios de aceitacao
- [ ] Admin visualiza ganho total baseado em pagamentos aprovados.
- [ ] Historico financeiro traz referencia de cliente, ferramenta e emprestimo.
- [ ] Filtros retornam valores consistentes com base de dados.
- [ ] Dados sensiveis nao sao expostos para cliente.

## Dependencias
- `13-pagamento-mockado-e-historico.md`
- `14-admin-painel-operacional.md`
