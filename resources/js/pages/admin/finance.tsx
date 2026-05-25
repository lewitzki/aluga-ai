import { FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Heading from '@/components/heading';
import admin from '@/routes/admin';
import type { LaravelPaginator } from '@/types/catalog';

type PaymentStatus = 'approved' | 'failed' | 'pending';

type AdminFinancePaymentRow = {
    id: number;
    status: PaymentStatus;
    amount: string;
    currency: string;
    settled_at: string | null;
    created_at: string;
    rental: {
        id: number;
        status: string;
    };
    tool: {
        id: number;
        name: string;
    };
    client: {
        id: number;
        name: string;
        email: string;
    };
};

type PeriodRevenueRow = {
    period: string;
    total: string;
    count: number;
};

type PageProps = {
    summary: {
        total_approved: string;
        currency: string;
        approved_count: number;
        pending_count: number;
        failed_count: number;
    };
    period_revenue: PeriodRevenueRow[];
    payments: LaravelPaginator<AdminFinancePaymentRow>;
    filters: {
        status: string;
        from: string;
        to: string;
    };
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
    approved: 'Aprovado',
    failed: 'Falhou',
    pending: 'Pendente',
};

function formatCurrency(value: string | number, currency = 'BRL') {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency,
    });
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function formatPeriodLabel(period: string) {
    const [year, month] = period.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });
}

function paymentBadgeVariant(
    status: PaymentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'approved':
            return 'default';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function AdminFinanceDashboard({
    summary,
    period_revenue,
    payments,
    filters,
}: PageProps) {
    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        router.get(
            admin.finance.url({
                query: {
                    status: String(formData.get('status') ?? 'todos'),
                    from: String(formData.get('from') ?? ''),
                    to: String(formData.get('to') ?? ''),
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        router.get(admin.finance.url(), {}, { preserveState: true, replace: true });
    }

    function goToPage(url: string | null) {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    }

    return (
        <>
            <Head title="Painel financeiro" />

            <div
                className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6"
                data-testid="admin-finance-root"
            >
                <Heading
                    title="Painel financeiro"
                    description="Acompanhe ganhos acumulados e o histórico de pagamentos da plataforma."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card data-testid="admin-finance-summary-total">
                        <CardHeader className="pb-2">
                            <CardDescription>Ganhos aprovados</CardDescription>
                            <CardTitle className="text-3xl text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(
                                    summary.total_approved,
                                    summary.currency,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Total com pagamentos aprovados no período
                                filtrado.
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-testid="admin-finance-summary-approved">
                        <CardHeader className="pb-2">
                            <CardDescription>Aprovados</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.approved_count}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Transações concluídas com sucesso.
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-testid="admin-finance-summary-pending">
                        <CardHeader className="pb-2">
                            <CardDescription>Pendentes</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.pending_count}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Aguardando confirmação ou fechamento.
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-testid="admin-finance-summary-failed">
                        <CardHeader className="pb-2">
                            <CardDescription>Falhas</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.failed_count}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Tentativas rejeitadas pelo gateway mockado.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>
                            Refine totais e histórico por status e intervalo de
                            datas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4 md:grid-cols-4"
                            onSubmit={submitFilters}
                            data-testid="admin-finance-filters"
                        >
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">Status do pagamento</Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={filters.status}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                    data-testid="admin-finance-filter-status"
                                >
                                    <option value="todos">Todos</option>
                                    <option value="approved">Aprovado</option>
                                    <option value="pending">Pendente</option>
                                    <option value="failed">Falhou</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="from">De</Label>
                                <Input
                                    id="from"
                                    name="from"
                                    type="date"
                                    defaultValue={filters.from}
                                    data-testid="admin-finance-filter-from"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="to">Até</Label>
                                <Input
                                    id="to"
                                    name="to"
                                    type="date"
                                    defaultValue={filters.to}
                                    data-testid="admin-finance-filter-to"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" size="sm">
                                    Aplicar filtros
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Limpar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <section className="flex flex-col gap-3">
                    <h3 className="text-base font-medium">
                        Receita por período
                    </h3>
                    {period_revenue.length === 0 ? (
                        <p
                            className="text-sm text-muted-foreground"
                            data-testid="admin-finance-period-empty"
                        >
                            Nenhum pagamento aprovado encontrado com os filtros
                            atuais.
                        </p>
                    ) : (
                        <div
                            className="overflow-hidden rounded-lg border"
                            data-testid="admin-finance-period-revenue"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Período
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Pagamentos
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {period_revenue.map((row) => (
                                        <tr
                                            key={row.period}
                                            className="border-b last:border-b-0"
                                            data-testid={`admin-finance-period-row-${row.period}`}
                                        >
                                            <td className="px-4 py-3 font-medium capitalize">
                                                {formatPeriodLabel(row.period)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.count}
                                            </td>
                                            <td className="px-4 py-3 font-medium tabular-nums">
                                                {formatCurrency(
                                                    row.total,
                                                    summary.currency,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-3">
                    <h3 className="text-base font-medium">
                        Histórico de pagamentos
                    </h3>
                    {payments.data.length === 0 ? (
                        <p
                            className="text-sm text-muted-foreground"
                            data-testid="admin-finance-payments-empty"
                        >
                            Nenhum pagamento encontrado com os filtros atuais.
                        </p>
                    ) : (
                        <div
                            className="overflow-hidden rounded-lg border"
                            data-testid="admin-finance-payments"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Data
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Cliente
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Ferramenta
                                        </th>
                                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                            Empréstimo
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Valor
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b last:border-b-0"
                                            data-testid={`admin-finance-payment-row-${payment.id}`}
                                        >
                                            <td className="px-4 py-3">
                                                {formatDateTime(
                                                    payment.settled_at ??
                                                        payment.created_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{payment.client.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.client.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {payment.tool.name}
                                            </td>
                                            <td className="hidden px-4 py-3 sm:table-cell">
                                                #{payment.rental.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium tabular-nums">
                                                {formatCurrency(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={paymentBadgeVariant(
                                                        payment.status,
                                                    )}
                                                >
                                                    {
                                                        paymentStatusLabels[
                                                            payment.status
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {payments.last_page > 1 ? (
                        <nav
                            className="flex flex-wrap items-center justify-center gap-2"
                            aria-label="Paginação"
                            data-testid="admin-finance-pagination"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!payments.prev_page_url}
                                onClick={() => goToPage(payments.prev_page_url)}
                                data-testid="admin-finance-page-prev"
                            >
                                Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {payments.current_page} de{' '}
                                {payments.last_page}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!payments.next_page_url}
                                onClick={() => goToPage(payments.next_page_url)}
                                data-testid="admin-finance-page-next"
                            >
                                Próxima
                            </Button>
                        </nav>
                    ) : null}
                </section>
            </div>
        </>
    );
}

AdminFinanceDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Painel financeiro',
            href: admin.finance.url(),
        },
    ],
};
