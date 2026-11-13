import type { UsuarioResposta } from "@/types/api"

import { api } from "./client"

export async function buscarPerfil() {
    const { data } = await api.get<UsuarioResposta>("/usuarios/me")
    return data
}

// É um PUT: manda sempre os dois campos (guia 4.4)
export async function salvarPreferencias(velocidadeVoz: number, perguntaLivreAtiva: boolean) {
    const { data } = await api.put<UsuarioResposta>("/usuarios/me/preferencias", {
        velocidadeVoz,
        perguntaLivreAtiva,
    })
    return data
}
