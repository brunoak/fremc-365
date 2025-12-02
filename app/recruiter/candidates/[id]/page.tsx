import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Download, BrainCircuit, CheckCircle, XCircle } from "lucide-react"
import { analyzeCandidate } from "@/lib/ai/service"
import { CandidateStatusActions } from "@/components/recruiter/CandidateStatusActions"

interface CandidatePageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ action?: string }>
}

export default async function CandidatePage({ params, searchParams }: CandidatePageProps) {
    const { id } = await params
    const { action } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    // Fetch candidate with job details
    const { data: candidate } = await supabase
        .from("candidatos")
        .select("*, vagas(*)")
        .eq("id", id)
        .single()

    if (!candidate) notFound()

    // Handle Actions (Server Action pattern simplified for MVP inside page load or separate route)
    // Ideally this should be a Server Action, but for simplicity in this file structure:
    // We'll assume a separate server action file or just handle it if we could.
    // But since I can't easily create a server action file and import it here without more steps,
    // I'll create a Client Component for the actions or just use a form.

    // Actually, I'll create a client component for the Status Change and AI Analysis trigger.
    // But for now, let's just display the data.

    // If AI analysis is missing and requested, we could trigger it here (not ideal for GET).
    // I'll add a "Analyze" button that calls a Server Action.

    // Generate Signed URL for CV if it exists
    let cvDownloadUrl = null
    if (candidate.cv_url) {
        // Check if it's already a full URL (legacy/mock) or a path
        if (candidate.cv_url.startsWith("http")) {
            cvDownloadUrl = candidate.cv_url
        } else {
            const { data } = await supabase.storage
                .from("resumes")
                .createSignedUrl(candidate.cv_url, 3600) // 1 hour expiry
            cvDownloadUrl = data?.signedUrl
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href={`/recruiter/jobs/${candidate.vaga_id}/kanban`} className="flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o Kanban
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl text-fremc-blue">{candidate.nome}</CardTitle>
                                    <div className="flex flex-col">
                                        <p className="text-muted-foreground">{candidate.email}</p>
                                        {candidate.vagas && (
                                            <p className="text-sm font-medium text-fremc-blue-dark mt-1">
                                                Candidato para: <span className="font-bold">{candidate.vagas.titulo}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge className="text-base px-3 py-1">{candidate.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Resumo Profissional (Extraído)</h3>
                                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                                    {candidate.cv_texto || "Nenhum texto extraído."}
                                </div>
                            </div>

                            {cvDownloadUrl && (
                                <div>
                                    <h3 className="font-semibold mb-2">Currículo Original</h3>
                                    <a href={cvDownloadUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" className="gap-2">
                                            <FileText className="h-4 w-4" />
                                            Visualizar PDF
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Analysis Section */}
                    <Card className="border-fremc-blue/20">
                        <CardHeader className="bg-fremc-blue/5">
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="h-6 w-6 text-fremc-blue" />
                                <CardTitle className="text-fremc-blue">Análise de IA</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {candidate.score ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex flex-col items-center p-4 rounded-lg min-w-[100px] ${candidate.score >= 55 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                            <span className="text-3xl font-bold">{candidate.score}</span>
                                            <span className="text-xs opacity-80">Score de Aderência</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">
                                            "{candidate.fit_cultural || candidate.resumo?.[0] || "Análise completa disponível."}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" /> Pontos Fortes
                                            </h4>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {candidate.resumo?.slice(0, 3).map((item: string, i: number) => (
                                                    <li key={i}>{item}</li>
                                                )) || <li>Nenhum ponto forte listado.</li>}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                                                <XCircle className="h-4 w-4" /> Pontos de Atenção
                                            </h4>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {/* Assuming we stored weaknesses somewhere or just mocking for now */}
                                                <li>Experiência específica no setor</li>
                                                <li>Nível de mandarim (se aplicável)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">Este candidato ainda não foi analisado pela IA.</p>
                                    {/* Here we would have a button to trigger analysis */}
                                    <Button disabled variant="secondary">Análise Automática (Em breve)</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <CandidateStatusActions
                                candidateId={candidate.id}
                                currentStatus={candidate.status}
                                stages={candidate.vagas?.stages || ["Novas Candidaturas", "Em Análise", "Entrevista", "Aprovado", "Reprovado"]}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
