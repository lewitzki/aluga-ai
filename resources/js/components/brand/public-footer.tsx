import AlugaLogo from '@/components/brand/aluga-logo';

export default function PublicFooter() {
    return (
        <footer className="mt-20 border-t border-neutral-200 bg-neutral-900 text-neutral-300">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="flex items-center gap-3">
                    <AlugaLogo variant="light" />
                </div>
                <div className="text-sm">
                    <p className="font-medium text-white">
                        Atendimento de quem entende o que você precisa.
                    </p>
                    <p className="mt-1 text-neutral-400">
                        Plataforma de aluguel de ferramentas — aluga-ai.
                    </p>
                </div>
                <div className="text-xs text-neutral-500">
                    © {new Date().getFullYear()} aluga-ai. Todos os direitos
                    reservados.
                </div>
            </div>
        </footer>
    );
}
