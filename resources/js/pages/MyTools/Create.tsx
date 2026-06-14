import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes/cliente';
import myTools from '@/routes/myTools';

type ToolDraft = {
    name: string;
    description: string;
    hourly_rate: string;
    is_available: boolean;
};

const MAX_IMAGES_HINT = 10;

export default function MyToolsCreate({ tool }: { tool: ToolDraft }) {
    return (
        <>
            <Head title="Nova ferramenta" />

            <div className="mx-auto w-full max-w-lg px-4 py-6">
                <Heading
                    variant="small"
                    title="Nova ferramenta"
                    description="Defina nome, descrição, preço por hora e se o item aparece como disponível no catálogo."
                />

                <Form
                    action={myTools.store.url()}
                    method="post"
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
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Ex.: Furadeira de impacto"
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
                                    required
                                    placeholder="Detalhes e condições de uso"
                                    defaultValue={tool.description}
                                    className="flex field-sizing-content min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
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
                                    placeholder="0,00"
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
                                    className="size-4 rounded-[4px] border-input text-primary shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <Label
                                    htmlFor="is_available"
                                    className="cursor-pointer font-normal"
                                >
                                    Disponível para aluguel no catálogo
                                </Label>
                            </div>
                            <InputError message={errors.is_available} />

                            <div className="grid gap-2">
                                <Label htmlFor="images">Fotos (opcional)</Label>
                                <input
                                    id="images"
                                    name="images[]"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                    className="text-muted-foreground file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-primary/20"
                                />
                                <InputError message={errors.images} />
                                <p className="text-sm text-muted-foreground">
                                    Até {MAX_IMAGES_HINT} arquivos, JPEG, PNG ou
                                    WebP, até 5 MB cada.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href={myTools.index.url()} prefetch>
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Salvar
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

MyToolsCreate.layout = {
    breadcrumbs: [
        { title: 'Meus empréstimos', href: dashboard.url() },
        { title: 'Minhas Ferramentas', href: myTools.index.url() },
        { title: 'Nova', href: myTools.create.url() },
    ],
};
