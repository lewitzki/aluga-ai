# C1 - Diagrama de Contexto

## Objetivo

Plataforma web para emprestimo de ferramentas por tempo determinado, com duas areas principais:

- `Area Publica/Cliente`: navegacao no catalogo, emprestimo, pagamento mockado e acompanhamento.
- `Area Admin`: cadastro/gestao de ferramentas, monitoramento de emprestimos e ganhos.

## Atores

- `Visitante`: visualiza lista publica e filtros.
- `Cliente`: autentica, solicita emprestimo, realiza pagamento mockado e acompanha historico.
- `Admin`: autentica, cadastra ferramentas, acompanha emprestimos ativos e ganhos.

## Sistemas Externos

- `Servico de Autenticacao` (interno ao sistema, mas representado como dependencia de seguranca): login/registro e controle de perfil.
- `Servico de Pagamento Mockado`: simulacao de autorizacao/captura de pagamento para o MVP.
- `Servico de Armazenamento de Midia`: armazenamento de fotos das ferramentas.

## Contexto (visao textual C4)

```text
[Visitante] --> visualiza catalogo publico --> [Plataforma de Emprestimo]
[Cliente] --> login / emprestar / pagar mock / acompanhar --> [Plataforma de Emprestimo]
[Admin] --> login / cadastrar ferramenta / monitorar ganhos --> [Plataforma de Emprestimo]

[Plataforma de Emprestimo] --> autentica usuarios --> [Servico de Autenticacao]
[Plataforma de Emprestimo] --> simula pagamentos --> [Servico de Pagamento Mockado]
[Plataforma de Emprestimo] --> salva e recupera fotos --> [Servico de Armazenamento de Midia]
```

## Regras de negocio principais

- Emprestimo sempre possui `inicio`, `fim previsto` e status de acompanhamento de tempo.
- Apenas usuarios autenticados podem concluir emprestimo.
- Ferramentas com emprestimo ativo nao devem ficar disponiveis para novo emprestimo no mesmo periodo.
- Ganho da plataforma/admin e baseado em emprestimos pagos (mockados no MVP).
