import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import admin from '@/routes/admin';
import tools from '@/routes/admin/tools';
import type { LaravelPaginator } from '@/types/catalog';

type ToolOperationalStatus = 'disponivel' | 'emprestada' | 'indisponivel';

export type AdminToolRow = {
    id: number;
    name: string;
    description: string | null;
    hourly_rate: string;
    is_available: boolean;
    thumbnail_url: string | null;
    operational_status: ToolOperationalStatus;
};

const operationalStatusLabels: Record<ToolOperationalStatus, string> = {
    disponivel: 'Disponível',
    emprestada: 'Emprestada',
    indisponivel: 'Indisponível',
};

type PageProps = {
    tools: LaravelPaginator<AdminToolRow>;
};

export default function AdminToolsIndex({ tools: toolPage }: PageProps) {
    function goToPage(url: string | null) {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    }

    function confirmDelete(tool: AdminToolRow) {
        if (
            !window.confirm(
                `Remover "${tool.name}" do catálogo? Esta ação pode ser desfeita apenas por suporte técnico.`,
            )
        ) {
            return;
        }

        router.delete(tools.destroy.url(tool.id));
    }

    return (
        <>
            <Head title="Ferramentas" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Ferramentas"
                        description="Cadastre e gerencie itens do catálogo público."
                    />
                    <Button asChild size="sm">
                        <Link href={tools.create.url()} prefetch>
                            <Plus className="mr-2 size-4" />
                            Nova ferramenta
                        </Link>
                    </Button>
                </div>

                {toolPage.data.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                        Nenhuma ferramenta cadastrada ainda.
                    </p>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="hidden w-16 px-4 py-3 font-medium sm:table-cell">
                                        Foto
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Nome
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Valor/hora
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {toolPage.data.map((tool) => (
                                    <tr key={tool.id}>
                                        <td className="hidden px-4 py-3 align-top sm:table-cell">
                                            {tool.thumbnail_url ? (
                                                <img
                                                    src={tool.thumbnail_url}
                                                    alt=""
                                                    className="size-12 rounded-md border border-border object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-12 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-[10px] text-muted-foreground">
                                                    Sem foto
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-medium">
                                                {tool.name}
                                            </div>
                                            {tool.description ? (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {tool.description}
                                                </p>
                                            ) : null}
                                            <div className="mt-2 text-xs text-muted-foreground sm:hidden">
                                                R${' '}
                                                {Number(
                                                    tool.hourly_rate,
                                                ).toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{' '}
                                                / h ·{' '}
                                                {
                                                    operationalStatusLabels[
                                                        tool.operational_status
                                                    ]
                                                }
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                            R${' '}
                                            {Number(
                                                tool.hourly_rate,
                                            ).toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="hidden px-4 py-3 md:table-cell">
                                            <span
                                                className={
                                                    tool.operational_status ===
                                                    'disponivel'
                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                        : tool.operational_status ===
                                                            'emprestada'
                                                          ? 'text-blue-700 dark:text-blue-300'
                                                          : 'text-amber-800 dark:text-amber-300'
                                                }
                                            >
                                                {
                                                    operationalStatusLabels[
                                                        tool.operational_status
                                                    ]
                                                }
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    asChild
                                                >
                                                    <Link
                                                        href={tools.edit.url(
                                                            tool.id,
                                                        )}
                                                        prefetch
                                                        aria-label={`Editar ${tool.name}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    type="button"
                                                    aria-label={`Excluir ${tool.name}`}
                                                    onClick={() =>
                                                        confirmDelete(tool)
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {toolPage.last_page > 1 ? (
                    <nav
                        className="flex flex-wrap items-center justify-center gap-2"
                        aria-label="Paginação"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!toolPage.prev_page_url}
                            onClick={() => goToPage(toolPage.prev_page_url)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {toolPage.current_page} de{' '}
                            {toolPage.last_page}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!toolPage.next_page_url}
                            onClick={() => goToPage(toolPage.next_page_url)}
                        >
                            Próxima
                        </Button>
                    </nav>
                ) : null}
            </div>
        </>
    );
}

AdminToolsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.dashboard.url(),
        },
        {
            title: 'Ferramentas',
            href: tools.index.url(),
        },
    ],
};
