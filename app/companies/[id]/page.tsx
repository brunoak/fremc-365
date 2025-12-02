import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, MapPin, Users, Briefcase, ArrowRight } from "lucide-react"

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch company details
    const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single()

    if (!company) notFound()

    // Fetch active jobs for this company
    const { data: jobs } = await supabase
        .from("vagas")
        .select("*")
        .eq("company_id", id)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-32 h-32 md:w-40 md:h-40 relative bg-white rounded-2xl shadow-xl p-4 flex items-center justify-center border border-gray-100">
                            {company.logo_url ? (
                                <Image
                                    src={company.logo_url}
                                    alt={company.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <Building2 className="w-16 h-16 text-gray-300" />
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{company.name}</h1>
                            {company.website && (
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-fremc-blue hover:text-fremc-blue-dark font-medium transition-colors"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {company.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-fremc-blue" />
                                Sobre a Empresa
                            </h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {company.description || "Nenhuma descrição disponível."}
                            </div>
                        </section>

                        {/* Culture Section */}
                        {company.culture_text && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-fremc-red" />
                                    Nossa Cultura
                                </h2>
                                <div className="bg-fremc-blue/5 rounded-2xl p-8 border border-fremc-blue/10">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                                        "{company.culture_text}"
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Jobs Section */}
                        <section id="jobs">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-fremc-gold" />
                                Vagas Abertas ({jobs?.length || 0})
                            </h2>

                            <div className="grid gap-4">
                                {jobs && jobs.length > 0 ? (
                                    jobs.map((job: any) => (
                                        <Link key={job.id} href={`/jobs/${job.id}`}>
                                            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-fremc-blue group">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-fremc-blue transition-colors mb-2">
                                                                {job.titulo}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {job.localizacao || "Remoto / Híbrido"}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Briefcase className="w-4 h-4" />
                                                                    {job.tipo_contrato || "CLT"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="text-fremc-blue hover:bg-fremc-blue/5">
                                                            Ver Detalhes <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900">Nenhuma vaga aberta no momento</h3>
                                        <p className="text-gray-500">Fique de olho, novas oportunidades podem surgir em breve!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-24 border-0 shadow-lg bg-fremc-blue-dark text-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fremc-red/20 rounded-full -ml-12 -mb-12 blur-xl" />

                            <CardContent className="p-8 relative z-10">
                                <h3 className="text-xl font-bold mb-4">Interessado?</h3>
                                <p className="text-gray-300 mb-6">
                                    Confira as vagas abertas e faça parte do nosso time. Estamos sempre em busca de talentos!
                                </p>
                                <Button
                                    className="w-full bg-white text-fremc-blue-dark hover:bg-gray-100 font-bold"
                                    asChild
                                >
                                    <a href="#jobs">Ver Vagas</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
