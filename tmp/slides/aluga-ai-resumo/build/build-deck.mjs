import PptxGenJS from "pptxgenjs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "outputs");
const OUT_FILE = join(OUT_DIR, "output.pptx");

const C = {
  primary: "1E3A5F",
  accent: "2563EB",
  accent2: "0EA5E9",
  dark: "0F172A",
  muted: "64748B",
  light: "F8FAFC",
  white: "FFFFFF",
  success: "16A34A",
  warning: "D97706",
};

const FONT = { title: "Segoe UI", body: "Segoe UI" };

function addHeader(slide, title, subtitle) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 1.05,
    fill: { color: C.primary },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.18,
    w: 9,
    h: 0.55,
    fontFace: FONT.title,
    fontSize: 24,
    bold: true,
    color: C.white,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.68,
      w: 9,
      h: 0.28,
      fontFace: FONT.body,
      fontSize: 11,
      color: "CBD5E1",
    });
  }
}

function addFooter(slide, text) {
  slide.addShape("rect", {
    x: 0,
    y: 5.35,
    w: 10,
    h: 0.25,
    fill: { color: C.light },
  });
  slide.addText(text, {
    x: 0.5,
    y: 5.38,
    w: 9,
    h: 0.2,
    fontFace: FONT.body,
    fontSize: 9,
    color: C.muted,
  });
}

function addBullets(slide, items, opts = {}) {
  const {
    x = 0.55,
    y = 1.25,
    w = 8.9,
    h = 3.85,
    fontSize = 14,
    color = C.dark,
    lineSpacing = 22,
  } = opts;
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    {
      x,
      y,
      w,
      h,
      fontFace: FONT.body,
      fontSize,
      color,
      valign: "top",
      paraSpaceAfter: 6,
      lineSpacing,
    },
  );
}

function addCard(slide, { x, y, w, h, title, lines, fill = C.white, accent = C.accent }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });
  slide.addShape("rect", {
    x,
    y,
    w: 0.08,
    h,
    fill: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.12,
    w: w - 0.35,
    h: 0.35,
    fontFace: FONT.title,
    fontSize: 13,
    bold: true,
    color: C.primary,
  });
  slide.addText(lines.join("\n"), {
    x: x + 0.2,
    y: y + 0.48,
    w: w - 0.35,
    h: h - 0.6,
    fontFace: FONT.body,
    fontSize: 10.5,
    color: C.dark,
    valign: "top",
    lineSpacing: 14,
  });
}

function addTechTable(slide, rows, opts = {}) {
  const { x = 0.55, y = 1.25, w = 8.9 } = opts;
  const tableRows = [
    [
      { text: "Tecnologia", options: { bold: true, fill: { color: C.primary }, color: C.white } },
      { text: "Versão / Uso", options: { bold: true, fill: { color: C.primary }, color: C.white } },
    ],
    ...rows.map(([tech, uso], i) => [
      { text: tech, options: { fill: { color: i % 2 ? C.light : C.white }, bold: true, color: C.primary } },
      { text: uso, options: { fill: { color: i % 2 ? C.light : C.white }, color: C.dark } },
    ]),
  ];
  slide.addTable(tableRows, {
    x,
    y,
    w,
    colW: [2.2, 6.7],
    fontFace: FONT.body,
    fontSize: 11,
    border: { type: "solid", color: "E2E8F0", pt: 0.5 },
    autoPage: false,
  });
}

async function build() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Aluga AI";
  pptx.title = "Aluga AI — Resumo Detalhado do Projeto";
  pptx.subject = "TCC — Plataforma de aluguel de ferramentas";

  // Slide 1 — Capa
  {
    const s = pptx.addSlide();
    s.background = { color: C.primary };
    s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.primary } });
    s.addShape("rect", { x: 0, y: 4.2, w: 10, h: 1.425, fill: { color: C.dark, transparency: 30 } });
    s.addText("Aluga AI", {
      x: 0.7,
      y: 1.5,
      w: 8.6,
      h: 1,
      fontFace: FONT.title,
      fontSize: 44,
      bold: true,
      color: C.white,
    });
    s.addText("Plataforma Web para Aluguel de Ferramentas", {
      x: 0.7,
      y: 2.55,
      w: 8.6,
      h: 0.5,
      fontFace: FONT.body,
      fontSize: 20,
      color: "93C5FD",
    });
    s.addText("Resumo detalhado do projeto, stack tecnológica e arquitetura", {
      x: 0.7,
      y: 3.2,
      w: 8.6,
      h: 0.4,
      fontFace: FONT.body,
      fontSize: 14,
      color: "CBD5E1",
    });
    s.addText("TCC · Laravel 13 + React 19 + Inertia.js", {
      x: 0.7,
      y: 4.55,
      w: 8.6,
      h: 0.35,
      fontFace: FONT.body,
      fontSize: 12,
      color: C.white,
    });
  }

  // Slide 2 — Visão geral
  {
    const s = pptx.addSlide();
    addHeader(s, "Visão Geral do Projeto", "O que é o Aluga AI e qual problema resolve");
    addBullets(s, [
      "Aplicação web para aluguel de ferramentas por período determinado (horas/dias).",
      "Centraliza catálogo público, solicitação de empréstimos, cobrança e painéis administrativos.",
      "Dois perfis principais: Cliente (aluga e cadastra ferramentas) e Admin (gerencia e monitora).",
      "Experiência SPA moderna (React) com backend robusto (Laravel) via Inertia.js — sem API REST separada.",
      "MVP com pagamento simulado (gateway mock) para validar fluxo completo antes de integração real.",
      "Documentação C4 (contexto, containers, componentes) e arquitetura detalhada em docs/.",
    ]);
    addFooter(s, "Aluga AI · Visão geral");
  }

  // Slide 3 — Atores
  {
    const s = pptx.addSlide();
    addHeader(s, "Atores e Perfis de Usuário", "Quem interage com a plataforma");
    addCard(s, {
      x: 0.55,
      y: 1.3,
      w: 2.85,
      h: 3.5,
      title: "Visitante",
      accent: C.accent2,
      lines: [
        "Navega catálogo público",
        "Filtra por texto, preço, disponibilidade e período",
        "Visualiza detalhes das ferramentas",
        "Não precisa estar autenticado",
      ],
    });
    addCard(s, {
      x: 3.55,
      y: 1.3,
      w: 2.85,
      h: 3.5,
      title: "Cliente",
      accent: C.accent,
      lines: [
        "Registro/login via Fortify",
        "Solicita empréstimos de ferramentas",
        "Encerra empréstimos e paga (mock)",
        "Cadastra e gerencia suas ferramentas",
        "Dashboard com histórico e totais pagos",
      ],
    });
    addCard(s, {
      x: 6.55,
      y: 1.3,
      w: 2.85,
      h: 3.5,
      title: "Administrador",
      accent: C.primary,
      lines: [
        "Acesso exclusivo via middleware admin",
        "CRUD de ferramentas administradas",
        "Painel operacional (empréstimos ativos)",
        "Painel financeiro (pagamentos aprovados/pendentes)",
        "Upload e gestão de imagens",
      ],
    });
    addFooter(s, "Aluga AI · Atores");
  }

  // Slide 4 — Arquitetura
  {
    const s = pptx.addSlide();
    addHeader(s, "Arquitetura da Solução (C4)", "Containers e fluxo técnico principal");
    addBullets(s, [
      "Frontend Web (React + Inertia): interface para visitantes, clientes e admins.",
      "Backend Laravel: regras de negócio, autenticação, validação e orquestração HTTP.",
      "Banco relacional (SQLite em dev): usuários, ferramentas, empréstimos, pagamentos.",
      "Armazenamento de mídia: disco público Laravel (storage/app/public) para fotos.",
      "Módulo de pagamento mock: simula approved / failed / pending desacoplado por contrato.",
      "Fluxo: Requisição → Controller → Inertia Response → React renderiza sem reload completo.",
      "SSR habilitado (config/inertia.php) com tema persistido em cookie + localStorage.",
    ], { fontSize: 13, lineSpacing: 20 });
    addFooter(s, "Aluga AI · Arquitetura");
  }

  // Slide 5 — Stack overview
  {
    const s = pptx.addSlide();
    addHeader(s, "Stack Tecnológica — Panorama", "Todas as tecnologias adotadas no projeto");
    addTechTable(s, [
      ["PHP 8.3+", "Linguagem do backend; requisito mínimo do projeto"],
      ["Laravel 13", "Framework MVC, rotas, ORM, filas, storage e middleware"],
      ["React 19", "Biblioteca UI com TypeScript e React Compiler"],
      ["TypeScript 5.7", "Tipagem estática no frontend (modo strict)"],
      ["Inertia.js 3", "Ponte Laravel ↔ React sem API REST separada"],
      ["Vite 8", "Bundler e dev server com HMR"],
      ["Tailwind CSS 4", "Estilização utility-first com @theme e CSS variables"],
      ["SQLite", "Banco padrão de desenvolvimento e testes"],
    ], { y: 1.2 });
    addFooter(s, "Aluga AI · Stack");
  }

  // Slide 6 — Backend Laravel
  {
    const s = pptx.addSlide();
    addHeader(s, "Backend — Laravel 13", "Como o Laravel é utilizado no projeto");
    addBullets(s, [
      "Controllers enxutos em app/Http/Controllers orquestram fluxos (catálogo, empréstimos, admin).",
      "Form Requests (app/Http/Requests) centralizam validação por contexto (Admin, Client, Settings).",
      "Eloquent ORM: models User, Tool, ToolImage, Rental, Payment, PaymentHistory.",
      "Enums PHP para PaymentStatus e status de empréstimo (scheduled, active, finished, late).",
      "Services: RentalAvailabilityService, RentalClosureService, PaymentService, PaymentGatewayManager.",
      "Policies e middleware EnsureUserIsAdmin / EnsureUserIsClient para autorização por perfil.",
      "Middleware HandleInertiaRequests compartilha auth.user, name e sidebarOpen globalmente.",
      "Soft delete em ferramentas; CarbonImmutable para datas; queue listener no composer dev.",
    ], { fontSize: 12.5, lineSpacing: 18 });
    addFooter(s, "Aluga AI · Backend");
  }

  // Slide 7 — Autenticação Fortify
  {
    const s = pptx.addSlide();
    addHeader(s, "Autenticação — Laravel Fortify", "Segurança e controle de acesso");
    addBullets(s, [
      "Fortify gerencia registro, login, reset de senha e verificação de e-mail.",
      "Views customizadas apontam para páginas Inertia em resources/js/pages/auth/*.",
      "Autenticação de dois fatores (2FA) com confirmação de senha e rate limiting.",
      "Novos usuários registrados recebem perfil cliente automaticamente (CreateNewUser).",
      "Middleware auth + verified protege rotas sensíveis; throttle em alteração de senha.",
      "LoginResponse customizada redireciona admin e cliente para dashboards distintos.",
      "Comando Artisan users:create-initial-admin para criar primeiro administrador.",
    ]);
    addFooter(s, "Aluga AI · Autenticação");
  }

  // Slide 8 — Frontend
  {
    const s = pptx.addSlide();
    addHeader(s, "Frontend — React 19 + Inertia.js", "Interface moderna com navegação SPA-like");
    addBullets(s, [
      "Bootstrap em resources/js/app.tsx: createInertiaApp, providers globais, tema e progress bar.",
      "Páginas Inertia em resources/js/pages mapeadas por controllers ou Route::inertia().",
      "Layouts por convenção: auth/* → AuthLayout; settings/* → AppLayout+SettingsLayout.",
      "Componentes reutilizáveis em components/ e design system em components/ui (shadcn).",
      "Hooks customizados: use-appearance, use-mobile, use-initials, use-current-url.",
      "Wayfinder (@laravel/vite-plugin-wayfinder): rotas tipadas geradas em resources/js/routes.",
      "Vite plugins: laravel-vite-plugin, @inertiajs/vite, @vitejs/plugin-react (React Compiler).",
      "Navegação via Inertia Link mantendo semântica web e estado parcial do servidor.",
    ], { fontSize: 12.5, lineSpacing: 18 });
    addFooter(s, "Aluga AI · Frontend");
  }

  // Slide 9 — UI/Design
  {
    const s = pptx.addSlide();
    addHeader(s, "UI, Design System e Temas", "Tailwind CSS 4 + shadcn/ui + Radix UI");
    addCard(s, {
      x: 0.55,
      y: 1.25,
      w: 4.3,
      h: 1.55,
      title: "Tailwind CSS v4",
      accent: C.accent2,
      lines: ["@theme e CSS variables em app.css", "Plugin @tailwindcss/vite", "tw-animate-css para animações"],
    });
    addCard(s, {
      x: 5.15,
      y: 1.25,
      w: 4.3,
      h: 1.55,
      title: "shadcn/ui (new-york)",
      accent: C.accent,
      lines: ["Primitivos Radix UI acessíveis", "class-variance-authority + clsx + tailwind-merge", "Componentes: Button, Dialog, Sheet, Badge..."],
    });
    addCard(s, {
      x: 0.55,
      y: 3.0,
      w: 4.3,
      h: 1.55,
      title: "Tema Light/Dark/System",
      accent: C.primary,
      lines: ["Hook use-appearance.tsx", "Persistência: localStorage + cookie appearance", "SSR compatível via HandleAppearance middleware"],
    });
    addCard(s, {
      x: 5.15,
      y: 3.0,
      w: 4.3,
      h: 1.55,
      title: "Bibliotecas visuais",
      accent: C.success,
      lines: ["Lucide React (ícones)", "Sonner (toasts/notificações)", "Headless UI (componentes complementares)"],
    });
    addFooter(s, "Aluga AI · UI/Design");
  }

  // Slide 10 — Banco e domínio
  {
    const s = pptx.addSlide();
    addHeader(s, "Banco de Dados e Domínio", "Modelagem e persistência");
    addTechTable(s, [
      ["users", "Usuários com perfil admin/cliente, 2FA, verificação de e-mail"],
      ["tools", "Ferramentas: nome, descrição, valor/hora, disponibilidade, owner_id"],
      ["tool_images", "Até 10 imagens por ferramenta (jpeg/png/webp, máx. 5 MB)"],
      ["rentals", "Empréstimos: período, status, snapshot de preço, valor estimado/final"],
      ["payments", "Cobranças vinculadas ao encerramento do empréstimo"],
      ["payment_histories", "Histórico de transações do gateway mock"],
    ], { y: 1.15 });
    s.addText("Migrations Eloquent · Factories para testes · Seeders (CatalogoInicialSeeder, usuários de teste)", {
      x: 0.55,
      y: 4.85,
      w: 8.9,
      h: 0.35,
      fontFace: FONT.body,
      fontSize: 11,
      color: C.muted,
      italic: true,
    });
    addFooter(s, "Aluga AI · Domínio");
  }

  // Slide 11 — Catálogo
  {
    const s = pptx.addSlide();
    addHeader(s, "Módulo — Catálogo Público", "ToolCatalogController e filtros");
    addBullets(s, [
      "Listagem pública de ferramentas sem autenticação (ToolCatalogController).",
      "Filtros: texto (nome/descrição), faixa de preço, disponibilidade e período desejado.",
      "Página de detalhe com imagem principal, valor por hora e estado operacional.",
      "Estados da ferramenta: disponível, emprestada, indisponível (marcada pelo proprietário).",
      "Validação de conflito de período via RentalAvailabilityService antes de criar empréstimo.",
      "Componentes React: tool-card, páginas de catálogo e detalhe com Inertia props.",
    ]);
    addFooter(s, "Aluga AI · Catálogo");
  }

  // Slide 12 — Empréstimos
  {
    const s = pptx.addSlide();
    addHeader(s, "Módulo — Empréstimos e Alugueis", "RentalComponent e regras de negócio");
    addBullets(s, [
      "Cliente solicita empréstimo informando data/hora início e fim (fim > início).",
      "Sistema bloqueia sobreposição de períodos para a mesma ferramenta.",
      "Status: scheduled → active → finished ou late (atraso no encerramento).",
      "Snapshot do valor/hora da ferramenta salvo no momento da criação.",
      "Valor estimado calculado pelo período; mínimo faturável = 1 minuto.",
      "Encerramento (RentalClosureService): calcula horas faturáveis, valor final e dispara pagamento.",
      "Não é permitido excluir ferramenta com empréstimo ativo, atrasado ou agendado.",
    ], { fontSize: 12.5, lineSpacing: 18 });
    addFooter(s, "Aluga AI · Empréstimos");
  }

  // Slide 13 — Pagamentos
  {
    const s = pptx.addSlide();
    addHeader(s, "Módulo — Pagamentos Mockados", "PaymentGateway desacoplado para evolução futura");
    addCard(s, {
      x: 0.55,
      y: 1.3,
      w: 4.3,
      h: 2.2,
      title: "Contrato PaymentGateway",
      accent: C.accent,
      lines: [
        "Interface em app/Contracts/PaymentGateway.php",
        "PaymentGatewayManager seleciona implementação",
        "MockPaymentGateway simula transações",
        "Configuração em config/payment.php e .env",
      ],
    });
    addCard(s, {
      x: 5.15,
      y: 1.3,
      w: 4.3,
      h: 2.2,
      title: "Status e fluxo",
      accent: C.success,
      lines: [
        "Status: pending, approved, failed",
        "Moeda padrão: BRL",
        "PAYMENT_MOCK_DEFAULT_STATUS no .env",
        "Histórico em payment_histories",
        "Criado/atualizado no encerramento do empréstimo",
      ],
    });
    s.addText("Arquitetura preparada para substituir mock por gateway real (Stripe, PagSeguro, etc.) sem alterar contratos do domínio.", {
      x: 0.55,
      y: 3.75,
      w: 8.9,
      h: 0.55,
      fontFace: FONT.body,
      fontSize: 12,
      color: C.muted,
      italic: true,
    });
    addFooter(s, "Aluga AI · Pagamentos");
  }

  // Slide 14 — Painéis
  {
    const s = pptx.addSlide();
    addHeader(s, "Dashboards — Cliente e Admin", "Painéis operacionais e financeiros");
    addCard(s, {
      x: 0.55,
      y: 1.25,
      w: 4.3,
      h: 3.6,
      title: "Painel do Cliente",
      accent: C.accent,
      lines: [
        "Resumo: total pago e ferramentas cadastradas",
        "Empréstimos ativos, agendados e atrasados",
        "Histórico de empréstimos finalizados",
        "Minhas Ferramentas: CRUD + upload de imagens",
        "Encerramento de empréstimo com cálculo final",
        "Controllers: HomeController, MyToolsController, ClientRentalClosureController",
      ],
    });
    addCard(s, {
      x: 5.15,
      y: 1.25,
      w: 4.3,
      h: 3.6,
      title: "Painéis Admin",
      accent: C.primary,
      lines: [
        "Operacional: ferramentas cadastradas, disponíveis e emprestadas",
        "Filtros por status, estado e busca textual",
        "Financeiro: pagamentos aprovados, pendentes e recusados",
        "Filtros financeiros por status e período",
        "CRUD admin de ferramentas + gestão de fotos",
        "AdminToolController, AdminFinanceDashboardController",
      ],
    });
    addFooter(s, "Aluga AI · Dashboards");
  }

  // Slide 15 — Testes
  {
    const s = pptx.addSlide();
    addHeader(s, "Testes e Qualidade de Código", "Cobertura automatizada e ferramentas de lint");
    addTechTable(s, [
      ["Pest PHP 4", "Testes Feature e Unit (php artisan test / composer test)"],
      ["Playwright 1.60", "Testes E2E no navegador (npm run test:e2e)"],
      ["Laravel Pint", "Formatação PHP (composer lint)"],
      ["ESLint 9", "Lint JavaScript/TypeScript (npm run lint)"],
      ["Prettier 3", "Formatação frontend com plugin Tailwind"],
      ["TypeScript strict", "Verificação de tipos (npm run types:check)"],
      ["GitHub Actions", "CI em push/PR: PHP 8.3–8.5, Node 22, build e Pest"],
    ], { y: 1.15 });
    s.addText("Fluxos integrados: IntegratedClientFlowTest, IntegratedAdminFlowTest, IntegratedErrorCasesTest + specs E2E", {
      x: 0.55,
      y: 4.85,
      w: 8.9,
      h: 0.35,
      fontFace: FONT.body,
      fontSize: 11,
      color: C.muted,
    });
    addFooter(s, "Aluga AI · Testes");
  }

  // Slide 16 — Estrutura e dev
  {
    const s = pptx.addSlide();
    addHeader(s, "Estrutura do Projeto e DevOps", "Organização de pastas e comandos de desenvolvimento");
    addBullets(s, [
      "app/: Controllers, Models, Services, Enums, Policies, Middleware, Fortify Actions.",
      "resources/js/: pages, layouts, components, hooks, lib, types, routes (Wayfinder).",
      "database/: migrations, factories, seeders e assets do catálogo inicial.",
      "tests/Feature + tests/Unit + e2e/: cobertura de fluxos completos e casos de erro.",
      "docs/: arquitetura (5 docs), C4 (3 níveis), tasks concluídas e checklist MVP.",
      "composer dev: servidor Laravel + queue:listen + Vite concurrently.",
      "composer setup: install, migrate, npm build — onboarding completo.",
      "composer ci:check: lint JS + format + types + testes PHP em um comando.",
    ], { fontSize: 12.5, lineSpacing: 18 });
    addFooter(s, "Aluga AI · Estrutura");
  }

  // Slide 17 — Fluxo técnico
  {
    const s = pptx.addSlide();
    addHeader(s, "Fluxo Técnico de uma Requisição", "Da URL ao componente React renderizado");
    const steps = [
      "1. Requisição HTTP → routes/web.php",
      "2. Middleware (auth, admin/client, Inertia, appearance)",
      "3. Controller processa e retorna Inertia::render('Page', props)",
      "4. HandleInertiaRequests injeta auth.user e dados globais",
      "5. Vite entrega bundle React via laravel-vite-plugin",
      "6. app.tsx resolve layout e monta página Inertia",
      "7. Componentes React renderizam UI com Tailwind + shadcn",
      "8. Ações do usuário → Inertia visit/post → ciclo reinicia",
    ];
    steps.forEach((step, i) => {
      s.addShape("roundRect", {
        x: 0.55,
        y: 1.2 + i * 0.48,
        w: 8.9,
        h: 0.4,
        fill: { color: i % 2 ? C.light : C.white },
        line: { color: "E2E8F0", width: 0.5 },
        rectRadius: 0.05,
      });
      s.addText(step, {
        x: 0.75,
        y: 1.27 + i * 0.48,
        w: 8.5,
        h: 0.3,
        fontFace: FONT.body,
        fontSize: 12,
        color: C.dark,
      });
    });
    addFooter(s, "Aluga AI · Fluxo técnico");
  }

  // Slide 18 — Conclusão
  {
    const s = pptx.addSlide();
    s.background = { color: C.primary };
    s.addText("Conclusão", {
      x: 0.7,
      y: 0.8,
      w: 8.6,
      h: 0.7,
      fontFace: FONT.title,
      fontSize: 32,
      bold: true,
      color: C.white,
    });
    addBullets(
      s,
      [
        "Aluga AI é um MVP completo de marketplace de aluguel de ferramentas.",
        "Stack moderna: Laravel 13 + React 19 + Inertia.js + Tailwind 4 + TypeScript.",
        "Arquitetura monolítica bem estruturada com serviços de domínio desacoplados.",
        "Autenticação robusta (Fortify + 2FA), autorização por perfil e validação em camadas.",
        "Testes automatizados (Pest + Playwright) e CI com GitHub Actions.",
        "Pronto para evolução: gateway de pagamento real, banco PostgreSQL/MySQL, filas assíncronas.",
      ],
      { y: 1.7, fontSize: 14, color: "E2E8F0", lineSpacing: 24 },
    );
    s.addText("Repositório: aluga-ai · Licença MIT", {
      x: 0.7,
      y: 4.8,
      w: 8.6,
      h: 0.4,
      fontFace: FONT.body,
      fontSize: 13,
      color: "93C5FD",
    });
  }

  await mkdir(OUT_DIR, { recursive: true });
  await pptx.writeFile({ fileName: OUT_FILE });
  console.log(`Deck exported: ${OUT_FILE}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
