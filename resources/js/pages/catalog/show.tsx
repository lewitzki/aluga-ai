import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { homeDashboard } from '@/lib/home-dashboard';
import catalog from '@/routes/catalog';
import { login, register } from '@/routes';
import type { User } from '@/types/auth';

type CatalogDetailImage = {
    url: string;
    alt: string;
};

type CatalogDetailTool = {
    id: number;
    name: string;
    description: string | null;
    hourly_rate: string;
    is_available: boolean;
    images: CatalogDetailImage[];
};

type CatalogShowPageProps = {
    tool: CatalogDetailTool;
    canRequestRental: boolean;
    canRegister?: boolean;
    auth: {
        user: User | null;
    };
};

function PhotoFallback({ className }: { className?: string }) {
    return (
        <div
            className={`flex items-center justify-center bg-[#f4f4f5] text-xs text-[#706f6c] dark:bg-[#161615] dark:text-[#A1A09A] ${className ?? ''}`}
        >
            Sem foto
        </div>
    );
}

export default function CatalogShow({
    canRegister = true,
    tool,
    canRequestRental,
    auth,
}: CatalogShowPageProps) {
    const photos = tool.images;

    return (
        <>
            <Head title={tool.name} />
            <div
                className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                data-testid="catalog-detail-root"
            >
                <header className="border-b border-[#19140026] px-6 py-4 dark:border-[#3E3E3A]">
                    <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm">
                        <Link
                            href="/"
                            className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Início
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={catalog.index.url()}
                                className="inline-block rounded-sm border border-transparent px-3 py-1.5 leading-normal hover:border-[#19140035] dark:hover:border-[#3E3E3A]"
                            >
                                Catálogo
                            </Link>
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
                            {tool.name}
                        </h1>
                        {tool.description ? (
                            <p className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                {tool.description}
                            </p>
                        ) : null}
                    </div>

                    <div className="mb-8 overflow-hidden rounded-lg border border-[#19140026] dark:border-[#3E3E3A]">
                        <div className="aspect-video w-full md:aspect-[21/9]">
                            {photos.length > 0 ? (
                                <img
                                    src={photos[0]?.url}
                                    alt={photos[0]?.alt ?? tool.name}
                                    className="size-full object-cover"
                                    data-testid="catalog-detail-hero-photo"
                                />
                            ) : (
                                <PhotoFallback className="size-full" />
                            )}
                        </div>
                    </div>

                    {photos.length > 1 ? (
                        <ul className="mb-10 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                            {photos.slice(1).map((photo, idx) => (
                                <li
                                    key={`${photo.url}-${String(idx)}`}
                                    className="aspect-square overflow-hidden rounded-md border border-[#19140026] dark:border-[#3E3E3A]"
                                >
                                    <img
                                        src={photo.url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <Card className="border-[#19140026] shadow-none dark:border-[#3E3E3A]">
                        <CardContent className="space-y-6 p-6 text-sm">
                            <div>
                                <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                    Valor por hora{' '}
                                </span>
                                <span className="text-lg font-semibold tabular-nums">
                                    R${' '}
                                    {Number(tool.hourly_rate).toLocaleString(
                                        'pt-BR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                    Disponibilidade (cadastro):{' '}
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
                            </div>

                            {canRequestRental ? (
                                <Form
                                    action={catalog.rentals.store.url(tool.id)}
                                    method="post"
                                    options={{ preserveScroll: true }}
                                    className="space-y-4 pt-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="starts_at">
                                                        Início previsto
                                                    </Label>
                                                    <Input
                                                        id="starts_at"
                                                        name="starts_at"
                                                        type="datetime-local"
                                                        required
                                                        data-testid="catalog-rental-starts-at"
                                                    />
                                                    <InputError
                                                        message={errors.starts_at}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="expected_ends_at">
                                                        Fim previsto
                                                    </Label>
                                                    <Input
                                                        id="expected_ends_at"
                                                        name="expected_ends_at"
                                                        type="datetime-local"
                                                        required
                                                        data-testid="catalog-rental-ends-at"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.expected_ends_at
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full sm:w-auto"
                                                disabled={processing}
                                                data-testid="catalog-detail-cta-rental"
                                            >
                                                {processing && (
                                                    <Spinner className="mr-2" />
                                                )}
                                                Solicitar empréstimo
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            ) : auth.user?.profile === 'cliente' &&
                              !tool.is_available ? (
                                <div className="border-t border-[#19140026] pt-6 dark:border-[#3E3E3A]">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                        Esta ferramenta está indisponível no
                                        cadastro e não aceita novas solicitações.
                                    </p>
                                </div>
                            ) : auth.user ? null : (
                                <div className="border-t border-[#19140026] pt-6 dark:border-[#3E3E3A]">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                        Entre com uma conta de cliente para
                                        solicitar este empréstimo.
                                    </p>
                                    <Button asChild variant="outline" className="mt-3">
                                        <Link
                                            href={login()}
                                            data-testid="catalog-detail-cta-login"
                                        >
                                            Entrar
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
