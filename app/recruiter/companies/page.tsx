"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Plus, Globe, ArrowRight, Briefcase } from "lucide-react"
import Link from "next/link"
import { getCompanies } from "@/app/actions"
import Image from "next/image"

export default function CompaniesListPage() {
    const [companies, setCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCompanies = async () => {
            const data = await getCompanies()
            setCompanies(data)
            setLoading(false)
        }
        loadCompanies()
    }, [])

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Minhas Empresas</h1>
                    <p className="text-gray-500 mt-2">Gerencie os perfis das empresas que você recruta.</p>
                </div>
                <Link href="/recruiter/companies/new">
                    <Button className="bg-fremc-blue hover:bg-fremc-blue-dark text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Empresa
                    </Button>
                </Link>
            </div>

            {companies.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            Cadastre sua primeira empresa para começar a publicar vagas vinculadas a ela.
                        </p>
                        <Link href="/recruiter/companies/new">
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Cadastrar Empresa
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <Card key={company.id} className="hover:shadow-lg transition-all duration-300 group overflow-hidden border-0 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 relative bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                                        {company.logo_url ? (
                                            <Image
                                                src={company.logo_url}
                                                alt={company.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-gray-300" />
                                        )}
                                    </div>
                                    <Link href={`/companies/${company.id}`} target="_blank">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-fremc-blue" title="Ver Página Pública">
                                            <Globe className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <CardTitle className="mt-4 text-xl font-bold text-gray-900 truncate">
                                    {company.name}
                                </CardTitle>
                                {company.website && (
                                    <CardDescription className="truncate">
                                        {company.website.replace(/^https?:\/\//, '')}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex gap-2">
                                    <Link href={`/recruiter/companies/${company.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full group-hover:border-fremc-blue group-hover:text-fremc-blue transition-colors">
                                            Editar Perfil
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
