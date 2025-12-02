"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { updateCandidateStatus } from "@/app/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Candidate {
    id: string
    nome: string
    email: string
    score?: number
    cv_url?: string
    status?: string
}

interface KanbanBoardProps {
    jobId: string
    initialColumns: Record<string, Candidate[]>
    stages: string[]
}

export function KanbanBoard({ jobId, initialColumns, stages }: KanbanBoardProps) {
    const [columns, setColumns] = useState(initialColumns)
    const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null)
    const [draggedSourceStage, setDraggedSourceStage] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = (e: React.DragEvent, candidate: Candidate, sourceStage: string) => {
        setDraggedCandidate(candidate)
        setDraggedSourceStage(sourceStage)
        setIsDragging(true)
        // Set data for transfer (required for Firefox)
        e.dataTransfer.setData("text/plain", candidate.id)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault()
        setIsDragging(false)

        if (!draggedCandidate || !draggedSourceStage || draggedSourceStage === targetStage) {
            setDraggedCandidate(null)
            setDraggedSourceStage(null)
            return
        }

        await moveCandidate(draggedCandidate, draggedSourceStage, targetStage)
    }

    const moveCandidate = async (candidate: Candidate, sourceStage: string, targetStage: string) => {
        // Optimistic Update
        const candidateId = candidate.id
        const sourceList = [...columns[sourceStage]]
        const targetList = [...columns[targetStage]]

        // Remove from source
        const newSourceList = sourceList.filter(c => c.id !== candidateId)

        // Add to target (with updated status)
        const updatedCandidate = { ...candidate, status: targetStage }
        const newTargetList = [...targetList, updatedCandidate]

        setColumns(prev => ({
            ...prev,
            [sourceStage]: newSourceList,
            [targetStage]: newTargetList
        }))

        setDraggedCandidate(null)
        setDraggedSourceStage(null)

        // Server Action
        try {
            const result = await updateCandidateStatus(candidateId, targetStage)
            if (result.error) {
                throw new Error(result.error)
            }
            toast.success(`Candidato movido para ${targetStage}`)
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Erro ao mover candidato. Revertendo...")
            // Revert state on error
            setColumns(initialColumns) // This might be too aggressive, ideally revert only the move
        }
    }

    const handleArrowMove = (e: React.MouseEvent, candidate: Candidate, currentStage: string, direction: 'prev' | 'next') => {
        e.preventDefault() // Prevent Link navigation
        e.stopPropagation()

        const currentIndex = stages.indexOf(currentStage)
        if (currentIndex === -1) return

        const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
        if (targetIndex < 0 || targetIndex >= stages.length) return

        const targetStage = stages[targetIndex]
        moveCandidate(candidate, currentStage, targetStage)
    }

    const getScoreVariant = (score?: number) => {
        if (!score) return "outline"
        if (score >= 55) return "default"
        return "secondary"
    }

    const getScoreClass = (score?: number) => {
        if (!score) return "text-muted-foreground"
        if (score >= 55) return "bg-green-100 text-green-800 hover:bg-green-200"
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }

    return (
        <div className="flex gap-4 h-full min-w-[1000px] pb-4">
            {stages.map((stage, index) => (
                <div
                    key={stage}
                    className={`flex-1 flex flex-col bg-gray-100/50 rounded-lg p-4 h-full transition-colors ${isDragging ? 'border-2 border-dashed border-gray-300' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-fremc-blue">{stage}</h3>
                        <Badge variant="secondary" className="bg-fremc-blue/10 text-fremc-blue hover:bg-fremc-blue/20">
                            {columns[stage]?.length || 0}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[100px]">
                        {columns[stage]?.map((candidate) => (
                            <div
                                key={candidate.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, candidate, stage)}
                                className="cursor-grab active:cursor-grabbing group relative"
                            >
                                <Link href={`/recruiter/candidates/${candidate.id}`}>
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="font-medium mb-1">{candidate.nome}</div>
                                            <div className="text-xs text-muted-foreground mb-2 truncate">
                                                {candidate.email}
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                {candidate.score ? (
                                                    <Badge variant={getScoreVariant(candidate.score)} className={`text-xs ${getScoreClass(candidate.score)}`}>
                                                        Score: {candidate.score}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                                        Sem análise
                                                    </Badge>
                                                )}
                                                {candidate.cv_url && <FileText className="h-3 w-3 text-muted-foreground" />}
                                            </div>

                                            {/* Arrow Navigation - Visible on Hover */}
                                            <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === 0}
                                                    onClick={(e) => handleArrowMove(e, candidate, stage, 'prev')}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === stages.length - 1}
                                                    onClick={(e) => handleArrowMove(e, candidate, stage, 'next')}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
