import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ApplicationForm } from "@/components/jobs/ApplicationForm"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface JobPageProps {
    params: Promise<{ id: string }>
}

export default async function JobPage({ params }: JobPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase
        .from("vagas")
        .select("*")
        .eq("id", id)
        .single()

    if (!job) {
        notFound()
    }

    // Check if user has already applied
    const { data: { user } } = await supabase.auth.getUser()
    let hasApplied = false

    if (user) {
        const { data: existingApplication } = await supabase
            .from("candidatos")
            .select("id")
            .eq("vaga_id", id)
            .eq("email", user.email)
            .single()

        if (existingApplication) {
            hasApplied = true
        }
    }

    // Fetch user profile
    let profile = null
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
        profile = data
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-fremc-blue mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para Vagas
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="bg-fremc-blue/10 text-fremc-blue hover:bg-fremc-blue/20">
                                Nova
                            </Badge>
                            <Badge variant="outline" className="text-gray-500 border-gray-200">
                                Tempo Integral
                            </Badge>
                        </div>

                        <h1 className="text-4xl font-bold text-fremc-blue-dark mb-6">{job.titulo}</h1>

                        <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Building2 className="h-5 w-5 text-fremc-blue" />
                                </div>
                                <span className="font-medium">{job.empresa}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-fremc-blue" />
                                </div>
                                <span className="font-medium">Publicado em {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-600">
                            <h3 className="text-xl font-bold text-fremc-blue-dark mb-4">Descrição da Vaga</h3>
                            <div className="whitespace-pre-wrap leading-relaxed mb-8">
                                {job.descricao}
                            </div>

                            <h3 className="text-xl font-bold text-fremc-blue-dark mb-4">Requisitos</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.requirements.map((req: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-sm py-1.5 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
                                        {req}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        {hasApplied ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-green-800 mb-2">Candidatura Recebida!</h3>
                                <p className="text-green-700 mb-6">
                                    Você já se candidatou para esta vaga. Acompanhe o status na sua área.
                                </p>
                                <Link href="/candidate">
                                    <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20">
                                        Ir para Minhas Candidaturas
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <ApplicationForm jobId={job.id} jobTitle={job.titulo} profile={profile} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
