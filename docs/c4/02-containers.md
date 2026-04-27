# C2 - Diagrama de Containers

## Containers da Solucao

### 1) Frontend Web

- Interface para visitantes, clientes e admins.
- Exibe catalogo publico com filtros por preco, descricao e disponibilidade.
- Possui areas autenticadas separadas por perfil:
  - `Painel Cliente`
  - `Painel Admin`

### 2) Backend API / Aplicacao

- Regras de negocio de autenticacao, catalogo, emprestimos e relatorios financeiros.
- Validacao de permissoes (admin x cliente).
- Exposicao de endpoints para frontend.

### 3) Banco de Dados Relacional

- Persistencia de usuarios, perfis, ferramentas, emprestimos e pagamentos mockados.
- Guarda historico para consultas de admin e cliente.

### 4) Armazenamento de Midia

- Armazena imagens das ferramentas cadastradas pelo admin.

### 5) Modulo de Pagamento Mockado (interno)

- Simula transacoes com status (`approved`, `failed`, `pending`).
- Permite evolucao futura para gateway real sem mudar contratos principais do dominio.

## Relacao entre containers (visao textual C4)

```text
[Frontend Web]
  -> consome -> [Backend API / Aplicacao]

[Backend API / Aplicacao]
  -> le/escreve -> [Banco de Dados Relacional]
  -> envia/consulta arquivos -> [Armazenamento de Midia]
  -> solicita cobranca simulada -> [Modulo de Pagamento Mockado]
```

## Responsabilidades por area

- `Catalogo`: listagem publica, filtros, detalhes da ferramenta.
- `Emprestimos`: criacao, acompanhamento de prazo correndo, encerramento.
- `Financeiro`: total de ganhos do admin, totais pagos pelo cliente e historico.
- `Identidade e Acesso`: registro, login e autorizacao por perfil.
