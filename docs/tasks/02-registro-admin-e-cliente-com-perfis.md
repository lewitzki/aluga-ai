# 02 - Registro (admin e cliente) com perfis

## Objetivo
Permitir criacao de contas com papel de acesso (`admin` ou `cliente`) mantendo compatibilidade com Fortify.

## Escopo tecnico
- Criar estrategia de perfil no dominio (`users.role` ou tabela de perfis).
- Definir fluxo de registro para cliente e bootstrap de admin inicial (seed/command).
- Validar regras de unicidade e seguranca de senha.

## Criterios de aceitacao
- [ ] Registro de cliente cria usuario com perfil correto.
- [ ] Existe caminho controlado para criar admin inicial.
- [ ] Perfil fica persistido e disponivel em `auth.user` compartilhado pelo Inertia.
- [ ] Fluxo respeita verificacao de email quando habilitada.

## Dependencias
- `01-login-e-logout-admin-e-cliente.md`
