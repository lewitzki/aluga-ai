import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import tools from '@/routes/admin/tools';

type ToolImageRow = {
    id: number;
    url: string;
};

type ToolEdit = {
    id: number;
    name: string;
    description: string;
    hourly_rate: string;
    is_available: boolean;
    images: ToolImageRow[];
    max_images: number;
};

export default function AdminToolsEdit({ tool }: { tool: ToolEdit }) {
    const canAddMore = tool.images.length < tool.max_images;

    return (
        <>
            <Head title={`Editar · ${tool.name}`} />

            <div className="mx-auto w-full max-w-2xl px-4 py-6">
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

                <section
                    className="mt-10 space-y-4 border-t border-border pt-8"
                    aria-labelledby="tool-photos-heading"
                >
                    <h2
                        id="tool-photos-heading"
                        className="text-lg font-medium text-foreground"
                    >
                        Fotos no catálogo
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Exibidas na listagem (primeira foto) e na página de detalhe. Até{' '}
                        {tool.max_images} imagens; JPEG, PNG ou WebP; até 5 MB cada.
                    </p>

                    {tool.images.length > 0 ? (
                        <ul className="flex flex-wrap gap-4">
                            {tool.images.map((img) => (
                                <li
                                    key={img.id}
                                    className="border-border bg-card relative w-36 shrink-0 overflow-hidden rounded-lg border shadow-xs"
                                >
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="aspect-square w-full object-cover"
                                    />
                                    <Form
                                        action={tools.images.destroy.url({
                                            tool: tool.id,
                                            tool_image: img.id,
                                        })}
                                        method="delete"
                                        options={{
                                            preserveScroll: true,
                                        }}
                                        className="border-t border-border p-2"
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner />}
                                                Remover
                                            </Button>
                                        )}
                                    </Form>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">
                            Nenhuma foto cadastrada; o catálogo mostrará só o texto da
                            ferramenta.
                        </p>
                    )}

                    {canAddMore ? (
                        <Form
                            action={tools.images.store.url({ tool: tool.id })}
                            method="post"
                            options={{ preserveScroll: true }}
                            className="space-y-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-images">
                                            Adicionar fotos
                                        </Label>
                                        <input
                                            id="new-images"
                                            name="images[]"
                                            type="file"
                                            multiple
                                            required
                                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                            className="text-muted-foreground file:text-foreground file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-primary/20"
                                        />
                                        <InputError message={errors.images} />
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Enviar fotos
                                    </Button>
                                </>
                            )}
                        </Form>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            Limite de {tool.max_images} fotos atingido. Remova uma
                            imagem para substituir ou enviar novas.
                        </p>
                    )}
                </section>
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
