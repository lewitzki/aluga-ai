# Aluga AI

Aluga AI e uma aplicacao web para aluguel de ferramentas. O sistema permite que usuarios encontrem ferramentas disponiveis em um catalogo publico, solicitem emprestimos por periodo, acompanhem seus alugueis e cadastrem suas proprias ferramentas. Tambem existe uma area administrativa para gerenciamento de ferramentas, acompanhamento de emprestimos e visualizacao financeira.

O projeto foi desenvolvido com Laravel no backend e React com Inertia.js no frontend, mantendo uma experiencia de aplicacao moderna sem abrir mao da estrutura robusta do Laravel.

## Sumario

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Regras de negocio](#regras-de-negocio)
- [Requisitos](#requisitos)
- [Como instalar](#como-instalar)
- [Como utilizar](#como-utilizar)
- [Usuarios de teste](#usuarios-de-teste)
- [Comandos uteis](#comandos-uteis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Testes](#testes)

## Sobre o projeto

O Aluga AI centraliza o processo de aluguel de ferramentas em uma plataforma simples, com foco em:

- Exibir ferramentas em um catalogo publico.
- Permitir filtros por descricao, preco, disponibilidade e periodo.
- Permitir que clientes solicitem emprestimos de ferramentas.
- Evitar conflitos de agendamento para a mesma ferramenta.
- Registrar valores estimados e finais de aluguel.
- Simular pagamentos por meio de um gateway mock.
- Oferecer dashboards para clientes e administradores.

A aplicacao trabalha com dois perfis principais:

- **Cliente:** pode consultar o catalogo, solicitar emprestimos, encerrar emprestimos, acompanhar historico e cadastrar suas proprias ferramentas.
- **Administrador:** pode acessar dashboards administrativos, gerenciar suas ferramentas e acompanhar informacoes financeiras.

## Funcionalidades

### Catalogo publico

- Listagem publica de ferramentas.
- Visualizacao detalhada de uma ferramenta.
- Filtros por texto, faixa de preco, disponibilidade e periodo desejado.
- Exibicao de imagem principal da ferramenta quando cadastrada.

### Autenticacao e perfis

- Cadastro e login de usuarios via Laravel Fortify.
- Usuarios novos sao criados como perfil `cliente`.
- Separacao de acesso por perfil usando middleware.
- Suporte a recursos de seguranca como autenticacao de dois fatores.

### Area do cliente

- Dashboard com resumo de valores pagos e quantidade de ferramentas cadastradas.
- Listagem de emprestimos ativos/agendados/atrasados.
- Historico de emprestimos finalizados.
- Solicitacao de aluguel de ferramentas disponiveis.
- Encerramento de emprestimos com calculo do valor final.
- Cadastro, edicao e exclusao das proprias ferramentas.
- Upload e remocao de imagens das ferramentas.

### Area administrativa

- Dashboard com resumo de ferramentas cadastradas, disponiveis e emprestadas.
- Filtros por status de emprestimo, estado da ferramenta e busca textual.
- CRUD de ferramentas administradas pelo usuario admin.
- Upload e gerenciamento de imagens.
- Dashboard financeiro com pagamentos aprovados, pendentes e recusados.
- Filtros financeiros por status e periodo.

### Pagamentos

- Criacao de pagamento ao encerrar um emprestimo.
- Processamento simulado por gateway mock.
- Registro de historico de pagamento.
- Status possiveis: `pending`, `approved` e `failed`.
- Moeda padrao: `BRL`.

## Tecnologias

### Backend

- PHP 8.3+
- Laravel 13
- Laravel Fortify
- Inertia Laravel
- Laravel Wayfinder
- Eloquent ORM
- SQLite como banco padrao de desenvolvimento
- Pest para testes
- Laravel Pint para formatacao PHP

### Frontend

- React 19
- TypeScript
- Inertia.js
- Vite
- Tailwind CSS 4
- Radix UI
- Headless UI
- Lucide React
- Sonner
- ESLint
- Prettier
- Playwright para testes E2E

## Regras de negocio

### Usuarios e perfis

- O sistema possui os perfis `admin` e `cliente`.
- Todo novo usuario registrado pela tela publica recebe o perfil `cliente`.
- Rotas administrativas exigem usuario autenticado com perfil `admin`.
- Rotas do painel do cliente exigem usuario autenticado com perfil `cliente`.
- Um usuario so pode visualizar, editar ou excluir ferramentas das quais e proprietario.

### Ferramentas

- Uma ferramenta pertence a um usuario proprietario.
- Campos principais da ferramenta:
  - nome;
  - descricao;
  - valor por hora;
  - disponibilidade;
  - imagens.
- O valor por hora deve ser numerico, maior ou igual a zero e no maximo `999999.99`.
- A ferramenta pode estar operacionalmente em um dos estados:
  - `disponivel`: marcada como disponivel e sem emprestimo ativo/agendado;
  - `emprestada`: possui emprestimo ainda nao finalizado;
  - `indisponivel`: marcada como indisponivel pelo proprietario.
- Nao e permitido excluir ferramenta com emprestimo ativo, atrasado ou agendado.
- Ferramentas removidas usam soft delete.

### Imagens das ferramentas

- Cada ferramenta pode ter no maximo 10 imagens.
- Formatos aceitos: `jpeg`, `jpg`, `png` e `webp`.
- Cada imagem pode ter ate 5 MB.
- As imagens sao armazenadas no disco publico do Laravel.

### Emprestimos e alugueis

- Apenas clientes podem solicitar emprestimos pelo catalogo.
- A ferramenta precisa estar marcada como disponivel para receber uma solicitacao.
- O periodo do emprestimo exige data/hora inicial e data/hora final.
- A data/hora final deve ser posterior a data/hora inicial.
- O sistema bloqueia solicitacoes quando ja existe emprestimo nao finalizado que sobrepoe o mesmo periodo.
- Status de emprestimo:
  - `scheduled`: agendado;
  - `active`: ativo;
  - `finished`: finalizado;
  - `late`: encerrado com atraso.
- Ao criar o emprestimo, o sistema salva um snapshot do valor por hora da ferramenta.
- O valor estimado e calculado com base no periodo solicitado.
- O minimo faturavel e equivalente a 1 minuto.

### Encerramento e cobranca

- Um emprestimo so pode ser encerrado pelo cliente que o solicitou.
- Emprestimos ja finalizados nao podem ser encerrados novamente.
- Ao encerrar, o sistema calcula:
  - data/hora real de encerramento;
  - horas faturaveis;
  - valor final;
  - status final (`finished` ou `late`).
- Se o encerramento ocorrer depois da data/hora prevista, o status final fica `late`.
- O pagamento e criado ou atualizado no encerramento do emprestimo.
- O gateway de pagamento atual e simulado (`mock`) e pode retornar pagamento aprovado, recusado ou pendente conforme configuracao.

## Requisitos

Antes de iniciar, instale:

- PHP 8.3 ou superior
- Composer
- Node.js e npm
- SQLite

Opcionalmente, tambem e util ter:

- Git
- Extensoes PHP comuns usadas pelo Laravel, como `pdo`, `sqlite`, `mbstring`, `openssl`, `fileinfo` e `tokenizer`

## Como instalar

Clone o repositorio:

```bash
git clone https://github.com/seu-usuario/aluga-ai.git
cd aluga-ai
```

Instale as dependencias PHP:

```bash
composer install
```

Instale as dependencias JavaScript:

```bash
npm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell, se preferir:

```powershell
Copy-Item .env.example .env
```

Gere a chave da aplicacao:

```bash
php artisan key:generate
```

Crie o banco SQLite, caso ele ainda nao exista:

```bash
touch database/database.sqlite
```

No Windows PowerShell:

```powershell
New-Item -ItemType File -Path database/database.sqlite -Force
```

Confira no `.env` se o banco esta configurado como SQLite:

```env
DB_CONNECTION=sqlite
```

Execute as migrations e seeders:

```bash
php artisan migrate --seed
```

Crie o link simbolico para arquivos publicos:

```bash
php artisan storage:link
```

Inicie o ambiente de desenvolvimento:

```bash
composer run dev
```

Esse comando inicia os processos principais de desenvolvimento, incluindo o servidor Laravel, fila e Vite.

Acesse a aplicacao em:

```text
http://127.0.0.1:8000
```

## Como utilizar

### Navegacao publica

1. Acesse a pagina inicial.
2. Entre no catalogo de ferramentas.
3. Use os filtros para buscar por nome, descricao, preco, disponibilidade ou periodo.
4. Abra a pagina de detalhes de uma ferramenta para ver mais informacoes.

### Fluxo do cliente

1. Crie uma conta ou faca login com um usuario cliente.
2. Acesse o catalogo.
3. Escolha uma ferramenta disponivel.
4. Informe o periodo desejado para o emprestimo.
5. Envie a solicitacao.
6. Acompanhe o emprestimo no dashboard do cliente.
7. Ao finalizar o uso, encerre o emprestimo pelo painel.
8. O sistema calcula o valor final e processa o pagamento simulado.

O cliente tambem pode acessar a area "Minhas ferramentas" para cadastrar ferramentas proprias, editar dados, enviar imagens e remover ferramentas sem emprestimos em aberto.

### Fluxo do administrador

1. Faca login com um usuario admin.
2. Acesse o dashboard administrativo.
3. Consulte o resumo de ferramentas e emprestimos.
4. Gerencie ferramentas na area administrativa.
5. Acesse o painel financeiro para consultar pagamentos, valores aprovados e status das cobrancas.

## Usuarios de teste

Ao executar os seeders, o projeto cria usuarios de teste:

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | `admin@teste.local` | `password` |
| Cliente | `cliente@teste.local` | `password` |
| Cliente inativo | `inativo@teste.local` | `password` |
| Usuario sem perfil | `sem-perfil@teste.local` | `password` |

Tambem existe um comando para criar um admin inicial manualmente:

```bash
php artisan users:create-initial-admin "Nome Admin" "admin@email.com" "senha-segura"
```

Esse comando falha caso ja exista algum usuario admin cadastrado.

## Configuracao de pagamento

O projeto usa um gateway mock para simular cobrancas.

Variaveis opcionais no `.env`:

```env
PAYMENT_GATEWAY=mock
PAYMENT_MOCK_DEFAULT_STATUS=approved
```

Valores aceitos para `PAYMENT_MOCK_DEFAULT_STATUS`:

- `approved`
- `failed`
- `pending`

## Comandos uteis

Executar o ambiente de desenvolvimento:

```bash
composer run dev
```

Gerar build de producao:

```bash
npm run build
```

Rodar testes PHP:

```bash
php artisan test
```

Rodar a suite configurada no Composer:

```bash
composer test
```

Verificar formatacao PHP:

```bash
composer lint:check
```

Formatar codigo PHP:

```bash
composer lint
```

Verificar lint do frontend:

```bash
npm run lint:check
```

Formatar arquivos do frontend:

```bash
npm run format
```

Verificar tipos TypeScript:

```bash
npm run types:check
```

Rodar testes E2E:

```bash
npm run test:e2e
```

## Estrutura do projeto

```text
app/
  Console/Commands/        Comandos Artisan customizados
  Enums/                   Status de emprestimos e pagamentos
  Http/Controllers/        Controllers web
  Http/Middleware/         Middlewares de perfil e Inertia
  Http/Requests/           Validacoes de formularios
  Models/                  Models Eloquent
  Policies/                Regras de autorizacao
  Services/                Servicos de disponibilidade, cobranca e imagens

config/
  payment.php              Configuracao do gateway de pagamento

database/
  migrations/              Estrutura do banco de dados
  seeders/                 Dados iniciais e usuarios de teste

resources/js/
  components/              Componentes React reutilizaveis
  pages/                   Paginas Inertia
  routes/                  Rotas geradas pelo Wayfinder

routes/
  web.php                  Rotas principais da aplicacao

tests/
  Feature/                 Testes de funcionalidades principais
```

## Testes

O projeto possui testes de feature cobrindo fluxos como:

- Catalogo de ferramentas.
- CRUD administrativo de ferramentas.
- Upload e remocao de imagens.
- CRUD de ferramentas do cliente.
- Fluxo integrado administrativo.
- Fluxo integrado do cliente.

Para executar:

```bash
composer test
```

Para uma checagem mais completa de CI:

```bash
composer ci:check
```

## Observacoes para producao

Antes de publicar em producao, revise:

- Configuracao correta de `APP_ENV`, `APP_DEBUG` e `APP_URL`.
- Banco de dados definitivo, caso nao utilize SQLite.
- Configuracao de filas.
- Configuracao de storage publico.
- Gateway de pagamento real no lugar do mock.
- Politicas de seguranca para upload de arquivos.
- Build de assets com `npm run build`.

## Licenca

Este projeto esta sob a licenca MIT.
