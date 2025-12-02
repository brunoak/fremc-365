"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { withdrawApplication } from "@/app/actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog"
import { toast } from "sonner"

interface WithdrawButtonProps {
    applicationId: string
}

export function WithdrawButton({ applicationId }: WithdrawButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleWithdraw() {
        setIsLoading(true)
        try {
            const result = await withdrawApplication(applicationId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Candidatura retirada com sucesso.")
            }
        } catch (error) {
            toast.error("Erro ao retirar candidatura.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desistir da Vaga
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Você será removido do processo seletivo desta vaga.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleWithdraw} className="bg-red-600 hover:bg-red-700">
                        {isLoading ? "Processando..." : "Sim, desistir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
