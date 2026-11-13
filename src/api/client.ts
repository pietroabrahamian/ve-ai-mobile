import { create } from "axios"

import { paraErroApi } from "./erros"

// URL da API (Java do Lucas ou .NET do Lucca, mesmo contrato), lida do .env.
// Na versão publicada é sempre HTTPS (feedback do professor no PetFlow). HTTP só com a API local.
export const URL_API = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "")

// Tempo máximo de qualquer chamada (guia 5.3)
export const TIMEOUT_MS = 30_000

// O token fica guardado no SecureStore (services/armazenamento.ts). Aqui guardamos só uma cópia
// em memória para não ler o SecureStore a cada requisição.
let tokenAtual: string | null = null
let aoSessaoExpirar: (() => void) | null = null

export function definirToken(token: string | null) {
    tokenAtual = token
}

export function lerToken() {
    return tokenAtual
}

// O AuthContext registra aqui o que fazer quando a API responde 401 (limpar a sessão e ir ao login)
export function quandoSessaoExpirar(acao: () => void) {
    aoSessaoExpirar = acao
}

export function avisarSessaoExpirada() {
    aoSessaoExpirar?.()
}

export const api = create({ baseURL: URL_API, timeout: TIMEOUT_MS })

api.interceptors.request.use((config) => {
    if (tokenAtual) config.headers.Authorization = `Bearer ${tokenAtual}`
    return config
})

api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        const erroApi = paraErroApi(erro)
        // 401 fora do login = token vencido ou inválido: a sessão acaba (guia 3)
        const ehLogin = String(erro?.config?.url ?? "").includes("/auth/")
        if (erroApi.status === 401 && !ehLogin) avisarSessaoExpirada()
        return Promise.reject(erroApi)
    },
)
