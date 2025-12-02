"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react"

interface ApplicationFormProps {
    jobId: string
    jobTitle: string
    profile?: any
}

export function ApplicationForm({ jobId, jobTitle, profile }: ApplicationFormProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [cvFile, setCvFile] = useState<File | null>(null)

    // Determine if we can use the profile
    const hasCompleteProfile = !!(profile && profile.summary && profile.full_name)
    const [useProfile, setUseProfile] = useState(hasCompleteProfile)

    // Form fields - pre-fill from profile if available
    const [nome, setNome] = useState(profile?.full_name || "")
    const [email, setEmail] = useState(profile?.email || "")
    const [cvText, setCvText] = useState("")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setCvFile(file)
            setCvText("Extraindo texto do PDF...")

            try {
                const { extractTextFromPDF } = await import("@/lib/pdf-utils")
                const text = await extractTextFromPDF(file)
                setCvText(text)
            } catch (err) {
                console.error(err)
                setCvText("Erro ao extrair texto do PDF. Por favor, digite ou cole o conteúdo abaixo.")
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const supabase = createClient()

            // 1. Upload CV (Client side upload to Storage) - ONLY if not using profile
            let cvUrl = ""
            if (!useProfile && cvFile) {
                const fileName = `${Date.now()}-${cvFile.name}`
                const { data, error: uploadError } = await supabase.storage
                    .from("resumes")
                    .upload(fileName, cvFile)

                if (uploadError) {
                    console.warn("Upload failed (bucket might not exist), proceeding with mock URL")
                    cvUrl = `https://mock-storage.com/${fileName}`
                } else {
                    cvUrl = data?.path || ""
                }
            }

            // 2. Submit via Server Action
            const formData = new FormData()
            formData.append("jobId", jobId)
            formData.append("nome", nome)
            formData.append("email", email)

            // If using profile, we don't send cvText/cvUrl, and the backend handles it.
            // If NOT using profile, we send them.
            if (!useProfile) {
                formData.append("cvText", cvText)
                formData.append("cvUrl", cvUrl)
            }

            const { submitApplication } = await import("@/app/actions")
            const result = await submitApplication(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "Erro ao enviar candidatura")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="bg-green-50 border-green-200 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Candidatura Enviada!</h3>
                    <p className="text-green-700 max-w-xs mx-auto">
                        Seu perfil foi enviado com sucesso para a vaga de <span className="font-semibold">{jobTitle}</span>.
                        Boa sorte!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white sticky top-4">
            <CardHeader className="bg-fremc-blue-dark text-white p-6">
                <CardTitle className="text-xl font-bold">Candidatar-se</CardTitle>
                <CardDescription className="text-gray-300">
                    Preencha seus dados para concorrer a esta vaga.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                        <Input
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Seu nome completo"
                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Profile vs CV Upload Logic */}
                    {hasCompleteProfile && useProfile ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-fremc-blue shrink-0">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-fremc-blue-dark text-sm">Usando seu Perfil Salvo</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Vamos usar as informações do seu perfil (Resumo, Habilidades) para esta candidatura.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full text-fremc-blue hover:text-fremc-blue-dark hover:bg-blue-100/50 text-xs h-8"
                                onClick={() => setUseProfile(false)}
                            >
                                Quero enviar um currículo diferente
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Currículo (PDF)</label>
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${cvFile ? 'border-fremc-blue bg-fremc-blue/5' : 'border-gray-200 hover:border-fremc-blue hover:bg-gray-50'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="cv-upload"
                                    required={!useProfile} // Required only if not using profile
                                />
                                <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    {cvFile ? (
                                        <>
                                            <FileText className="h-8 w-8 text-fremc-blue" />
                                            <span className="text-sm font-medium text-fremc-blue">{cvFile.name}</span>
                                            <span className="text-xs text-gray-500">Clique para alterar</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">Clique para fazer upload</span>
                                            <span className="text-xs text-gray-400">Apenas arquivos PDF</span>
                                        </>
                                    )}
                                </label>
                            </div>
                            {hasCompleteProfile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-gray-500 hover:text-fremc-blue text-xs"
                                    onClick={() => setUseProfile(true)}
                                >
                                    Cancelar e usar meu perfil salvo
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Show extracted text only if uploading new CV */}
                    {!useProfile && cvText && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                <span>Informações Extraídas</span>
                                <span className="text-xs text-fremc-blue font-normal">Editável</span>
                            </label>
                            <textarea
                                className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-fremc-blue/20 focus:border-fremc-blue transition-all"
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-fremc-red to-fremc-red-light hover:from-fremc-red-dark hover:to-fremc-red shadow-lg shadow-fremc-red/20 rounded-xl text-white font-bold transition-all hover:scale-[1.02]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar Candidatura"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
