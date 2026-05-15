import { Head, Link } from '@inertiajs/react';
import catalog from '@/routes/catalog';

export default function NotFound() {
    return (
        <>
            <Head title="Página não encontrada" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] px-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="mx-auto max-w-md text-center">
                    <p className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                        Erro 404
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                        Esta página não existe
                    </h1>
                    <p className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        O endereço pode estar incorreto ou o conteúdo foi removido.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/"
                            className="rounded-sm border border-[#19140035] px-5 py-2 text-sm hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                        >
                            Início
                        </Link>
                        <Link
                            href={catalog.index.url()}
                            className="rounded-sm border border-transparent bg-[#1b1b18] px-5 py-2 text-sm text-white hover:opacity-90 dark:bg-[#EDEDEC] dark:text-[#1b1b18]"
                            data-testid="not-found-link-catalog"
                        >
                            Catálogo
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
