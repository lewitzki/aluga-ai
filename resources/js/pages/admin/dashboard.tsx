import { Head, router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
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
import admin from '@/routes/admin';

type RentalStatus = 'scheduled' | 'active' | 'late';
type ToolOperationalStatus = 'disponivel' | 'emprestada' | 'indisponivel';

type AdminToolRow = {
    id: number;
    name: string;
    is_available: boolean;
    operational_status: ToolOperationalStatus;
};

type AdminActiveRentalRow = {
    id: number;
    status: RentalStatus;
    starts_at: string;
    expected_ends_at: string;
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

type DashboardFlash = {
    success?: string | null;
};

type PageProps = {
    summary: {
        total: number;
        available: number;
        rented: number;
    };
    tools: AdminToolRow[];
    active_rentals: AdminActiveRentalRow[];
    filters: {
        status: string;
        estado_ferramenta: string;
        q: string;
    };
    flash: DashboardFlash;
};

const rentalStatusLabels: Record<RentalStatus, string> = {
    scheduled: 'Agendado',
    active: 'Ativo',
    late: 'Atrasado',
};

const toolStatusLabels: Record<ToolOperationalStatus, string> = {
    disponivel: 'Disponível',
    emprestada: 'Emprestada',
    indisponivel: 'Indisponível',
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

function formatElapsedDuration(startsAt: string): string {
    const startMs = new Date(startsAt).getTime();
    const diffMs = Math.max(0, Date.now() - startMs);

    if (diffMs === 0 && startMs > Date.now()) {
        return 'Aguardando início';
    }

    const totalMinutes = Math.floor(diffMs / 60_000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
        return `${days}d ${hours}h`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }

    return `${Math.max(minutes, diffMs > 0 ? 1 : 0)}min`;
}

function useElapsedDuration(startsAt: string): string {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setTick((current) => current + 1);
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, [startsAt]);

    void tick;

    return formatElapsedDuration(startsAt);
}

function rentalBadgeVariant(
    status: RentalStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'active':
            return 'default';
        case 'late':
            return 'destructive';
        default:
            return 'outline';
    }
}

function toolBadgeVariant(
    status: ToolOperationalStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'disponivel':
            return 'default';
        case 'emprestada':
            return 'secondary';
        default:
            return 'outline';
    }
}

function ElapsedTimeCell({ startsAt }: { startsAt: string }) {
    const elapsed = useElapsedDuration(startsAt);

    return (
        <span
            className="font-medium tabular-nums"
            data-testid={`admin-rental-elapsed-${startsAt}`}
        >
            {elapsed}
        </span>
    );
}

export default function AdminDashboard({
    summary,
    tools,
    active_rentals,
    filters,
}: PageProps) {
    const flash = usePage<PageProps>().props.flash;

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        router.get(
            admin.dashboard.url(),
            {
                status: String(formData.get('status') ?? 'todos'),
                estado_ferramenta: String(
                    formData.get('estado_ferramenta') ?? 'todos',
                ),
                q: String(formData.get('q') ?? ''),
            },
            { preserveState: true, replace: true },
        );
    }

    function clearFilters() {
        router.get(
            admin.dashboard.url(),
            {},
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Painel operacional" />

            <div
                className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6"
                data-testid="admin-dashboard-root"
            >
                <Heading
                    title="Painel operacional"
                    description="Acompanhe ferramentas por estado e empréstimos ativos em tempo real."
                />

                {flash.success ? (
                    <p
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
                        data-testid="dashboard-flash-success"
                    >
                        {flash.success}
                    </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card data-testid="admin-dashboard-summary-total">
                        <CardHeader className="pb-2">
                            <CardDescription>Cadastradas</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.total}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Total de ferramentas no catálogo.
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-testid="admin-dashboard-summary-available">
                        <CardHeader className="pb-2">
                            <CardDescription>Disponíveis</CardDescription>
                            <CardTitle className="text-3xl text-emerald-700 dark:text-emerald-400">
                                {summary.available}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Prontas para empréstimo no momento.
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-testid="admin-dashboard-summary-rented">
                        <CardHeader className="pb-2">
                            <CardDescription>Emprestadas</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.rented}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Com empréstimo em andamento.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>
                            Refine listas por status e busca textual.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4 md:grid-cols-4"
                            onSubmit={submitFilters}
                            data-testid="admin-dashboard-filters"
                        >
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="estado_ferramenta">
                                    Estado da ferramenta
                                </Label>
                                <select
                                    id="estado_ferramenta"
                                    name="estado_ferramenta"
                                    defaultValue={filters.estado_ferramenta}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                    data-testid="admin-filter-tool-state"
                                >
                                    <option value="todos">Todos</option>
                                    <option value="disponivel">
                                        Disponível
                                    </option>
                                    <option value="emprestada">
                                        Emprestada
                                    </option>
                                    <option value="indisponivel">
                                        Indisponível
                                    </option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="status">
                                    Status do empréstimo
                                </Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={filters.status}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                    data-testid="admin-filter-rental-status"
                                >
                                    <option value="todos">Todos</option>
                                    <option value="scheduled">Agendado</option>
                                    <option value="active">Ativo</option>
                                    <option value="late">Atrasado</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <Label htmlFor="q">Busca</Label>
                                <Input
                                    id="q"
                                    name="q"
                                    defaultValue={filters.q}
                                    placeholder="Ferramenta, cliente ou e-mail"
                                    data-testid="admin-filter-search"
                                />
                            </div>

                            <div className="flex gap-2 md:col-span-4">
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
                        Ferramentas por estado
                    </h3>
                    {tools.length === 0 ? (
                        <p
                            className="text-sm text-muted-foreground"
                            data-testid="admin-dashboard-tools-empty"
                        >
                            Nenhuma ferramenta encontrada com os filtros atuais.
                        </p>
                    ) : (
                        <div
                            className="overflow-hidden rounded-lg border"
                            data-testid="admin-dashboard-tools"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Nome
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Estado
                                        </th>
                                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                            Cadastro
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tools.map((tool) => (
                                        <tr
                                            key={tool.id}
                                            className="border-b last:border-b-0"
                                            data-testid={`admin-dashboard-tool-row-${tool.id}`}
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {tool.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={toolBadgeVariant(
                                                        tool.operational_status,
                                                    )}
                                                >
                                                    {
                                                        toolStatusLabels[
                                                            tool
                                                                .operational_status
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="hidden px-4 py-3 sm:table-cell">
                                                {tool.is_available
                                                    ? 'Disponível no cadastro'
                                                    : 'Indisponível no cadastro'}
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
                        Empréstimos ativos
                    </h3>
                    {active_rentals.length === 0 ? (
                        <p
                            className="text-sm text-muted-foreground"
                            data-testid="admin-dashboard-rentals-empty"
                        >
                            Nenhum empréstimo ativo encontrado com os filtros
                            atuais.
                        </p>
                    ) : (
                        <div
                            className="overflow-hidden rounded-lg border"
                            data-testid="admin-dashboard-rentals"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Ferramenta
                                        </th>
                                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                            Cliente
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Tempo corrido
                                        </th>
                                        <th className="hidden px-4 py-3 font-medium md:table-cell">
                                            Prazo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {active_rentals.map((rental) => (
                                        <tr
                                            key={rental.id}
                                            className="border-b last:border-b-0"
                                            data-testid={`admin-dashboard-rental-row-${rental.id}`}
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {rental.tool.name}
                                            </td>
                                            <td className="hidden px-4 py-3 sm:table-cell">
                                                <div>{rental.client.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {rental.client.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={rentalBadgeVariant(
                                                        rental.status,
                                                    )}
                                                >
                                                    {
                                                        rentalStatusLabels[
                                                            rental.status
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ElapsedTimeCell
                                                    startsAt={rental.starts_at}
                                                />
                                            </td>
                                            <td className="hidden px-4 py-3 md:table-cell">
                                                {formatDateTime(
                                                    rental.expected_ends_at,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Painel operacional',
            href: admin.dashboard.url(),
        },
    ],
};
