import { Link, router, usePage } from '@inertiajs/react';
import { Search, User2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AlugaLogo from '@/components/brand/aluga-logo';
import { homeDashboard } from '@/lib/home-dashboard';
import { login, register } from '@/routes';
import catalog from '@/routes/catalog';

type Props = {
    canRegister?: boolean;
    searchDefault?: string;
    activeKey?: 'home' | 'catalog';
};

export default function PublicHeader({
    canRegister = true,
    searchDefault = '',
    activeKey,
}: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(searchDefault);

    const submitSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const term = search.trim();
        const query: Record<string, string> = {};

        if (term) {
            query.descricao = term;
        }

        router.get(catalog.index.url({ query }));
    };

    return (
        <header className="sticky top-0 z-30 bg-brand-400 shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-6">
                <Link href="/" prefetch className="shrink-0">
                    <AlugaLogo />
                </Link>

                <form
                    onSubmit={submitSearch}
                    role="search"
                    className="flex-1"
                    data-testid="public-header-search"
                >
                    <label htmlFor="public-search" className="sr-only">
                        Pesquisar ferramentas
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-inner ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-neutral-900">
                        <input
                            id="public-search"
                            name="descricao"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar ferramentas..."
                            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-neutral-900 px-4 text-white transition hover:bg-neutral-800"
                            aria-label="Buscar"
                        >
                            <Search className="size-4" />
                        </button>
                    </div>
                </form>

                <nav className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                    <Link
                        href={catalog.index.url()}
                        className={`hidden rounded-md px-3 py-1.5 transition hover:bg-white/40 md:inline-block ${activeKey === 'catalog' ? 'bg-white/50' : ''}`}
                        data-testid="public-header-catalog"
                    >
                        Catálogo
                    </Link>
                    {auth.user ? (
                        <Link
                            href={homeDashboard(auth.user)}
                            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-white shadow-sm transition hover:bg-neutral-800"
                        >
                            <User2 className="size-4" />
                            <span className="hidden sm:inline">
                                Minha conta
                            </span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="hidden rounded-md px-3 py-1.5 transition hover:bg-white/40 sm:inline-block"
                            >
                                Entrar
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-white shadow-sm transition hover:bg-neutral-800"
                                >
                                    <User2 className="size-4" />
                                    <span className="hidden sm:inline">
                                        Cadastrar
                                    </span>
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
