import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, Clock } from "lucide-react"

interface Job {
    id: string
    titulo: string
    empresa: string
    descricao: string
    requirements: string[]
    created_at: string
}

interface JobCardProps {
    job: Job
}

export function JobCard({ job }: JobCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-2xl overflow-hidden group">
            <CardHeader className="bg-white pb-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-fremc-blue-dark mb-2 line-clamp-2 group-hover:text-fremc-red transition-colors">
                            {job.titulo}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                            <Building2 className="h-4 w-4 text-fremc-gold" />
                            <span>{job.empresa}</span>
                        </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 bg-fremc-blue/10 text-fremc-blue hover:bg-fremc-blue/20">
                        Nova
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 bg-white">
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {job.descricao}
                </p>
                <div className="flex flex-wrap gap-2">
                    {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                            {req}
                        </Badge>
                    ))}
                    {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                            +{job.requirements.length - 3}
                        </Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-gray-100 bg-gray-50/50">
                <Link href={`/jobs/${job.id}`} className="w-full">
                    <Button className="w-full bg-fremc-blue hover:bg-fremc-blue-dark text-white shadow-md hover:shadow-lg transition-all rounded-xl">
                        Ver Detalhes
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
