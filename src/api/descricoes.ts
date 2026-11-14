import { File } from "expo-file-system"

import type { DescricaoResposta, ModoDescricao, Pagina } from "@/types/api"

import { URL_API, TIMEOUT_MS, api, avisarSessaoExpirada, lerToken } from "./client"
import { ErroApi, erroDeResposta } from "./erros"

// O envio de fotos usa fetch, e não o Axios, como no exemplo do guia (5.3): o fetch monta o
// boundary do multipart sozinho. NÃO definimos o Content-Type à mão (a API responderia 400 ou 415).
async function enviarMultipart<T>(caminho: string, form: FormData, sinal?: AbortSignal): Promise<T> {
    const controle = new AbortController()
    const timeout = setTimeout(() => controle.abort(), TIMEOUT_MS)
    sinal?.addEventListener("abort", () => controle.abort())
    try {
        const token = lerToken()
        const resposta = await fetch(`${URL_API}${caminho}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: form,
            signal: controle.signal,
        })
        if (!resposta.ok) {
            const erro = await erroDeResposta(resposta)
            if (erro.status === 401) avisarSessaoExpirada()
            throw erro
        }
        return (await resposta.json()) as T
    } catch (erro) {
        if (erro instanceof ErroApi) throw erro
        throw new ErroApi(0, "Sem conexão.") // rede caiu ou passou de 30 s
    } finally {
        clearTimeout(timeout)
    }
}

// No Expo SDK 58 o fetch é o `expo/fetch`, que NÃO aceita o formato antigo { uri, name, type }
// (dá "Unsupported FormDataPart implementation"). O jeito suportado é anexar um File do
// expo-file-system: ele tem nome, tipo (image/jpeg) e os bytes do arquivo.
function anexarFoto(form: FormData, uri: string) {
    form.append("imagem", new File(uri))
}

export async function descrever(
    uri: string,
    modo: ModoDescricao,
    anteriorId: number | null,
    sinal?: AbortSignal,
) {
    const form = new FormData()
    anexarFoto(form, uri)
    form.append("modo", modo)
    if (anteriorId != null) form.append("anteriorId", String(anteriorId))
    return enviarMultipart<DescricaoResposta>("/descricoes", form, sinal)
}

export async function perguntar(descricaoId: number, uri: string, pergunta: string) {
    const form = new FormData()
    anexarFoto(form, uri)
    form.append("pergunta", pergunta.trim())
    return enviarMultipart<{ resposta: string }>(`/descricoes/${descricaoId}/pergunta`, form)
}

export async function listarDescricoes(pagina: number, tamanho = 10) {
    const { data } = await api.get<Pagina<DescricaoResposta>>("/descricoes", {
        params: { page: pagina, size: tamanho },
    })
    return data
}

export async function buscarDescricao(id: number) {
    const { data } = await api.get<DescricaoResposta>(`/descricoes/${id}`)
    return data
}

export async function avaliarDescricao(id: number, util: boolean) {
    const { data } = await api.patch<DescricaoResposta>(`/descricoes/${id}/avaliacao`, { util })
    return data
}

export async function excluirDescricao(id: number) {
    await api.delete(`/descricoes/${id}`)
}
