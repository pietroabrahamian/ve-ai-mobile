import { isAxiosError } from "axios"

import type { ErroResposta } from "@/types/api"

// Toda resposta 4xx/5xx da API tem `mensagem` em português, escrita para ser lida em voz alta (guia 3).
// O app converte qualquer falha (HTTP, rede, timeout) para este formato único.
export class ErroApi extends Error {
    status: number // 0 = sem resposta (sem rede ou timeout)
    mensagem: string
    campos: Record<string, string>
    retryAfterSegundos: number | null

    constructor(
        status: number,
        mensagem: string,
        campos: Record<string, string> = {},
        retryAfter: number | null = null,
    ) {
        super(mensagem)
        this.status = status
        this.mensagem = mensagem
        this.campos = campos
        this.retryAfterSegundos = retryAfter
    }

    get semConexao() {
        return this.status === 0
    }
}

// Mensagens do guia (seção 14) para quando a API não manda uma
function mensagemPadrao(status: number) {
    if (status === 0) return "Sem conexão."
    if (status === 429) return "Muitas fotos em pouco tempo. Aguarde um pouco."
    if (status >= 500) return "Algo deu errado. Tente de novo."
    return "Não foi possível concluir. Tente de novo."
}

function camposDe(corpo: Partial<ErroResposta> | undefined) {
    const campos: Record<string, string> = {}
    for (const c of corpo?.campos ?? []) campos[c.campo] = c.mensagem
    return campos
}

// Converte o erro do Axios
export function paraErroApi(erro: unknown): ErroApi {
    if (erro instanceof ErroApi) return erro
    if (isAxiosError(erro)) {
        if (!erro.response) return new ErroApi(0, mensagemPadrao(0))
        const status = erro.response.status
        const corpo = erro.response.data as Partial<ErroResposta> | undefined
        const retry = Number(erro.response.headers?.["retry-after"])
        return new ErroApi(
            status,
            corpo?.mensagem || mensagemPadrao(status),
            camposDe(corpo),
            Number.isFinite(retry) ? retry : null,
        )
    }
    return new ErroApi(0, mensagemPadrao(0))
}

// Converte a resposta do fetch (usado só no envio de fotos, ver descricoes.ts)
export async function erroDeResposta(resposta: Response): Promise<ErroApi> {
    let corpo: Partial<ErroResposta> | undefined
    try {
        corpo = (await resposta.json()) as Partial<ErroResposta>
    } catch {
        corpo = undefined
    }
    const retry = Number(resposta.headers.get("Retry-After"))
    return new ErroApi(
        resposta.status,
        corpo?.mensagem || mensagemPadrao(resposta.status),
        camposDe(corpo),
        Number.isFinite(retry) && retry > 0 ? retry : null,
    )
}

export function mensagemDe(erro: unknown) {
    return paraErroApi(erro).mensagem
}
