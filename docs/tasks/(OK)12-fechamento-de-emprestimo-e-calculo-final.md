# 12 - Fechamento de emprestimo e calculo final

## Objetivo
Encerrar emprestimo com calculo de valor final considerando periodo contratado e status.

## Escopo tecnico
- Implementar acao de fechamento de emprestimo.
- Calcular duracao efetiva e valor devido.
- Atualizar status (`finished` ou `late`) e registrar timestamps finais.

## Criterios de aceitacao
- [ ] Encerramento define fim real do emprestimo.
- [ ] Valor final e calculado de forma deterministica e auditavel.
- [ ] Emprestimo atrasado muda status corretamente.
- [ ] Fluxo prepara dados para pagamento mockado.

## Dependencias
- `11-cliente-painel-de-emprestimos-e-historico.md`
