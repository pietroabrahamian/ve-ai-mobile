import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { buscarRelato, criarRelato, editarRelato, excluirRelato, listarMeusRelatos } from "@/api/relatos"
import type { EdicaoRelatoRequisicao, RelatoRequisicao } from "@/types/api"

import { chaves } from "./chaves"

export function useMeusRelatos() {
    return useInfiniteQuery({
        queryKey: chaves.relatos,
        queryFn: ({ pageParam }) => listarMeusRelatos(pageParam),
        initialPageParam: 0,
        getNextPageParam: (ultima) =>
            ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
    })
}

export function useRelato(id: number) {
    return useQuery({ queryKey: chaves.relato(id), queryFn: () => buscarRelato(id), enabled: id > 0 })
}

export function useCriarRelato() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ relato, chave }: { relato: RelatoRequisicao; chave: string }) =>
            criarRelato(relato, chave),
        onSuccess: (registro) => {
            queryClient.setQueryData(chaves.relato(registro.relato.id), registro.relato)
            queryClient.invalidateQueries({ queryKey: chaves.relatos, exact: true })
        },
    })
}

export function useEditarRelato() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, edicao }: { id: number; edicao: EdicaoRelatoRequisicao }) =>
            editarRelato(id, edicao),
        onSuccess: (relato) => {
            queryClient.setQueryData(chaves.relato(relato.id), relato)
            queryClient.invalidateQueries({ queryKey: chaves.relatos, exact: true })
        },
    })
}

export function useExcluirRelato() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: excluirRelato,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: chaves.relato(id) })
            queryClient.invalidateQueries({ queryKey: chaves.relatos, exact: true })
        },
    })
}
