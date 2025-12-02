"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateProfile, parseResume } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Upload, FileText } from "lucide-react"
import { extractTextFromPDF } from "@/lib/pdf-utils"

interface ProfileFormProps {
    profile: any
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // State for form fields to allow auto-fill updates
    const [fullName, setFullName] = useState(profile?.full_name || "")
    const [headline, setHeadline] = useState(profile?.headline || "")
    const [summary, setSummary] = useState(profile?.summary || "")
    const [skills, setSkills] = useState(profile?.skills?.join(", ") || "")
    const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "")
    const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || "")

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== "application/pdf") {
            toast.error("Por favor, envie apenas arquivos PDF.")
            return
        }

        setIsParsing(true)
        try {
            toast.info("Lendo currículo...")
            const text = await extractTextFromPDF(file)

            toast.info("Analisando dados com IA...")
            const formData = new FormData()
            formData.append("file", file)
            formData.append("cvText", text)

            const result = await parseResume(formData)

            if (result.error) {
                toast.error(result.error)
            } else if (result.data) {
                const data = result.data
                if (data.full_name) setFullName(data.full_name)
                if (data.headline) setHeadline(data.headline)
                if (data.summary) setSummary(data.summary)
                if (data.skills && Array.isArray(data.skills)) setSkills(data.skills.join(", "))
                if (data.linkedin_url) setLinkedinUrl(data.linkedin_url)
                if (data.portfolio_url) setPortfolioUrl(data.portfolio_url)

                toast.success("Dados extraídos com sucesso! Revise antes de salvar.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao processar o arquivo.")
        } finally {
            setIsParsing(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateProfile(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Perfil atualizado com sucesso!")
            }
        } catch (error) {
            toast.error("Erro ao atualizar perfil.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-fremc-blue">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-fremc-blue-dark mb-1">Preencher com Currículo</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Envie seu CV em PDF e nossa IA preencherá os campos automaticamente para você.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isParsing}
                                className="bg-white hover:bg-blue-50 border-blue-200 text-fremc-blue"
                            >
                                {isParsing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Carregar PDF
                                    </>
                                )}
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="headline">Título Profissional</Label>
                        <Input
                            id="headline"
                            name="headline"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="Ex: Desenvolvedor Full Stack"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="summary">Resumo Profissional</Label>
                    <Textarea
                        id="summary"
                        name="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Conte um pouco sobre sua experiência..."
                        className="h-32"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                    <Input
                        id="skills"
                        name="skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Ex: React, Node.js, TypeScript"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="portfolio_url">Portfólio URL</Label>
                        <Input
                            id="portfolio_url"
                            name="portfolio_url"
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://seu-portfolio.com"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="bg-fremc-blue hover:bg-fremc-blue-dark">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </div>
    )
}
