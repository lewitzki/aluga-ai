import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import tools from '@/routes/admin/tools';

type ToolEdit = {
    id: number;
    name: string;
    description: string;
    hourly_rate: string;
    is_available: boolean;
};

export default function AdminToolsEdit({ tool }: { tool: ToolEdit }) {
    return (
        <>
            <Head title={`Editar · ${tool.name}`} />

            <div className="mx-auto w-full max-w-lg px-4 py-6">
                <Heading
                    variant="small"
                    title="Editar ferramenta"
                    description="Alterações afetam o catálogo imediatamente. Empréstimos já registrados continuam usando os valores históricos já salvos."
                />

                <Form
                    action={tools.update.url(tool.id)}
                    method="put"
                    options={{ preserveScroll: true }}
                    className="mt-6 space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoComplete="off"
                                    defaultValue={tool.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    defaultValue={tool.description}
                                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="hourly_rate">
                                    Valor por hora (R$)
                                </Label>
                                <Input
                                    id="hourly_rate"
                                    name="hourly_rate"
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    defaultValue={tool.hourly_rate}
                                />
                                <InputError message={errors.hourly_rate} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="hidden"
                                    name="is_available"
                                    value="0"
                                />
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    name="is_available"
                                    value="1"
                                    defaultChecked={tool.is_available}
                                    className="border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 size-4 rounded-[4px] shadow-xs transition-shadow outline-none focus-visible:ring-[3px]"
                                />
                                <Label
                                    htmlFor="is_available"
                                    className="cursor-pointer font-normal"
                                >
                                    Disponível para aluguel no catálogo
                                </Label>
                            </div>
                            <InputError message={errors.is_available} />

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href={tools.index.url()} prefetch>
                                        Voltar à lista
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Salvar alterações
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminToolsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: admin.dashboard.url() },
        { title: 'Ferramentas', href: tools.index.url() },
    ],
};
