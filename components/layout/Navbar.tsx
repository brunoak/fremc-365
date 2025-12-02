import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, Users, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/actions"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isRecruiter = user?.user_metadata?.role === 'recruiter' || user?.email === 'recruiter@iestgroup.com'
    // Default to candidate if logged in and not a recruiter (handles legacy users or missing metadata)
    const isCandidate = !!user && !isRecruiter

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-12 w-40">
                        <Image
                            src="/logo-fremc.png"
                            alt="Fremc 365"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <Link href="/" className="transition-colors hover:text-fremc-blue hover:font-bold">
                        Vagas
                    </Link>
                    {isCandidate && (
                        <Link href="/candidate" className="transition-colors hover:text-fremc-blue hover:font-bold">
                            Área do Candidato
                        </Link>
                    )}
                    {isRecruiter && (
                        <>
                            <Link href="/recruiter" className="transition-colors hover:text-fremc-blue hover:font-bold">
                                Painel
                            </Link>
                            <Link href="/recruiter/candidates" className="transition-colors hover:text-fremc-blue hover:font-bold">
                                Banco de Talentos
                            </Link>
                            <Link href="/recruiter/companies" className="transition-colors hover:text-fremc-blue hover:font-bold">
                                Minhas Empresas
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 hidden md:inline-block">
                                {user.email}
                            </span>
                            <form action={signOut}>
                                <Button variant="ghost" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-gray-600 hover:text-fremc-blue hover:bg-fremc-blue/5">
                                    <User className="h-4 w-4" />
                                    Entrar
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-fremc-red to-fremc-red-light hover:from-fremc-red-dark hover:to-fremc-red shadow-lg shadow-fremc-red/20 border-0 text-white">
                                    <Users className="h-4 w-4" />
                                    Criar Conta
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
