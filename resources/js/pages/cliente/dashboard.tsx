import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';
import { dashboard } from '@/routes/cliente';

type RentalStatus = 'scheduled' | 'active' | 'finished' | 'late';

type ClientRentalRow = {
    id: number;
    status: RentalStatus;
    starts_at: string;
    expected_ends_at: string;
    ended_at: string | null;
    hourly_rate_snapshot: string;
    estimated_total: string | null;
    final_total: string | null;
    tool: {
        id: number;
        name: string;
    };
    payment: {
        status: string;
        amount: string;
    } | null;
};

type DashboardFlash = {
    success?: string | null;
};

type PageProps = {
    summary: {
        total_paid: string;
        currency: string;
    };
    active_rentals: ClientRentalRow[];
    history_rentals: ClientRentalRow[];
    flash: DashboardFlash;
};

const statusLabels: Record<RentalStatus, string> = {
    scheduled: 'Agendado',
    active: 'Ativo',
    finished: 'Finalizado',
    late: 'Atrasado',
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

function statusBadgeVariant(
    status: RentalStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'active':
            return 'default';
        case 'late':
            return 'destructive';
        case 'finished':
            return 'secondary';
        default:
            return 'outline';
    }
}

function RentalTable({
    emptyMessage,
    rentals,
    showDeadline = false,
    testId,
}: {
    emptyMessage: string;
    rentals: ClientRentalRow[];
    showDeadline?: boolean;
    testId: string;
}) {
    if (rentals.length === 0) {
        return (
            <p
                className="text-sm text-muted-foreground"
                data-testid={`${testId}-empty`}
            >
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border" data-testid={testId}>
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50">
                    <tr>
                        <th className="px-4 py-3 font-medium">Ferramenta</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                            Status
                        </th>
                        <th className="hidden px-4 py-3 font-medium md:table-cell">
                            Início
                        </th>
                        <th className="px-4 py-3 font-medium">
                            {showDeadline ? 'Prazo' : 'Encerramento'}
                        </th>
                        <th className="hidden px-4 py-3 font-medium lg:table-cell">
                            Valor
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rentals.map((rental) => (
                        <tr
                            key={rental.id}
                            className="border-b last:border-b-0"
                            data-testid={`${testId}-row-${rental.id}`}
                        >
                            <td className="px-4 py-3 font-medium">
                                {rental.tool.name}
                            </td>
                            <td className="hidden px-4 py-3 sm:table-cell">
                                <Badge
                                    variant={statusBadgeVariant(rental.status)}
                                >
                                    {statusLabels[rental.status]}
                                </Badge>
                            </td>
                            <td className="hidden px-4 py-3 md:table-cell">
                                {formatDateTime(rental.starts_at)}
                            </td>
                            <td className="px-4 py-3">
                                {showDeadline
                                    ? formatDateTime(rental.expected_ends_at)
                                    : rental.ended_at
                                      ? formatDateTime(rental.ended_at)
                                      : formatDateTime(
                                            rental.expected_ends_at,
                                        )}
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                                {formatCurrency(
                                    rental.final_total ??
                                        rental.estimated_total ??
                                        '0',
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ClientDashboard({
    summary,
    active_rentals,
    history_rentals,
}: PageProps) {
    const flash = usePage<PageProps>().props.flash;

    return (
        <>
            <Head title="Meus empréstimos" />

            <div
                className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6"
                data-testid="client-dashboard-root"
            >
                <Heading
                    title="Meus empréstimos"
                    description="Acompanhe empréstimos ativos, histórico e total pago."
                />

                {flash.success ? (
                    <p
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
                        data-testid="dashboard-flash-success"
                    >
                        {flash.success}
                    </p>
                ) : null}

                <Card data-testid="client-dashboard-summary">
                    <CardHeader>
                        <CardTitle>Resumo financeiro</CardTitle>
                        <CardDescription>
                            Total pago com base em pagamentos aprovados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p
                            className="text-3xl font-semibold tracking-tight"
                            data-testid="client-dashboard-total-paid"
                        >
                            {formatCurrency(
                                summary.total_paid,
                                summary.currency,
                            )}
                        </p>
                    </CardContent>
                </Card>

                <section className="flex flex-col gap-3">
                    <h3 className="text-base font-medium">
                        Empréstimos ativos
                    </h3>
                    <RentalTable
                        emptyMessage="Você não possui empréstimos ativos no momento."
                        rentals={active_rentals}
                        showDeadline
                        testId="client-dashboard-active"
                    />
                </section>

                <section className="flex flex-col gap-3">
                    <h3 className="text-base font-medium">Histórico</h3>
                    <RentalTable
                        emptyMessage="Nenhum empréstimo finalizado ainda."
                        rentals={history_rentals}
                        testId="client-dashboard-history"
                    />
                </section>
            </div>
        </>
    );
}

ClientDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Meus empréstimos',
            href: dashboard.url(),
        },
    ],
};
