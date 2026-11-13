import type {
    EdicaoRelatoRequisicao,
    Pagina,
    RegistroRelatoResposta,
    RelatoRequisicao,
    RelatoResposta,
} from "@/types/api"

import { api } from "./client"

// A chave de idempotência é gerada quando a pessoa confirma o envio e reaproveitada nas novas
// tentativas do mesmo envio: se o primeiro chegou, a API devolve a mesma resposta (guia 10.2)
export async function criarRelato(relato: RelatoRequisicao, chaveIdempotencia: string) {
    const { data } = await api.post<RegistroRelatoResposta>("/relatos", relato, {
        headers: { "Idempotency-Key": chaveIdempotencia },
    })
    return data
}

export async function listarMeusRelatos(pagina: number, tamanho = 10) {
    const { data } = await api.get<Pagina<RelatoResposta>>("/relatos/meus", {
        params: { page: pagina, size: tamanho },
    })
    return data
}

export async function buscarRelato(id: number) {
    const { data } = await api.get<RelatoResposta>(`/relatos/${id}`)
    return data
}

export async function editarRelato(id: number, edicao: EdicaoRelatoRequisicao) {
    const { data } = await api.put<RelatoResposta>(`/relatos/${id}`, edicao)
    return data
}

export async function excluirRelato(id: number) {
    await api.delete(`/relatos/${id}`)
}
