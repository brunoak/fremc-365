"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Globe, FileText, Save, Loader2, ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { createCompany } from "@/app/actions"
import { toast } from "sonner"

export default function NewCompanyPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [website, setWebsite] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [cultureText, setCultureText] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("description", description)
        formData.append("website", website)
        formData.append("logo_url", logoUrl)
        formData.append("culture_text", cultureText)

        const result = await createCompany(formData)

        if (result.success) {
            toast.success("Empresa criada com sucesso!")
            router.push("/recruiter/companies")
            router.refresh()
        } else {
            toast.error(result.error || "Erro ao criar empresa.")
        }
        setSaving(false)
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link href="/recruiter/companies" className="flex items-center text-gray-500 hover:text-fremc-blue mb-8 transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para Minhas Empresas
            </Link>

            <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden glass bg-white/80">
                <CardHeader className="bg-fremc-blue-dark text-white p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Building2 className="h-6 w-6 text-fremc-gold" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Nova Empresa</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300 text-base">
                        Cadastre uma nova empresa para gerenciar suas vagas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-fremc-blue" />
                                Nome da Empresa
                            </label>
                            <Input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Tech Solutions Inc."
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-fremc-blue" />
                                    Website
                                </label>
                                <Input
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://suaempresa.com"
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-fremc-blue" />
                                    URL do Logo
                                </label>
                                <Input
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://.../logo.png"
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-fremc-blue" />
                                Sobre a Empresa
                            </label>
                            <textarea
                                className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-fremc-blue/20 focus:border-fremc-blue transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Conte um pouco sobre a história e missão da sua empresa..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Heart className="h-4 w-4 text-fremc-red" />
                                Cultura e Valores (Fit Cultural)
                            </label>
                            <textarea
                                className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-fremc-blue/20 focus:border-fremc-blue transition-all"
                                value={cultureText}
                                onChange={(e) => setCultureText(e.target.value)}
                                placeholder="Descreva a cultura da empresa. Isso será usado pela IA para avaliar o Fit Cultural dos candidatos."
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-fremc-blue to-fremc-blue-dark hover:from-fremc-blue-dark hover:to-fremc-blue shadow-lg shadow-fremc-blue/20 rounded-xl text-white font-bold transition-all hover:scale-[1.02]"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Criar Empresa
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
