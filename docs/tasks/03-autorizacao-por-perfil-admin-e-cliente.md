# 03 - Autorizacao por perfil (admin x cliente)

## Objetivo
Aplicar controle de acesso por papel para separar claramente area administrativa e area do cliente.

## Escopo tecnico
- Criar middleware/policies para regras por perfil.
- Organizar grupos de rotas por contexto: publico, cliente autenticado, admin autenticado.
- Expor capacidade de acesso no frontend para navegacao condicional.

## Criterios de aceitacao
- [ ] Rotas de admin retornam 403 para clientes.
- [ ] Rotas de cliente retornam 403 para admins quando necessario.
- [ ] Menus e links exibem apenas opcoes permitidas.
- [ ] Cobertura minima com testes de autorizacao.

## Dependencias
- `02-registro-admin-e-cliente-com-perfis.md`
