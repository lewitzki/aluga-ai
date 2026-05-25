import { CreditCard, ShieldCheck, Wrench } from 'lucide-react';

const items = [
    {
        icon: CreditCard,
        title: 'PARCELE EM ATÉ 10X',
        subtitle: 'sem juros no cartão',
    },
    {
        icon: Wrench,
        title: 'CATÁLOGO COMPLETO',
        subtitle: 'Ferramentas para todo trabalho',
    },
    {
        icon: ShieldCheck,
        title: 'ALUGUEL SEGURO',
        subtitle: 'Seus dados protegidos',
    },
];

export default function TrustBadges() {
    return (
        <section className="border-y border-neutral-200 bg-neutral-50">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-3 md:px-6">
                {items.map(({ icon: Icon, title, subtitle }) => (
                    <div
                        key={title}
                        className="flex items-center gap-3 text-sm"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-400 text-neutral-900">
                            <Icon className="size-5" />
                        </span>
                        <div>
                            <p className="font-bold text-neutral-900">
                                {title}
                            </p>
                            <p className="text-neutral-500">{subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
