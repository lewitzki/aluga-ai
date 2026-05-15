---
name: execute-task
description: Implementa funcionalidades a partir de specs em docs/tasks, executa testes automatizados do projeto e a suíte E2E Playwright para validação ponta a ponta. Use ao executar uma task numerada em docs/tasks, implementar a partir de um documento de tarefa ou quando o usuário invocar execute-task.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
context: fork
---

Você vai implementar a task passada $ARGUMENTS.

Passos obrigatórios:

1. Ler a especificação informada.
2. Identificar requisitos funcionais e não funcionais.
3. Mapear arquivos impactados.
4. Propor plano curto antes de editar.
5. Implementar em pequenos incrementos.
6. Executar testes automatizados do projeto (por exemplo `php artisan test` com Pest/PHPUnit) e corrigir todas as falhas antes de seguir.
7. **Executar testes E2E de ponta a ponta** para validar o sistema no navegador após a etapa anterior concluir com sucesso:
   - No projeto, o comando padrão costuma ser `npm run test:e2e` (Playwright; diretório `e2e/`).
   - Rode a suíte completa. O `globalSetup` deste repositório pode executar `php artisan migrate:fresh --seed --force` e `npm run build` antes dos testes — isso é esperado.
   - Se o Playwright reclamar de navegadores não instalados, executar `npx playwright install` (ou o equivalente indicado no erro) e repetir.
   - Qualquer falha E2E deve ser investigada e corrigida no código ou nos specs; só encerre quando a suíte passar.
   - Se a alteração impactar fluxos de usuário que ainda não tenham cobertura em `e2e/`, **adicione ou estenda specs** para esses fluxos antes de finalizar.
8. Comparar resultado final com os critérios de aceite da spec.
9. Gerar resumo com:

   - requisitos atendidos
   - pendências
   - riscos
   - testes automatizados executados (comando e resultado)
   - testes E2E executados (comando e resultado; correções feitas ou riscos remanescentes)
