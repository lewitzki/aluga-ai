import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { homeDashboard } from '@/lib/home-dashboard';
import { cn } from '@/lib/utils';
import catalog from '@/routes/catalog';
import { login, register } from '@/routes';
import type { LaravelPaginator } from '@/types/catalog';
import type { User } from '@/types/auth';

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
    auth: {
        user: User | null;
    };
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
    auth,
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
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <header className="border-b border-[#19140026] px-6 py-4 dark:border-[#3E3E3A]">
                    <nav
                        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm"
                        data-testid="catalog-nav"
                    >
                        <Link
                            href="/"
                            className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Início
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className="rounded-sm border border-[#19140035] px-3 py-1 text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                                data-testid="catalog-nav-active"
                            >
                                Catálogo
                            </span>
                            {auth.user ? (
                                <Link
                                    href={homeDashboard(auth.user)}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 leading-normal hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-sm border border-transparent px-3 py-1.5 leading-normal hover:border-[#19140035] dark:hover:border-[#3E3E3A]"
                                    >
                                        Entrar
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 leading-normal hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                        >
                                            Registrar
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Catálogo de ferramentas
                        </h1>
                        <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Filtre por descrição, preço por hora, disponibilidade no cadastro e
                            livre no período (sem empréstimo sobreposto).
                        </p>
                    </div>

                    <Card
                        className="mb-8 border-[#19140026] shadow-none dark:border-[#3E3E3A]"
                        data-testid="catalog-filters"
                    >
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Filtros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="grid gap-4 md:grid-cols-2"
                                onSubmit={applyFilters}
                            >
                                <div className="md:col-span-2">
                                    <Label htmlFor="descricao">Descrição ou nome</Label>
                                    <Input
                                        id="descricao"
                                        name="descricao"
                                        defaultValue={filters.descricao}
                                        placeholder="Buscar…"
                                        className="mt-1.5"
                                        data-testid="catalog-filter-descricao"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="preco_min">Preço mínimo (hora)</Label>
                                    <Input
                                        id="preco_min"
                                        name="preco_min"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        defaultValue={
                                            filters.preco_min === null ||
                                            filters.preco_min === ''
                                                ? ''
                                                : String(filters.preco_min)
                                        }
                                        className="mt-1.5"
                                        data-testid="catalog-filter-preco-min"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="preco_max">Preço máximo (hora)</Label>
                                    <Input
                                        id="preco_max"
                                        name="preco_max"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        defaultValue={
                                            filters.preco_max === null ||
                                            filters.preco_max === ''
                                                ? ''
                                                : String(filters.preco_max)
                                        }
                                        className="mt-1.5"
                                        data-testid="catalog-filter-preco-max"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="disponivel">Disponível (cadastro)</Label>
                                    <select
                                        id="disponivel"
                                        name="disponivel"
                                        defaultValue={filters.disponivel || 'todos'}
                                        data-testid="catalog-filter-disponivel"
                                        className={cn(
                                            'border-input mt-1.5 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm',
                                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                        )}
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="sim">Sim</option>
                                        <option value="nao">Não</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="periodo_inicio">
                                        Livre no período — início
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
                                        Livre no período — fim
                                    </Label>
                                    <Input
                                        id="periodo_fim"
                                        name="periodo_fim"
                                        type="datetime-local"
                                        defaultValue={filters.periodo_fim ?? ''}
                                        className="mt-1.5"
                                        data-testid="catalog-filter-periodo-fim"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 md:col-span-2">
                                    <Button type="submit" data-testid="catalog-apply-filters">
                                        Aplicar filtros
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.get(catalog.index.url())
                                        }
                                    >
                                        Limpar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {tools.data.length === 0 ? (
                        <p
                            className="text-center text-sm text-[#706f6c] dark:text-[#A1A09A]"
                            data-testid="catalog-empty"
                        >
                            Nenhuma ferramenta encontrada com os filtros atuais.
                        </p>
                    ) : (
                        <ul
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-testid="catalog-results"
                        >
                            {tools.data.map((tool) => (
                                <li key={tool.id}>
                                    <Link
                                        href={catalog.show.url(tool.id)}
                                        aria-label={`Ver detalhes de ${tool.name}`}
                                        data-testid="catalog-tool-link"
                                        className="block rounded-xl outline-none transition hover:opacity-[0.97] focus-visible:ring-2 focus-visible:ring-[#19140056] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFDFFC] dark:focus-visible:ring-[#EDEDECC0] dark:focus-visible:ring-offset-[#0a0a0a]"
                                    >
                                    <Card className="h-full overflow-hidden border-[#19140026] shadow-none dark:border-[#3E3E3A]">
                                        <div className="aspect-video bg-[#f4f4f5] dark:bg-[#161615]">
                                            {tool.thumbnail_url ? (
                                                <img
                                                    src={tool.thumbnail_url}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                    Sem foto
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base leading-snug">
                                                {tool.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            {tool.description ? (
                                                <p className="line-clamp-3 text-[#706f6c] dark:text-[#A1A09A]">
                                                    {tool.description}
                                                </p>
                                            ) : null}
                                            <p>
                                                <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                                    Valor/hora:{' '}
                                                </span>
                                                <span className="font-medium">
                                                    R${' '}
                                                    {Number(tool.hourly_rate).toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        },
                                                    )}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                                    Cadastro:{' '}
                                                </span>
                                                {tool.is_available ? (
                                                    <span className="text-emerald-700 dark:text-emerald-400">
                                                        disponível
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-800 dark:text-amber-300">
                                                        indisponível
                                                    </span>
                                                )}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {tools.last_page > 1 ? (
                        <nav
                            className="mt-10 flex flex-wrap items-center justify-center gap-2"
                            aria-label="Paginação"
                            data-testid="catalog-pagination"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!tools.prev_page_url}
                                onClick={() => goToPage(tools.prev_page_url)}
                                data-testid="catalog-page-prev"
                            >
                                Anterior
                            </Button>
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Página {tools.current_page} de {tools.last_page}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!tools.next_page_url}
                                onClick={() => goToPage(tools.next_page_url)}
                                data-testid="catalog-page-next"
                            >
                                Próxima
                            </Button>
                        </nav>
                    ) : null}
                </main>
            </div>
        </>
    );
}
