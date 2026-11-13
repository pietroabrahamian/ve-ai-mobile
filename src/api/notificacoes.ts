import type { NotificacaoResposta, Pagina } from "@/types/api"

import { api } from "./client"

export async function listarNotificacoes(params: { lida?: boolean; pagina?: number; tamanho?: number }) {
    const { data } = await api.get<Pagina<NotificacaoResposta>>("/notificacoes", {
        params: { lida: params.lida, page: params.pagina ?? 0, size: params.tamanho ?? 20 },
    })
    return data
}

export async function marcarComoLida(id: number) {
    const { data } = await api.patch<NotificacaoResposta>(`/notificacoes/${id}/lida`)
    return data
}
