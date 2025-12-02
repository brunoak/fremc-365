import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WithdrawButton } from "@/components/candidate/WithdrawButton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/candidate/ProfileForm"
import { getProfile } from "@/app/actions"
import { BookOpen, GraduationCap } from "lucide-react"

export default async function CandidateDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/login")
    }

    // Redirect recruiters to their area
    const isRecruiter = user.user_metadata?.role === 'recruiter' || user.email === 'recruiter@iestgroup.com'
    if (isRecruiter) {
        return redirect("/recruiter")
    }

    const { data: applications } = await supabase
        .from("candidatos")
        .select("*, vagas(titulo, empresa)")
        .eq("email", user.email)
        .order("created_at", { ascending: false })

    const profile = await getProfile()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-fremc-blue-dark mb-2">Área do Candidato</h1>
                    <p className="text-gray-600">Gerencie suas candidaturas e seu perfil profissional.</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Logado como: <span className="font-medium text-fremc-blue-dark">{user.email}</span>
                </div>
            </div>

            <Tabs defaultValue="applications" className="space-y-8">
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
                    <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-fremc-blue data-[state=active]:text-white">
                        Minhas Candidaturas
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-fremc-blue data-[state=active]:text-white">
                        Meu Perfil
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="applications" className="space-y-6">
                    <div className="grid gap-6">
                        {applications && applications.length > 0 ? (
                            applications.map((app: any) => (
                                <Card key={app.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
                                    <CardHeader className="pb-4 bg-white border-b border-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-fremc-blue group-hover:text-fremc-red transition-colors mb-1">
                                                    {app.vagas.titulo}
                                                </CardTitle>
                                                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-fremc-gold"></span>
                                                    {app.vagas.empresa}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                                    Etapa Atual
                                                </div>
                                                <Badge
                                                    variant={app.status === 'Novas Candidaturas' ? 'secondary' : 'outline'}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${app.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'Novas Candidaturas' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {app.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 bg-white">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="text-gray-500 flex items-center gap-2">
                                                <span className="text-xs uppercase tracking-wider text-gray-400">Enviada em</span>
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <WithdrawButton applicationId={app.id} />
                                                <Link href={`/jobs/${app.vaga_id}`}>
                                                    <Button variant="ghost" size="sm" className="text-fremc-blue hover:text-fremc-blue-dark hover:bg-fremc-blue/5">
                                                        Ver Detalhes
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="text-center py-16 border-dashed border-2 border-gray-200 bg-gray-50/50 rounded-2xl">
                                <CardContent className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Link href="/" className="text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                        </Link>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis e comece sua jornada.</p>
                                    <Link href="/">
                                        <Button className="bg-fremc-red hover:bg-fremc-red-dark h-12 px-8 rounded-xl shadow-lg shadow-fremc-red/20 text-white font-medium transition-all hover:scale-105">
                                            Ver Vagas Disponíveis
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="profile">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Informações Profissionais</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ProfileForm profile={profile} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            {/* Courses CTA */}
                            <Card className="bg-gradient-to-br from-fremc-blue to-fremc-blue-dark text-white border-0 shadow-lg overflow-hidden relative">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-fremc-red/20 rounded-full blur-xl"></div>

                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                            <GraduationCap className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg">Fremc Academy</h3>
                                    </div>
                                    <p className="text-blue-100 text-sm">
                                        Potencialize sua carreira com cursos exclusivos para o mercado Brasil-China.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 mb-6 text-sm text-blue-50">
                                        <li className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Mandarim para Negócios
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Cultura Corporativa Chinesa
                                        </li>
                                    </ul>
                                    <Button className="w-full bg-white text-fremc-blue hover:bg-blue-50 font-semibold border-0">
                                        Conhecer Cursos
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
