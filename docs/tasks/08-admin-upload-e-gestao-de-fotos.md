# 08 - Admin upload e gestao de fotos

## Objetivo
Implementar upload e gerenciamento de imagens das ferramentas no armazenamento de midia.

## Escopo tecnico
- Integrar `Storage` do Laravel para upload.
- Criar relacao `Tool` x `ToolImage`.
- Definir regras de formato, tamanho e quantidade maxima de imagens.

## Criterios de aceitacao
- [ ] Admin envia imagens validas e elas ficam vinculadas a ferramenta.
- [ ] Admin pode remover/substituir imagens.
- [ ] URLs de imagem sao servidas corretamente no catalogo e no detalhe.
- [ ] Falhas de upload retornam mensagem amigavel e log tecnico.

## Dependencias
- `07-admin-crud-de-ferramentas.md`
