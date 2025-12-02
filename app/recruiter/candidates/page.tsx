import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, User, Mail, Briefcase, Star } from "lucide-react"
import Link from "next/link"

export default async function CandidatePoolPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const query = q || ""

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    // Fetch all candidates with job details
    let queryBuilder = supabase
        .from("candidatos")
        .select("*, vagas(titulo, empresa)")
        .order("created_at", { ascending: false })

    // Apply search filter if query exists
    if (query) {
        // Search in name, email, or cv_text (skills)
        queryBuilder = queryBuilder.or(`nome.ilike.%${query}%,email.ilike.%${query}%,cv_texto.ilike.%${query}%`)
    }

    const { data: candidates } = await queryBuilder

    // Fetch profiles for these candidates to get skills
    let candidatesWithProfile = []
    if (candidates && candidates.length > 0) {
        const emails = candidates.map((c: any) => c.email).filter(Boolean)

        const { data: profiles } = await supabase
            .from("profiles")
            .select("email, skills, headline")
            .in("email", emails)

        // Map profiles to candidates
        candidatesWithProfile = candidates.map((c: any) => {
            const profile = profiles?.find((p: any) => p.email === c.email)
            return {
                ...c,
                profile_skills: profile?.skills || [],
                profile_headline: profile?.headline
            }
        })

        // Deduplicate by email AND name (keep the most recent one)
        const seenCandidates = new Set()
        candidatesWithProfile = candidatesWithProfile.filter((c: any) => {
            const key = `${c.email}-${c.nome}`
            if (seenCandidates.has(key)) {
                return false
            }
            seenCandidates.add(key)
            return true
        })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-fremc-blue-dark">Banco de Talentos</h1>
                    <p className="text-gray-600">Gerencie e pesquise todos os candidatos.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <form className="flex gap-2 w-full md:w-96">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                name="q"
                                defaultValue={query}
                                placeholder="Buscar por nome, email ou habilidade..."
                                className="pl-10 bg-white"
                            />
                        </div>
                        <Button type="submit" className="bg-fremc-blue hover:bg-fremc-blue-dark">
                            Buscar
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4">
                {candidatesWithProfile && candidatesWithProfile.length > 0 ? (
                    candidatesWithProfile.map((candidate: any) => (
                        <Link key={candidate.id} href={`/recruiter/candidates/${candidate.id}`}>
                            <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-fremc-blue">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-100 rounded-full">
                                                <User className="h-6 w-6 text-gray-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{candidate.nome}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                    <Mail className="h-3 w-3" />
                                                    {candidate.email}
                                                </div>
                                                {candidate.profile_headline && (
                                                    <div className="mb-3">
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            {candidate.profile_headline}
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {candidate.profile_skills && candidate.profile_skills.slice(0, 5).map((skill: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {candidate.profile_skills && candidate.profile_skills.length > 5 && (
                                                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                                                            +{candidate.profile_skills.length - 5}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.vagas && (
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            Vaga: {candidate.vagas.titulo}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
                                                        Fase: {candidate.status || "Novo"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-center gap-2">
                                            {candidate.score ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-500">Match IA</span>
                                                    <Badge variant={candidate.score >= 55 ? "default" : "secondary"} className={`text-sm py-1 px-3 ${candidate.score >= 55 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                                        {candidate.score}%
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Sem análise</span>
                                            )}
                                            <span className="text-xs text-gray-400">
                                                Aplicou em {new Date(candidate.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum candidato encontrado</h3>
                        <p className="text-gray-500">Tente buscar por outros termos ou habilidades.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
