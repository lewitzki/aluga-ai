# 08 - Admin upload e gestao de fotos

## Objetivo
Implementar upload e gerenciamento de imagens das ferramentas no armazenamento de midia.

## Escopo tecnico
- Integrar `Storage` do Laravel para upload.
- Criar relacao `Tool` x `ToolImage`.
- Definir regras de formato, tamanho e quantidade maxima de imagens.

## Criterios de aceitacao
- [x] Admin envia imagens validas e elas ficam vinculadas a ferramenta.
- [x] Admin pode remover/substituir imagens.
- [x] URLs de imagem sao servidas corretamente no catalogo e no detalhe.
- [x] Falhas de upload retornam mensagem amigavel e log tecnico.

## Dependencias
- `07-admin-crud-de-ferramentas.md`
