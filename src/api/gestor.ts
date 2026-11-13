import type { AtualizacaoResposta, Pagina, RelatoResposta, StatusRelato, StatusRequisicao } from "@/types/api"

import { api } from "./client"

// A fila já vem ordenada pela prioridade (maior primeiro) e só traz as regiões do gestor (guia 12.1)
export async function listarFila(params: {
    status?: StatusRelato
    regiaoId?: number
    pagina: number
    tamanho?: number
}) {
    const { data } = await api.get<Pagina<RelatoResposta>>("/gestor/relatos", {
        params: {
            status: params.status,
            regiaoId: params.regiaoId,
            page: params.pagina,
            size: params.tamanho ?? 10,
        },
    })
    return data
}

export async function buscarRelatoGestor(id: number) {
    const { data } = await api.get<RelatoResposta>(`/gestor/relatos/${id}`)
    return data
}

export async function buscarHistorico(id: number) {
    const { data } = await api.get<AtualizacaoResposta[]>(`/gestor/relatos/${id}/historico`)
    return data
}

export async function mudarStatus(id: number, corpo: StatusRequisicao) {
    const { data } = await api.patch<RelatoResposta>(`/gestor/relatos/${id}/status`, corpo)
    return data
}
