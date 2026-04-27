# C3 - Componentes (Backend API / Aplicacao)

## Componentes principais

### `AuthComponent`

- Registro e login para `admin` e `cliente`.
- Emissao e validacao de sessao/token.
- Garantia de permissao por perfil.

### `ToolCatalogComponent`

- Cadastro e manutencao de ferramentas pelo admin.
- Campos principais: nome, descricao, preco/hora, foto, disponibilidade.
- Busca/listagem publica com filtros.

### `RentalComponent`

- Criacao de emprestimo com validacao de disponibilidade por periodo.
- Controle de status (`scheduled`, `active`, `finished`, `late`).
- Calculo de tempo corrido e valor parcial/final.

### `PaymentMockComponent`

- Simulacao de pagamento no momento de fechamento do emprestimo.
- Registro de transacoes e retorno de status.
- Integracao desacoplada para troca futura por gateway real.

### `AdminDashboardComponent`

- Visao de:
  - ferramentas cadastradas
  - ferramentas disponiveis para alugar
  - ferramentas emprestadas com tempo corrido
  - ganho total acumulado

### `ClientDashboardComponent`

- Visao de:
  - emprestimos ativos com prazo correndo
  - total pago
  - historico de pagamentos
  - historico de ferramentas emprestadas

## Relacao entre componentes (visao textual C4)

```text
[AuthComponent] <-> [ToolCatalogComponent]
[AuthComponent] <-> [RentalComponent]
[RentalComponent] -> [PaymentMockComponent]
[AdminDashboardComponent] -> consulta -> [ToolCatalogComponent, RentalComponent, PaymentMockComponent]
[ClientDashboardComponent] -> consulta -> [RentalComponent, PaymentMockComponent]
```

## Entidades de dominio sugeridas

- `User` (com perfil `admin` ou `cliente`)
- `Tool`
- `ToolImage`
- `Rental`
- `Payment`
- `PaymentHistory`

## Decisoes para MVP

- Pagamento e mockado para acelerar validacao de fluxo.
- Controle de tempo do emprestimo prioriza simplicidade (inicio/fim previsto e status atual).
- Estrutura orientada a componentes para facilitar futura separacao em servicos.
