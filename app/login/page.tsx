"use client"
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Lock, Loader2, ArrowRight, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setError("")

        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError("Erro ao fazer login: " + error.message)
        } else {
            // Check user metadata for role to redirect correctly
            const userRole = data.user?.user_metadata?.role
            const isRecruiterEmail = data.user?.email === 'recruiter@iestgroup.com'

            if (userRole === 'recruiter' || isRecruiterEmail) {
                router.push("/recruiter")
            } else {
                // Default to candidate area for candidates or users without role
                router.push("/candidate")
            }
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-fremc-blue-dark via-fremc-blue to-fremc-red-dark opacity-10"></div>
            <div className="absolute inset-0 bg-[url('/hero-gradient.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

            <Card className="w-full max-w-md relative z-10 glass border-white/40 shadow-2xl">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="mx-auto w-12 h-12 bg-fremc-blue/10 rounded-full flex items-center justify-center mb-2">
                        <Mail className="h-6 w-6 text-fremc-blue" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-fremc-blue-dark">Acesse sua conta</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                        Entre com seu email e senha para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Eu sou:</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setRole('candidate')}
                                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'candidate'
                                        ? 'bg-white text-fremc-blue shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    Candidato
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('recruiter')}
                                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'recruiter'
                                        ? 'bg-white text-fremc-blue shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Recrutador
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-fremc-blue transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-fremc-blue focus:ring-fremc-blue/20 rounded-xl transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-fremc-blue transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-fremc-blue focus:ring-fremc-blue/20 rounded-xl transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-fremc-red hover:bg-fremc-red-dark text-lg font-medium shadow-lg shadow-fremc-red/20 rounded-xl transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Não tem uma conta? <Link href="/signup" className="text-fremc-blue hover:underline font-medium">Cadastre-se</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
