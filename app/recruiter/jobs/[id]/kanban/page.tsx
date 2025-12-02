import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { KanbanBoard } from "@/components/recruiter/KanbanBoard"

interface KanbanPageProps {
    params: Promise<{ id: string }>
}

export default async function KanbanPage({ params }: KanbanPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    // Fetch job details
    const { data: job } = await supabase
        .from("vagas")
        .select("*")
        .eq("id", id)
        .single()

    if (!job) notFound()

    // Fetch candidates
    const { data: candidates } = await supabase
        .from("candidatos")
        .select("*")
        .eq("vaga_id", id)

    // Use job stages or fallback to default
    const jobStages: string[] = job.stages || [
        "Novas Candidaturas",
        "Em Análise",
        "Entrevista",
        "Aprovado",
        "Reprovado"
    ]

    // Group candidates by status
    const columns: Record<string, any[]> = {}
    jobStages.forEach(col => columns[col] = [])

    candidates?.forEach(candidate => {
        const status = candidate.status || jobStages[0]
        if (columns[status]) {
            columns[status].push(candidate)
        } else {
            // If status doesn't match any column (maybe stage was removed), put in first column
            if (!columns[jobStages[0]]) columns[jobStages[0]] = []
            columns[jobStages[0]].push(candidate)
        }
    })

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/recruiter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-fremc-blue-dark">{job.titulo}</h1>
                    <p className="text-muted-foreground text-sm">{job.empresa}</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <KanbanBoard jobId={id} initialColumns={columns} stages={jobStages} />
            </div>
        </div>
    )
}
