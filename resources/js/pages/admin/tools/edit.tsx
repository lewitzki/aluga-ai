import { Form, Head, Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import tools from '@/routes/admin/tools';

type ToolOperationalStatus = 'disponivel' | 'emprestada' | 'indisponivel';

type ToolImageRow = {
    id: number;
    url: string;
    alt: string;
};

type ToolEdit = {
    id: number;
    name: string;
    description: string;
    hourly_rate: string;
    is_available: boolean;
    images: ToolImageRow[];
    max_images: number;
    operational_status: ToolOperationalStatus;
    has_active_rental: boolean;
    catalog_url: string;
};

const operationalStatusLabels: Record<ToolOperationalStatus, string> = {
    disponivel: 'Disponível no catálogo',
    emprestada: 'Emprestada',
    indisponivel: 'Indisponível no catálogo',
};

const operationalStatusVariants: Record<
    ToolOperationalStatus,
    'default' | 'secondary' | 'destructive'
> = {
    disponivel: 'default',
    emprestada: 'secondary',
    indisponivel: 'destructive',
};

function formatBRL(value: string) {
    return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function PhotoFallback({ className }: { className?: string }) {
    return (
        <div
            className={`flex items-center justify-center bg-muted text-sm text-muted-foreground ${className ?? ''}`}
        >
            Sem foto
        </div>
    );
}

export default function AdminToolsEdit({ tool }: { tool: ToolEdit }) {
    const canAddMore = tool.images.length < tool.max_images;
    const [activePhoto, setActivePhoto] = useState(0);
    const currentImage = tool.images[activePhoto] ?? null;

    return (
        <>
            <Head title={`Editar · ${tool.name}`} />

            <div
                className="mx-auto w-full max-w-5xl px-4 py-6"
                data-testid="admin-tool-edit-root"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        variant="small"
                        title={tool.name}
                        description="Alterações afetam o catálogo imediatamente. Empréstimos já registrados continuam usando os valores históricos já salvos."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={
                                operationalStatusVariants[
                                    tool.operational_status
                                ]
                            }
                        >
                            {operationalStatusLabels[tool.operational_status]}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={tool.catalog_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-2 size-4" />
                                Ver no catálogo
                            </a>
                        </Button>
                    </div>
                </div>

                {tool.has_active_rental ? (
                    <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                        Esta ferramenta possui empréstimo ativo ou pendente.
                        Alterações de preço e texto não afetam valores já
                        acordados; a disponibilidade no catálogo segue as regras
                        de sobreposição de período.
                    </p>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                    <section
                        className="space-y-4"
                        aria-labelledby="tool-preview-heading"
                    >
                        <h2
                            id="tool-preview-heading"
                            className="text-lg font-medium text-foreground"
                        >
                            Fotos no catálogo
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            A primeira foto aparece na listagem pública. Até{' '}
                            {tool.max_images} imagens; JPEG, PNG ou WebP; até 5
                            MB cada.
                        </p>

                        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
                            {currentImage ? (
                                <img
                                    src={currentImage.url}
                                    alt={currentImage.alt}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <PhotoFallback className="aspect-square w-full" />
                            )}
                        </div>

                        {tool.images.length > 1 ? (
                            <ul className="flex flex-wrap gap-2">
                                {tool.images.map((img, index) => (
                                    <li key={img.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActivePhoto(index)
                                            }
                                            className={`size-16 overflow-hidden rounded-md border-2 transition-colors ${
                                                index === activePhoto
                                                    ? 'border-primary'
                                                    : 'border-transparent'
                                            }`}
                                            aria-label={`Foto ${index + 1}`}
                                            aria-pressed={index === activePhoto}
                                        >
                                            <img
                                                src={img.url}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        {tool.images.length > 0 ? (
                            <ul className="grid gap-4 sm:grid-cols-2">
                                {tool.images.map((img) => (
                                    <li
                                        key={img.id}
                                        className="overflow-hidden rounded-lg border border-border bg-card shadow-xs"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="aspect-video w-full object-cover"
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
                                                    Remover foto
                                                </Button>
                                            )}
                                        </Form>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhuma foto cadastrada; o catálogo mostrará só
                                o texto da ferramenta.
                            </p>
                        )}

                        {canAddMore ? (
                            <Form
                                action={tools.images.store.url({
                                    tool: tool.id,
                                })}
                                method="post"
                                options={{ preserveScroll: true }}
                                className="space-y-3 rounded-lg border border-dashed border-border p-4"
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
                                                className="text-muted-foreground file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-primary/20"
                                            />
                                            <InputError
                                                message={errors.images}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Enviar fotos
                                        </Button>
                                    </>
                                )}
                            </Form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Limite de {tool.max_images} fotos atingido.
                                Remova uma imagem para enviar novas.
                            </p>
                        )}
                    </section>

                    <section aria-labelledby="tool-data-heading">
                        <h2
                            id="tool-data-heading"
                            className="text-lg font-medium text-foreground"
                        >
                            Informações da ferramenta
                        </h2>

                        <dl className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">
                                    Valor atual
                                </dt>
                                <dd className="font-medium">
                                    R$ {formatBRL(tool.hourly_rate)} / hora
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    Fotos cadastradas
                                </dt>
                                <dd className="font-medium">
                                    {tool.images.length} de {tool.max_images}
                                </dd>
                            </div>
                        </dl>

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
                                        <Label htmlFor="description">
                                            Descrição
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            defaultValue={tool.description}
                                            className="flex field-sizing-content min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
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
                                        <InputError
                                            message={errors.hourly_rate}
                                        />
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
                                            className="size-4 rounded-[4px] border-input text-primary shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                        <Label
                                            htmlFor="is_available"
                                            className="cursor-pointer font-normal"
                                        >
                                            Disponível para aluguel no catálogo
                                        </Label>
                                    </div>
                                    <InputError
                                        message={errors.is_available}
                                    />

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            asChild
                                        >
                                            <Link
                                                href={tools.index.url()}
                                                prefetch
                                            >
                                                Voltar à lista
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Salvar alterações
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>
                </div>
            </div>
        </>
    );
}

AdminToolsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: admin.dashboard.url() },
        { title: 'Ferramentas', href: tools.index.url() },
        { title: 'Editar', href: '#' },
    ],
};
