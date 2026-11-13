import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { buscarHistorico, buscarRelatoGestor, listarFila, mudarStatus } from "@/api/gestor"
import { listarRegioes, verificarSaude } from "@/api/regioes"
import type { StatusRelato, StatusRequisicao } from "@/types/api"

import { chaves } from "./chaves"

export function useFila(filtro: { status?: StatusRelato; regiaoId?: number }) {
    return useInfiniteQuery({
        queryKey: [...chaves.fila, filtro],
        queryFn: ({ pageParam }) => listarFila({ ...filtro, pagina: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (ultima) =>
            ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
    })
}

// Totais dos KPIs do topo da fila: só lemos o totalElementos de cada status
export function useTotalPorStatus(status: StatusRelato) {
    return useQuery({
        queryKey: [...chaves.fila, "total", status],
        queryFn: () => listarFila({ status, pagina: 0, tamanho: 1 }),
        select: (pagina) => pagina.totalElementos,
    })
}

export function useRelatoGestor(id: number) {
    return useQuery({
        queryKey: chaves.filaRelato(id),
        queryFn: () => buscarRelatoGestor(id),
        enabled: id > 0,
    })
}

export function useHistorico(id: number) {
    return useQuery({ queryKey: chaves.historico(id), queryFn: () => buscarHistorico(id), enabled: id > 0 })
}

export function useMudarStatus() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, corpo }: { id: number; corpo: StatusRequisicao }) => mudarStatus(id, corpo),
        onSuccess: (relato) => {
            queryClient.setQueryData(chaves.filaRelato(relato.id), relato)
            queryClient.invalidateQueries({ queryKey: chaves.fila })
        },
    })
}

export function useRegioes() {
    return useQuery({ queryKey: chaves.regioes, queryFn: listarRegioes, staleTime: Infinity })
}

export function useSaudeApi() {
    return useQuery({ queryKey: chaves.saude, queryFn: verificarSaude, retry: false })
}
