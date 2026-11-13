import type { RegiaoResposta } from "@/types/api"

import { api } from "./client"

export async function listarRegioes() {
    const { data } = await api.get<RegiaoResposta[]>("/regioes")
    return data
}

// Usado na tela Sobre para mostrar se a API está no ar
export async function verificarSaude() {
    const { data } = await api.get<{ status: string }>("/health", { timeout: 10_000 })
    return data
}
