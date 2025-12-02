"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Briefcase, Building2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SearchHero() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState("")
    const [type, setType] = useState("job") // 'job' or 'company'

    useEffect(() => {
        const q = searchParams.get("q")
        const t = searchParams.get("type")
        if (q) setQuery(q)
        if (t === "job" || t === "company") setType(t)
    }, [searchParams])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (type) params.set("type", type)

        router.push(`/?${params.toString()}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="flex justify-center">
                <Tabs value={type} onValueChange={(val) => setType(val)} className="w-auto">
                    <TabsList className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-full">
                        <TabsTrigger
                            value="job"
                            className="rounded-full px-6 data-[state=active]:bg-fremc-gold data-[state=active]:text-fremc-blue-dark text-white hover:bg-white/10 transition-all"
                        >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Vagas
                        </TabsTrigger>
                        <TabsTrigger
                            value="company"
                            className="rounded-full px-6 data-[state=active]:bg-fremc-gold data-[state=active]:text-fremc-blue-dark text-white hover:bg-white/10 transition-all"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Empresas
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-fremc-gold transition-colors" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={type === 'job' ? "Busque por cargo, tecnologia ou palavra-chave..." : "Busque pelo nome da empresa..."}
                        className="pl-12 border-0 bg-white/90 focus-visible:ring-0 text-gray-900 placeholder:text-gray-500 h-14 rounded-xl text-lg shadow-inner"
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    size="lg"
                    className="bg-fremc-red hover:bg-fremc-red-dark h-14 px-10 rounded-xl text-lg font-bold shadow-lg shadow-fremc-red/30 transition-all hover:scale-105"
                >
                    Buscar {type === 'job' ? 'Vagas' : 'Empresas'}
                </Button>
            </div>
        </div>
    )
}
