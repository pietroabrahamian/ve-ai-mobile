import type { RegiaoResposta } from "@/types/api"

import { api } from "./client"

export async function listarRegioes() {
    const { data } = await api.get<RegiaoResposta[]>("/regioes")
    return data
}

interface Saude {
    status: string
    components?: Record<string, { status: string }>
}

// Usado na tela Sobre. O /health responde 503 quando uma parte está fora (por exemplo a IA),
// mas a API em si está no ar: por isso aceitamos qualquer resposta e olhamos as partes.
export async function verificarSaude() {
    const { data } = await api.get<Saude>("/health", { timeout: 15_000, validateStatus: () => true })
    return {
        api: true,
        ia: data?.components?.openai ? data.components.openai.status === "UP" : data?.status === "UP",
    }
}
