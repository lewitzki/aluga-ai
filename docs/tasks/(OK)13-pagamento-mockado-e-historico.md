# 13 - Pagamento mockado e historico

## Objetivo
Executar cobranca simulada no fechamento do emprestimo e persistir historico completo.

## Escopo tecnico
- Criar `PaymentMockComponent`/service interno com status `approved`, `failed`, `pending`.
- Registrar transacao principal e historico de tentativas.
- Integrar pagamento ao fluxo de fechamento de emprestimo.

## Criterios de aceitacao
- [ ] Todo fechamento gera tentativa de pagamento mockado.
- [ ] Resultado e salvo em `payments` e `payment_histories`.
- [ ] Emprestimo pago altera estado financeiro conforme status aprovado.
- [ ] Contrato de integracao fica desacoplado para troca futura de gateway.

## Dependencias
- `12-fechamento-de-emprestimo-e-calculo-final.md`
