# 01 - Login e logout (admin e cliente)

## Objetivo
Implementar autenticacao de entrada e saida para usuarios `admin` e `cliente` com fluxo Inertia/Fortify.

## Escopo tecnico
- Ajustar login para reconhecer perfil do usuario.
- Garantir logout invalida sessao e token CSRF corretamente.
- Redirecionar pos-login conforme perfil.

## Criterios de aceitacao
- [ ] Usuario valido autentica com email/senha e acessa area correta.
- [ ] Usuario inativo/sem perfil permitido recebe erro claro.
- [ ] Logout encerra sessao e bloqueia acesso a rotas protegidas via back button.
- [ ] Fluxo funciona com middleware `auth` e `verified` ja existentes.

## Dependencias
- Nenhuma.