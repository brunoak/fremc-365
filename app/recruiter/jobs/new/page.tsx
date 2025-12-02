"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2, Briefcase, Building2, FileText, List } from "lucide-react"
import Link from "next/link"

export default function NewJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [checkingCompany, setCheckingCompany] = useState(true)

    const [companies, setCompanies] = useState<any[]>([])
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
    const [companyName, setCompanyName] = useState("")

    const [titulo, setTitulo] = useState("")
    const [descricao, setDescricao] = useState("")
    const [requirements, setRequirements] = useState("")

    // Default stages
    const [stages, setStages] = useState<string[]>([
        "Cadastro",
        "Screening/Conversa com RH",
        "Entrevista Técnica",
        "Entrevista com o Cliente",
        "Carta Oferta",
        "Contratação"
    ])
    const [newStage, setNewStage] = useState("")

    // Check auth and companies on mount
    useEffect(() => {
        const checkAuthAndCompany = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            // Fetch user's companies
            const { data: companiesData } = await supabase
                .from("companies")
                .select("id, name")
                .eq("owner_id", user.id)
                .order("name")

            if (!companiesData || companiesData.length === 0) {
                alert("Você precisa criar um perfil de empresa antes de publicar uma vaga.")
                router.push("/recruiter/companies/new")
                return
            }

            setCompanies(companiesData)
            // Auto-select first company
            if (companiesData.length > 0) {
                setSelectedCompanyId(companiesData[0].id)
                setCompanyName(companiesData[0].name)
            }

            setCheckingAuth(false)
            setCheckingCompany(false)
        }
        checkAuthAndCompany()
    }, [router])

    // Update company name when selection changes
    const handleCompanyChange = (id: string) => {
        setSelectedCompanyId(id)
        const selected = companies.find(c => c.id === id)
        if (selected) {
            setCompanyName(selected.name)
        }
    }

    const handleAddStage = () => {
        if (newStage.trim()) {
            setStages([...stages, newStage.trim()])
            setNewStage("")
        }
    }

    const handleRemoveStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index))
    }

    const handleQuickAdd = (stageName: string) => {
        if (!stages.includes(stageName)) {
            // Insert before "Carta Oferta" if it exists, otherwise at the end
            const offerIndex = stages.indexOf("Carta Oferta")
            if (offerIndex !== -1) {
                const newStages = [...stages]
                newStages.splice(offerIndex, 0, stageName)
                setStages(newStages)
            } else {
                setStages([...stages, stageName])
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()

        // Parse requirements from comma/newline separated string
        const reqArray = requirements.split(/[\n,]/).map(s => s.trim()).filter(Boolean)

        const { error } = await supabase
            .from("vagas")
            .insert({
                titulo,
                empresa: companyName,
                descricao,
                requirements: reqArray,
                stages: stages,
                company_id: selectedCompanyId
            })

        if (!error) {
            router.push("/recruiter")
            router.refresh()
        } else {
            alert("Erro ao criar vaga: " + error.message)
        }
        setLoading(false)
    }

    if (checkingAuth || checkingCompany) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link href="/recruiter" className="flex items-center text-gray-500 hover:text-fremc-blue mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para o Painel
            </Link>

            <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden glass bg-white/80">
                <CardHeader className="bg-fremc-blue-dark text-white p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Briefcase className="h-6 w-6 text-fremc-gold" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Nova Vaga</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300 text-base">
                        Preencha os detalhes abaixo para publicar uma nova oportunidade.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-fremc-blue" />
                                    Título da Vaga
                                </label>
                                <Input
                                    required
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ex: Desenvolvedor Senior"
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-fremc-blue" />
                                    Empresa
                                </label>
                                <select
                                    required
                                    value={selectedCompanyId}
                                    onChange={(e) => handleCompanyChange(e.target.value)}
                                    className="h-12 w-full px-3 bg-gray-50 border border-gray-200 focus:bg-white transition-colors rounded-xl text-sm"
                                >
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecione a empresa para esta vaga.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-fremc-blue" />
                                Descrição
                            </label>
                            <textarea
                                required
                                className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-fremc-blue/20 focus:border-fremc-blue transition-all"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descrição detalhada da vaga, responsabilidades e benefícios..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <List className="h-4 w-4 text-fremc-blue" />
                                Requisitos
                            </label>
                            <textarea
                                className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-fremc-blue/20 focus:border-fremc-blue transition-all"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="Liste os requisitos separados por vírgula ou nova linha (Ex: Inglês fluente, React, Node.js)"
                            />
                        </div>

                        {/* Stages Editor */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <List className="h-4 w-4 text-fremc-blue" />
                                Etapas do Processo
                            </label>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs font-semibold text-gray-500 w-full mb-1">Adicionar Testes Rápidos:</span>
                                    {[
                                        "Teste de Lógica",
                                        "Teste de Inglês",
                                        "Teste de Mandarim",
                                        "Teste de Atenção Concentrada",
                                        "Teste DISC",
                                        "Teste de Fit Cultural"
                                    ].map(test => (
                                        <Button
                                            key={test}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickAdd(test)}
                                            className="text-xs bg-white hover:bg-fremc-blue/5 hover:text-fremc-blue border-dashed"
                                        >
                                            + {test}
                                        </Button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    {stages.map((stage, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm group">
                                            <div className="h-6 w-6 rounded-full bg-fremc-blue/10 text-fremc-blue flex items-center justify-center text-xs font-bold shrink-0">
                                                {index + 1}
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-gray-700">{stage}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveStage(index)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Remover
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={newStage}
                                        onChange={(e) => setNewStage(e.target.value)}
                                        placeholder="Nome da nova etapa..."
                                        className="h-10 bg-white"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddStage()
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddStage} variant="secondary">
                                        Adicionar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-fremc-red to-fremc-red-light hover:from-fremc-red-dark hover:to-fremc-red shadow-lg shadow-fremc-red/20 rounded-xl text-white font-bold transition-all hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Criando Vaga...
                                    </>
                                ) : (
                                    "Publicar Vaga"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
