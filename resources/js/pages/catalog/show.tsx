import { Form, Head, Link } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import PublicFooter from '@/components/brand/public-footer';
import PublicHeader from '@/components/brand/public-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import catalog from '@/routes/catalog';
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
            className={`flex items-center justify-center bg-neutral-50 text-xs text-neutral-400 ${className ?? ''}`}
        >
            Sem foto
        </div>
    );
}

function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function CatalogShow({
    canRegister = true,
    tool,
    canRequestRental,
    auth,
}: CatalogShowPageProps) {
    const photos = tool.images;
    const [activePhoto, setActivePhoto] = useState(0);

    const hourly = Number(tool.hourly_rate);
    const oldPrice = hourly > 0 ? hourly * 1.18 : 0;
    const discount =
        oldPrice > 0 ? Math.round(((oldPrice - hourly) / oldPrice) * 100) : 0;
    const installments = 10;
    const installment = hourly / installments;

    return (
        <>
            <Head title={tool.name} />
            <div
                className="min-h-screen bg-white text-neutral-900"
                data-testid="catalog-detail-root"
            >
                <PublicHeader canRegister={canRegister} activeKey="catalog" />

                <div className="border-b border-neutral-200 bg-neutral-50">
                    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-xs text-neutral-600 md:px-6">
                        <Link
                            href="/"
                            className="font-medium text-neutral-700 hover:text-neutral-900"
                        >
                            Início
                        </Link>
                        <span aria-hidden>›</span>
                        <Link
                            href={catalog.index.url()}
                            className="font-medium text-neutral-700 hover:text-neutral-900"
                        >
                            Catálogo
                        </Link>
                        <span aria-hidden>›</span>
                        <span className="line-clamp-1 font-semibold text-neutral-900">
                            {tool.name}
                        </span>
                    </nav>
                </div>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div>
                            <div className="grid gap-4 md:grid-cols-[80px_1fr]">
                                {photos.length > 1 ? (
                                    <ul className="order-2 grid grid-cols-5 gap-2 md:order-1 md:grid-cols-1">
                                        {photos.map((photo, idx) => (
                                            <li key={`${photo.url}-${idx}`}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActivePhoto(idx)
                                                    }
                                                    className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border bg-neutral-50 p-1 transition ${
                                                        idx === activePhoto
                                                            ? 'border-brand-500 ring-2 ring-brand-300'
                                                            : 'border-neutral-200 hover:border-brand-400'
                                                    }`}
                                                    aria-label={`Foto ${idx + 1}`}
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt=""
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="hidden md:block" />
                                )}

                                <div className="order-1 md:order-2">
                                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                                        {discount > 0 && tool.is_available ? (
                                            <span className="absolute top-3 left-3 rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                                                {discount}% OFF
                                            </span>
                                        ) : null}
                                        {photos.length > 0 ? (
                                            <img
                                                src={photos[activePhoto]?.url}
                                                alt={
                                                    photos[activePhoto]?.alt ??
                                                    tool.name
                                                }
                                                className="max-h-full max-w-full object-contain"
                                                data-testid="catalog-detail-hero-photo"
                                            />
                                        ) : (
                                            <PhotoFallback className="size-full" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {tool.description ? (
                                <div className="mt-10 rounded-lg border border-neutral-200 bg-white p-6">
                                    <h2 className="text-lg font-bold text-neutral-900 uppercase">
                                        Descrição
                                    </h2>
                                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-neutral-700">
                                        {tool.description}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <aside>
                            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                                <h1 className="text-xl leading-tight font-bold text-neutral-900 md:text-2xl">
                                    {tool.name}
                                </h1>

                                <div className="mt-5 space-y-1">
                                    {discount > 0 && tool.is_available ? (
                                        <p className="text-sm text-neutral-400 line-through">
                                            de R$ {formatBRL(oldPrice)}
                                        </p>
                                    ) : null}
                                    <p className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-neutral-900">
                                            R$ {formatBRL(hourly)}
                                        </span>
                                        <span className="text-sm font-medium text-neutral-500">
                                            / hora
                                        </span>
                                    </p>
                                    <p className="text-sm text-neutral-700">
                                        ou{' '}
                                        <span className="font-semibold text-brand-700">
                                            {installments}x
                                        </span>{' '}
                                        de{' '}
                                        <span className="font-semibold text-brand-700">
                                            R$ {formatBRL(installment)}
                                        </span>{' '}
                                        sem juros
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-xs">
                                    {tool.is_available ? (
                                        <>
                                            <Check className="size-4 text-emerald-600" />
                                            <span className="font-semibold text-emerald-700">
                                                Disponível para aluguel
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="size-4 text-red-600" />
                                            <span className="font-semibold text-red-700">
                                                Indisponível no momento
                                            </span>
                                        </>
                                    )}
                                </div>

                                {canRequestRental ? (
                                    <Form
                                        action={catalog.rentals.store.url(
                                            tool.id,
                                        )}
                                        method="post"
                                        options={{ preserveScroll: true }}
                                        className="mt-5 space-y-3"
                                    >
                                        {({ processing, errors }) => (
                                            <>
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
                                                        message={
                                                            errors.starts_at
                                                        }
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
                                                <Button
                                                    type="submit"
                                                    className="w-full bg-brand-400 font-bold text-neutral-900 hover:bg-brand-500"
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
                                    <p className="mt-5 text-sm text-neutral-600">
                                        Esta ferramenta está indisponível no
                                        cadastro e não aceita novas
                                        solicitações.
                                    </p>
                                ) : auth.user ? null : (
                                    <div className="mt-5">
                                        <p className="text-sm text-neutral-600">
                                            Entre com uma conta de cliente para
                                            solicitar este empréstimo.
                                        </p>
                                        <Button
                                            asChild
                                            className="mt-3 w-full bg-neutral-900 font-bold text-white hover:bg-neutral-800"
                                        >
                                            <Link
                                                href={login()}
                                                data-testid="catalog-detail-cta-login"
                                            >
                                                Entrar
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-xs text-neutral-600">
                                    <p className="flex items-center gap-2">
                                        <span className="inline-block size-1.5 rounded-full bg-brand-500" />
                                        Parcele em até 10x sem juros no cartão
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="inline-block size-1.5 rounded-full bg-brand-500" />
                                        Atendimento direto via plataforma
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="inline-block size-1.5 rounded-full bg-brand-500" />
                                        Solicitação validada por administrador
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
