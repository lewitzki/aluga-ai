# 10 - Validacao de disponibilidade por periodo

## Objetivo
Garantir que uma ferramenta nao seja emprestada em periodos sobrepostos.

## Escopo tecnico
- Implementar servico/regra de conflito de agenda de emprestimos.
- Bloquear criacao/confirmacao quando houver sobreposicao.
- Refletir indisponibilidade no catalogo com base em intervalo informado.

## Criterios de aceitacao
- [ ] Emprestimo sobreposto e recusado com mensagem clara.
- [ ] Emprestimos sem conflito sao aceitos.
- [ ] Testes cobrem cenarios de borda (inicio/fim iguais, intervalos adjacentes).
- [ ] Regra centralizada para reuso por API e UI.

## Dependencias
- `09-cliente-solicitacao-de-emprestimo.md`
