import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { avaliarDescricao, buscarDescricao, excluirDescricao, listarDescricoes } from "@/api/descricoes"
import type { DescricaoResposta } from "@/types/api"

import { chaves } from "./chaves"

// Histórico com rolagem infinita (10 por página)
export function useDescricoes() {
    return useInfiniteQuery({
        queryKey: chaves.descricoes,
        queryFn: ({ pageParam }) => listarDescricoes(pageParam),
        initialPageParam: 0,
        getNextPageParam: (ultima) =>
            ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
    })
}

export function useDescricao(id: number) {
    return useQuery({ queryKey: chaves.descricao(id), queryFn: () => buscarDescricao(id), enabled: id > 0 })
}

// Guarda no cache uma descrição que acabou de chegar do POST (a tela Resultado abre sem nova chamada)
export function useGuardarDescricao() {
    const queryClient = useQueryClient()
    return (descricao: DescricaoResposta) => {
        queryClient.setQueryData(chaves.descricao(descricao.id), descricao)
        queryClient.invalidateQueries({ queryKey: chaves.descricoes, exact: true })
    }
}

export function useAvaliarDescricao() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, util }: { id: number; util: boolean }) => avaliarDescricao(id, util),
        onSuccess: (descricao) => {
            queryClient.setQueryData(chaves.descricao(descricao.id), descricao)
            queryClient.invalidateQueries({ queryKey: chaves.descricoes, exact: true })
        },
    })
}

export function useExcluirDescricao() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: excluirDescricao,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: chaves.descricao(id) })
            queryClient.invalidateQueries({ queryKey: chaves.descricoes, exact: true })
        },
    })
}
