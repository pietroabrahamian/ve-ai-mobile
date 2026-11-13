import { QueryClient } from "@tanstack/react-query"

import { ErroApi } from "./erros"

// Cache e estados de carregamento/erro das telas (aula 8: TanStack Query).
// Erros 4xx não melhoram tentando de novo; só repetimos uma vez falhas de rede e 5xx.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: (tentativas, erro) => {
                if (erro instanceof ErroApi && erro.status >= 400 && erro.status < 500) return false
                return tentativas < 1
            },
        },
        mutations: { retry: false },
    },
})
