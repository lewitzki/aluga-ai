import { Head, Link } from '@inertiajs/react';
import PublicFooter from '@/components/brand/public-footer';
import PublicHeader from '@/components/brand/public-header';
import ToolCard from '@/components/brand/tool-card';
import type { ToolCardData } from '@/components/brand/tool-card';
import TrustBadges from '@/components/brand/trust-badges';
import catalog from '@/routes/catalog';

type WelcomeProps = {
    canRegister?: boolean;
    featuredTools?: ToolCardData[];
    latestTools?: ToolCardData[];
};

function SectionHeading({
    title,
    subtitle,
    cta,
}: {
    title: string;
    subtitle?: string;
    cta?: { label: string; href: string };
}) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 uppercase md:text-3xl">
                    {title}
                </h2>
                {subtitle ? (
                    <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
                ) : null}
            </div>
            {cta ? (
                <Link
                    href={cta.href}
                    className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                >
                    {cta.label}
                </Link>
            ) : null}
        </div>
    );
}

export default function Welcome({
    canRegister = true,
    featuredTools = [],
    latestTools = [],
}: WelcomeProps) {
    return (
        <>
            <Head title="Início">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white text-neutral-900">
                <PublicHeader canRegister={canRegister} activeKey="home" />

                <TrustBadges />

                {/* Bloco principal de chamada para o catálogo */}
                <section className="border-b border-neutral-200 bg-gradient-to-b from-brand-50 to-white">
                    <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-14">
                        <div>
                            <span className="inline-block rounded bg-brand-400 px-3 py-1 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                                A loja referência em locação
                            </span>
                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                                Alugue ferramentas profissionais com{' '}
                                <span className="text-brand-600">
                                    qualidade
                                </span>{' '}
                                e preço justo.
                            </h1>
                            <p className="mt-4 text-base text-neutral-600">
                                Explore o catálogo, escolha sua ferramenta e
                                solicite o empréstimo direto da plataforma.
                                Parcelamento em até 10x sem juros no cartão.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={catalog.index.url()}
                                    className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800"
                                >
                                    Ver catálogo completo
                                </Link>
                                <Link
                                    href={catalog.index.url()}
                                    className="rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-neutral-800 transition hover:border-brand-500 hover:text-brand-700"
                                >
                                    Ofertas da semana
                                </Link>
                            </div>
                        </div>
                        <div className="relative hidden h-full min-h-[260px] items-center justify-center rounded-xl bg-brand-400/40 p-6 md:flex">
                            {featuredTools[0]?.thumbnail_url ? (
                                <img
                                    src={featuredTools[0].thumbnail_url}
                                    alt={featuredTools[0].name}
                                    className="max-h-[320px] w-auto object-contain drop-shadow-lg"
                                />
                            ) : (
                                <div className="text-center text-sm text-neutral-700">
                                    Nenhuma ferramenta em destaque
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Ofertas da semana */}
                <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                    <SectionHeading
                        title="Ofertas da Semana"
                        subtitle="Selecionamos as melhores ferramentas com preço promocional por hora"
                        cta={{
                            label: 'Ver mais →',
                            href: catalog.index.url(),
                        }}
                    />
                    {featuredTools.length === 0 ? (
                        <p className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
                            Em breve, novas ofertas no catálogo.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {featuredTools.map((tool) => (
                                <li key={tool.id}>
                                    <ToolCard tool={tool} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Mais ferramentas (últimas unidades) */}
                {latestTools.length > 0 ? (
                    <section className="border-t border-neutral-200 bg-neutral-50">
                        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                            <SectionHeading
                                title="Últimas Unidades"
                                subtitle="Garantir disponibilidade enquanto ainda há"
                                cta={{
                                    label: 'Ver catálogo →',
                                    href: catalog.index.url(),
                                }}
                            />
                            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {latestTools.map((tool) => (
                                    <li key={tool.id}>
                                        <ToolCard tool={tool} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                ) : null}

                {/* Como funciona */}
                <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: '01',
                                title: 'Escolha a ferramenta',
                                desc: 'Navegue pelo catálogo e filtre por preço, disponibilidade e período.',
                            },
                            {
                                step: '02',
                                title: 'Solicite o empréstimo',
                                desc: 'Selecione início e fim previstos e envie a solicitação com sua conta de cliente.',
                            },
                            {
                                step: '03',
                                title: 'Pague em até 10x',
                                desc: 'Pagamento parcelado sem juros no cartão. Devolva a ferramenta no prazo combinado.',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="relative rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
                            >
                                <span className="absolute -top-3 -left-3 flex size-10 items-center justify-center rounded-full bg-brand-400 text-sm font-extrabold text-neutral-900 shadow">
                                    {item.step}
                                </span>
                                <h3 className="mt-2 text-lg font-bold text-neutral-900">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm text-neutral-600">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <PublicFooter />
            </div>
        </>
    );
}
