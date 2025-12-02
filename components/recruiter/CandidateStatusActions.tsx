"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateCandidateStatus } from "@/app/actions"
import { Loader2, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface CandidateStatusActionsProps {
    candidateId: string
    currentStatus: string
    stages: string[]
}

export function CandidateStatusActions({ candidateId, currentStatus, stages }: CandidateStatusActionsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleStatusChange = async (status: string) => {
        setLoading(status)
        await updateCandidateStatus(candidateId, status)
        setLoading(null)
        router.refresh()
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Mover para etapa:</p>
            {stages.map((stage) => (
                <Button
                    key={stage}
                    variant={currentStatus === stage ? "secondary" : "outline"}
                    className={`w-full justify-start ${currentStatus === stage ? "bg-fremc-blue/10 text-fremc-blue font-semibold" : ""}`}
                    onClick={() => handleStatusChange(stage)}
                    disabled={loading !== null}
                >
                    {loading === stage ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : currentStatus === stage ? (
                        <Check className="mr-2 h-4 w-4" />
                    ) : null}
                    {stage}
                </Button>
            ))}
        </div>
    )
}
