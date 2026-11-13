import type { TokenResposta, UsuarioResposta } from "@/types/api"

import { api } from "./client"

export async function login(email: string, senha: string) {
    const { data } = await api.post<TokenResposta>("/auth/login", { email: email.trim(), senha })
    return data
}

// Cria uma conta de cidadão (gestores só existem pelo seed da API)
export async function registrar(nome: string, email: string, senha: string) {
    const { data } = await api.post<UsuarioResposta>("/auth/registrar", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
    })
    return data
}
