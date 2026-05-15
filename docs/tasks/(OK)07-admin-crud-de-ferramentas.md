# 07 - Admin CRUD de ferramentas

## Objetivo
Permitir ao admin cadastrar, editar, visualizar e remover ferramentas do catalogo.

## Escopo tecnico
- Criar rotas protegidas para CRUD admin.
- Implementar Form Requests para validacao de entrada.
- Garantir ownership (admin so opera itens permitidos).

## Criterios de aceitacao
- [x] Admin cria ferramenta com nome, descricao, preco/hora e disponibilidade.
- [x] Admin edita dados sem quebrar historico de emprestimos.
- [x] Exclusao respeita regra de bloqueio quando houver emprestimo ativo.
- [x] Cliente nao consegue acessar operacoes de CRUD.

## Dependencias
- `04-modelagem-do-dominio-core.md`
- `03-autorizacao-por-perfil-admin-e-cliente.md`
