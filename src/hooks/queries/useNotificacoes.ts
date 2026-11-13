import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { listarNotificacoes, marcarComoLida } from "@/api/notificacoes"

import { chaves } from "./chaves"

// Não há push: o app consulta as não lidas ao abrir, ao voltar para o primeiro plano e a cada
// 60 s numa tela parada (guia 11). Quem chama passa `ativo = false` durante o modo automático.
const INTERVALO_CONSULTA_MS = 60_000

export function useNaoLidas(ativo: boolean) {
    return useQuery({
        queryKey: chaves.naoLidas,
        queryFn: () => listarNotificacoes({ lida: false, tamanho: 5 }),
        enabled: ativo,
        refetchInterval: ativo ? INTERVALO_CONSULTA_MS : false,
    })
}

export function useNotificacoes() {
    return useQuery({ queryKey: chaves.notificacoes, queryFn: () => listarNotificacoes({ tamanho: 30 }) })
}

export function useMarcarLida() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: marcarComoLida,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.notificacoes }),
    })
}
