import { Head, router } from '@inertiajs/react';
import PublicFooter from '@/components/brand/public-footer';
import PublicHeader from '@/components/brand/public-header';
import ToolCard from '@/components/brand/tool-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import catalog from '@/routes/catalog';
import type { LaravelPaginator } from '@/types/catalog';

type CatalogTool = {
    id: number;
    name: string;
    description: string | null;
    hourly_rate: string;
    is_available: boolean;
    thumbnail_url: string | null;
};

export type CatalogFilters = {
    descricao: string;
    preco_min: string | number | null;
    preco_max: string | number | null;
    disponivel: string;
    periodo_inicio: string | null;
    periodo_fim: string | null;
};

type CatalogPageProps = {
    filters: CatalogFilters;
    tools: LaravelPaginator<CatalogTool>;
    canRegister?: boolean;
};

function buildQuery(
    filters: CatalogFilters,
    overrides: Partial<CatalogFilters> = {},
): Record<string, string | number> {
    const merged = { ...filters, ...overrides };
    const q: Record<string, string | number> = {};

    if (merged.descricao) {
        q.descricao = merged.descricao;
    }

    if (
        merged.preco_min !== null &&
        merged.preco_min !== undefined &&
        merged.preco_min !== ''
    ) {
        q.preco_min = Number(merged.preco_min);
    }

    if (
        merged.preco_max !== null &&
        merged.preco_max !== undefined &&
        merged.preco_max !== ''
    ) {
        q.preco_max = Number(merged.preco_max);
    }

    if (merged.disponivel && merged.disponivel !== 'todos') {
        q.disponivel = merged.disponivel;
    }

    if (merged.periodo_inicio) {
        q.periodo_inicio = merged.periodo_inicio;
    }

    if (merged.periodo_fim) {
        q.periodo_fim = merged.periodo_fim;
    }

    return q;
}

export default function Catalog({
    canRegister = true,
    filters,
    tools,
}: CatalogPageProps) {
    const applyFilters = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const next: CatalogFilters = {
            descricao: String(fd.get('descricao') ?? '').trim(),
            preco_min: fd.get('preco_min') ? String(fd.get('preco_min')) : null,
            preco_max: fd.get('preco_max') ? String(fd.get('preco_max')) : null,
            disponivel: String(fd.get('disponivel') ?? 'todos'),
            periodo_inicio: fd.get('periodo_inicio')
                ? String(fd.get('periodo_inicio'))
                : null,
            periodo_fim: fd.get('periodo_fim')
                ? String(fd.get('periodo_fim'))
                : null,
        };
        router.get(catalog.index.url({ query: buildQuery(next) }));
    };

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.visit(url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Catálogo de ferramentas" />

            <div className="min-h-screen bg-white text-neutral-900">
                <PublicHeader
                    canRegister={canRegister}
                    searchDefault={filters.descricao}
                    activeKey="catalog"
                />

                {/* Faixa de navegação secundária mantida para preservar testes */}
                <div className="border-b border-neutral-200 bg-neutral-50">
                    <nav
                        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-neutral-600 md:px-6"
                        data-testid="catalog-nav"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-800">
                                Início
                            </span>
                            <span aria-hidden>›</span>
                            <span
                                className="font-semibold text-neutral-900"
                                data-testid="catalog-nav-active"
                            >
                                Catálogo
                            </span>
                        </div>
                        <span className="hidden text-neutral-500 sm:inline">
                            {tools.total} ferramentas disponíveis
                        </span>
                    </nav>
                </div>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 uppercase md:text-3xl">
                            Catálogo de ferramentas
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Filtre por descrição, preço por hora,
                            disponibilidade no cadastro e livre no período (sem
                            empréstimo sobreposto).
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <Card
                                className="border-neutral-200 shadow-none"
                                data-testid="catalog-filters"
                            >
                                <CardHeader className="border-b border-neutral-200 pb-3">
                                    <CardTitle className="text-base font-bold uppercase">
                                        Filtros
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <form
                                        className="space-y-4"
                                        onSubmit={applyFilters}
                                    >
                                        <div>
                                            <Label htmlFor="descricao">
                                                Descrição ou nome
                                            </Label>
                                            <Input
                                                id="descricao"
                                                name="descricao"
                                                defaultValue={filters.descricao}
                                                placeholder="Buscar…"
                                                className="mt-1.5"
                                                data-testid="catalog-filter-descricao"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="preco_min">
                                                    Preço mín. (h)
                                                </Label>
                                                <Input
                                                    id="preco_min"
                                                    name="preco_min"
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    defaultValue={
                                                        filters.preco_min ===
                                                            null ||
                                                        filters.preco_min === ''
                                                            ? ''
                                                            : String(
                                                                  filters.preco_min,
                                                              )
                                                    }
                                                    className="mt-1.5"
                                                    data-testid="catalog-filter-preco-min"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="preco_max">
                                                    Preço máx. (h)
                                                </Label>
                                                <Input
                                                    id="preco_max"
                                                    name="preco_max"
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    defaultValue={
                                                        filters.preco_max ===
                                                            null ||
                                                        filters.preco_max === ''
                                                            ? ''
                                                            : String(
                                                                  filters.preco_max,
                                                              )
                                                    }
                                                    className="mt-1.5"
                                                    data-testid="catalog-filter-preco-max"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="disponivel">
                                                Disponível (cadastro)
                                            </Label>
                                            <select
                                                id="disponivel"
                                                name="disponivel"
                                                defaultValue={
                                                    filters.disponivel ||
                                                    'todos'
                                                }
                                                data-testid="catalog-filter-disponivel"
                                                className={cn(
                                                    'mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm',
                                                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                                )}
                                            >
                                                <option value="todos">
                                                    Todos
                                                </option>
                                                <option value="sim">Sim</option>
                                                <option value="nao">Não</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="periodo_inicio">
                                                Período — início
                                            </Label>
                                            <Input
                                                id="periodo_inicio"
                                                name="periodo_inicio"
                                                type="datetime-local"
                                                defaultValue={
                                                    filters.periodo_inicio ?? ''
                                                }
                                                className="mt-1.5"
                                                data-testid="catalog-filter-periodo-inicio"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="periodo_fim">
                                                Período — fim
                                            </Label>
                                            <Input
                                                id="periodo_fim"
                                                name="periodo_fim"
                                                type="datetime-local"
                                                defaultValue={
                                                    filters.periodo_fim ?? ''
                                                }
                                                className="mt-1.5"
                                                data-testid="catalog-filter-periodo-fim"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2">
                                            <Button
                                                type="submit"
                                                className="bg-brand-400 font-bold text-neutral-900 hover:bg-brand-500"
                                                data-testid="catalog-apply-filters"
                                            >
                                                Aplicar filtros
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.get(
                                                        catalog.index.url(),
                                                    )
                                                }
                                            >
                                                Limpar
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </aside>

                        <section>
                            {tools.data.length === 0 ? (
                                <div
                                    className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-500"
                                    data-testid="catalog-empty"
                                >
                                    Nenhuma ferramenta encontrada com os filtros
                                    atuais.
                                </div>
                            ) : (
                                <ul
                                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                                    data-testid="catalog-results"
                                >
                                    {tools.data.map((tool) => (
                                        <li key={tool.id}>
                                            <ToolCard tool={tool} />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {tools.last_page > 1 ? (
                                <nav
                                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                                    aria-label="Paginação"
                                    data-testid="catalog-pagination"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!tools.prev_page_url}
                                        onClick={() =>
                                            goToPage(tools.prev_page_url)
                                        }
                                        data-testid="catalog-page-prev"
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm text-neutral-600">
                                        Página {tools.current_page} de{' '}
                                        {tools.last_page}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!tools.next_page_url}
                                        onClick={() =>
                                            goToPage(tools.next_page_url)
                                        }
                                        data-testid="catalog-page-next"
                                    >
                                        Próxima
                                    </Button>
                                </nav>
                            ) : null}
                        </section>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
