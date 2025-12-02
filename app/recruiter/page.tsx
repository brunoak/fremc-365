"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, BarChart, Search, TrendingUp, Briefcase } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function RecruiterDashboard() {
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalCandidates: 0,
        candidatesPerJob: [] as any[],
        statusDistribution: [] as any[]
    })

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            // Fetch jobs with candidate counts
            const { data: jobsData } = await supabase
                .from("vagas")
                .select("*, candidatos(count)")
                .order("created_at", { ascending: false })

            if (jobsData) {
                setJobs(jobsData)

                // Calculate stats
                let total = 0
                const perJob = jobsData.map(job => {
                    const count = job.candidatos?.[0]?.count || 0
                    total += count
                    return {
                        name: job.titulo.substring(0, 15) + (job.titulo.length > 15 ? "..." : ""),
                        candidatos: count
                    }
                })

                // Fetch all candidates for status distribution
                const { data: candidates } = await supabase
                    .from("candidatos")
                    .select("status")

                const statusCounts: Record<string, number> = {}
                candidates?.forEach(c => {
                    const s = c.status || "Novo"
                    statusCounts[s] = (statusCounts[s] || 0) + 1
                })

                const distribution = Object.keys(statusCounts).map(key => ({
                    name: key,
                    value: statusCounts[key]
                }))

                setStats({
                    totalCandidates: total,
                    candidatesPerJob: perJob,
                    statusDistribution: distribution
                })
            }
            setLoading(false)
        }
        fetchData()
    }, [router])

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-fremc-blue-dark mb-2">Painel do Recrutador</h1>
                    <p className="text-gray-600">Gerencie suas vagas e acompanhe os melhores talentos.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/recruiter/candidates">
                        <Button variant="outline" className="h-12 px-6 rounded-xl gap-2 border-fremc-blue text-fremc-blue hover:bg-fremc-blue/5">
                            <Search className="h-5 w-5" />
                            Banco de Talentos
                        </Button>
                    </Link>
                    <Link href="/recruiter/jobs/new">
                        <Button className="bg-gradient-to-r from-fremc-red to-fremc-red-light hover:from-fremc-red-dark hover:to-fremc-red h-12 px-6 rounded-xl shadow-lg shadow-fremc-red/20 text-white font-medium transition-all hover:scale-105 gap-2">
                            <Plus className="h-5 w-5" />
                            Nova Vaga
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="md:col-span-2 border-0 shadow-md rounded-xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart className="h-5 w-5 text-fremc-blue" />
                            Candidatos por Vaga
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={stats.candidatesPerJob}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="candidatos" fill="#003366" radius={[4, 4, 0, 0]} barSize={40} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-fremc-blue" />
                            Status do Funil
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-[-20px]">
                            <div className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Candidatos</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md rounded-xl overflow-hidden flex flex-col justify-center items-center bg-gradient-to-br from-fremc-blue to-fremc-blue-dark text-white">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="p-4 bg-white/10 rounded-full mb-4">
                            <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-5xl font-bold mb-2">{jobs.length}</div>
                        <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Vagas Ativas</div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Suas Vagas</h2>
            <div className="grid gap-6">
                {jobs && jobs.map((job: any) => (
                    <Card key={job.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                            <div>
                                <CardTitle className="text-xl font-bold text-fremc-blue group-hover:text-fremc-red transition-colors mb-1">
                                    {job.titulo}
                                </CardTitle>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4 text-fremc-gold" />
                                    {job.empresa}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/recruiter/jobs/${job.id}/kanban`}>
                                    <Button variant="outline" size="sm" className="gap-2 border-gray-200 hover:border-fremc-blue hover:text-fremc-blue hover:bg-fremc-blue/5 transition-all">
                                        <BarChart className="h-4 w-4" />
                                        Kanban
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Users className="h-4 w-4 text-fremc-blue" />
                                        <span className="font-semibold text-gray-900">{job.candidatos?.[0]?.count || 0}</span>
                                        <span className="text-gray-500">Candidatos</span>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        Criada em {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/jobs/${job.id}`}>
                                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-fremc-blue hover:bg-blue-50">
                                            Ver Vaga
                                        </Button>
                                    </Link>
                                    <Link href={`/recruiter/jobs/${job.id}/edit`}>
                                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-fremc-blue hover:bg-blue-50">
                                            Editar Vaga
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!jobs || jobs.length === 0) && (
                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                            <Plus className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga criada</h3>
                        <p className="text-gray-500 mb-8">Comece criando sua primeira vaga para atrair talentos.</p>
                        <Link href="/recruiter/jobs/new">
                            <Button className="bg-fremc-red hover:bg-fremc-red-dark">
                                Criar Primeira Vaga
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
