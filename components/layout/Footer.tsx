import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-fremc-blue-dark text-white py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-300">
                    © {new Date().getFullYear()} Fremc 365. Todos os direitos reservados.
                </div>
                <div className="flex gap-6 text-sm text-gray-300">
                    <Link href="#" className="hover:text-white transition-colors">
                        Termos de Uso
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        Privacidade
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors">
                        Contato
                    </Link>
                </div>
            </div>
        </footer>
    )
}
