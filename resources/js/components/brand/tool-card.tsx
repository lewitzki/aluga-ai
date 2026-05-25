import { Link } from '@inertiajs/react';
import catalog from '@/routes/catalog';

export type ToolCardData = {
    id: number;
    name: string;
    description?: string | null;
    hourly_rate: string;
    is_available: boolean;
    thumbnail_url: string | null;
};

function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Cartão de produto inspirado no Palácio das Ferramentas, adaptado
 * para o aluguel de ferramentas: o "valor à vista" representa o valor/hora
 * e o parcelamento (até 10x sem juros) é exibido conforme política de pagamento.
 */
export default function ToolCard({ tool }: { tool: ToolCardData }) {
    const hourly = Number(tool.hourly_rate);
    const oldPrice = hourly > 0 ? hourly * 1.18 : 0;
    const discount =
        oldPrice > 0 ? Math.round(((oldPrice - hourly) / oldPrice) * 100) : 0;
    const installments = 10;
    const installment = hourly / installments;

    return (
        <Link
            href={catalog.show.url(tool.id)}
            aria-label={`Ver detalhes de ${tool.name}`}
            data-testid="catalog-tool-link"
            className="group flex h-full flex-col rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-lg bg-neutral-50 p-4">
                {discount > 0 && tool.is_available ? (
                    <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        {discount}% OFF
                    </span>
                ) : null}
                {!tool.is_available ? (
                    <span className="absolute top-2 right-2 rounded bg-neutral-700 px-2 py-0.5 text-xs font-bold text-white">
                        Indisponível
                    </span>
                ) : null}
                {tool.thumbnail_url ? (
                    <img
                        src={tool.thumbnail_url}
                        alt={tool.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-xs text-neutral-400">
                        Sem foto
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-neutral-800 group-hover:text-brand-700">
                    {tool.name}
                </h3>
                <div className="mt-auto space-y-0.5">
                    {discount > 0 && tool.is_available ? (
                        <p className="text-xs text-neutral-400 line-through">
                            R$ {formatBRL(oldPrice)}
                        </p>
                    ) : null}
                    <p className="text-lg font-bold text-neutral-900">
                        R$ {formatBRL(hourly)}
                        <span className="ml-1 text-xs font-medium text-neutral-500">
                            /hora
                        </span>
                    </p>
                    <p className="text-xs text-neutral-600">
                        ou{' '}
                        <span className="font-semibold">{installments}x</span>{' '}
                        de{' '}
                        <span className="font-semibold">
                            R$ {formatBRL(installment)}
                        </span>
                    </p>
                </div>
                <span className="mt-2 block w-full rounded-md bg-brand-400 px-3 py-2 text-center text-sm font-bold text-neutral-900 transition group-hover:bg-brand-500">
                    {tool.is_available ? 'Ver detalhes' : 'Indisponível'}
                </span>
            </div>
        </Link>
    );
}
