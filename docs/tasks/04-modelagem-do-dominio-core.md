# 04 - Modelagem do dominio core

## Objetivo
Criar base de dados e modelos para `Tool`, `ToolImage`, `Rental`, `Payment` e `PaymentHistory`.

## Escopo tecnico
- Criar migrations com chaves estrangeiras, indices e constraints.
- Definir models Eloquent e relacionamentos.
- Padronizar enums/status de emprestimo e pagamento.

## Criterios de aceitacao
- [ ] Schema suporta todo fluxo C4 sem campos ambiguos.
- [ ] `Tool` pertence a um admin criador.
- [ ] `Rental` guarda inicio, fim previsto, fim real, status e valores.
- [ ] `Payment` e `PaymentHistory` registram tentativas e resultado final.

## Dependencias
- `03-autorizacao-por-perfil-admin-e-cliente.md`
