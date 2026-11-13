import type { CameraView } from "expo-camera"
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

import { descrever } from "@/api/descricoes"
import { ErroApi } from "@/api/erros"
import { capturarFoto } from "@/services/camera"
import { anunciar, avisar, falar, vibrarPerigoProximo } from "@/services/fala"
import type { DescricaoResposta, ModoDescricao } from "@/types/api"
import { hora } from "@/utils/datas"

import { useGuardarDescricao } from "./queries/useDescricoes"

// Regras do modo automático (guia, seção 5). Ficam em constantes para mudar fácil.
export const INTERVALOS_SEGUNDOS = [10, 15, 20, 30]
const RECOMECAR_APOS_PAUSA_MS = 2 * 60_000 // a API ignora anteriorId com mais de 2 min
const FALHAS_ANTES_DO_AVISO = 3 // só a 3ª falha seguida vira fala
const ESPERA_APOS_FALHA_MS = 3_000 // guia: esperar de 2 a 5 s entre tentativas
const ESPERA_MAXIMA_429_S = 60
const FALAS_RECENTES = 5
const CHAVE_KEEP_AWAKE = "veai-modo-automatico"

export interface FalaRecente {
    id: number
    texto: string
    novidade: boolean
    hora: string
}

interface Opcoes {
    camera: RefObject<CameraView | null>
    intervaloSegundos: number
    // A tela diz se o loop pode rodar: tela em foco, app em primeiro plano, câmera pronta
    podeRodar: boolean
    // Chegou uma sugestão de relato: o loop já está pausado até a pessoa responder
    aoSugerirRelato: (descricao: DescricaoResposta) => void
}

// "cerca de 1 metro" ou "menos de 1 metro" = perigo próximo (guia 7.1)
function temPerigoProximo(descricao: DescricaoResposta) {
    return descricao.perigos.some((p) =>
        /menos de 1 metro|cerca de 1 metro|menos de 2 metros/i.test(p.distanciaAprox),
    )
}

export function useLoopAutomatico({ camera, intervaloSegundos, podeRodar, aoSugerirRelato }: Opcoes) {
    const guardarDescricao = useGuardarDescricao()
    const [pausadoPelaPessoa, setPausadoPelaPessoa] = useState(false)
    const [ocupado, setOcupado] = useState(false)
    const [segundosParaProxima, setSegundosParaProxima] = useState<number | null>(null)
    const [ultima, setUltima] = useState<DescricaoResposta | null>(null)
    const [falas, setFalas] = useState<FalaRecente[]>([])

    // Refs: o loop é uma função assíncrona longa e precisa ler sempre o valor atual
    const rodando = useRef(false)
    // Cada início do loop ganha uma geração; uma volta antiga que ainda esperava a API para sozinha
    const geracao = useRef(0)
    const anteriorId = useRef<number | null>(null)
    const ultimaRespostaEm = useRef(0)
    const falhasSeguidas = useRef(0)
    const controle = useRef<AbortController | null>(null)
    const intervalo = useRef(intervaloSegundos)
    const aoSugerir = useRef(aoSugerirRelato)
    useEffect(() => {
        intervalo.current = intervaloSegundos
        aoSugerir.current = aoSugerirRelato
    })

    const ativo = podeRodar && !pausadoPelaPessoa

    // Espera que pode ser interrompida quando o loop para (atualiza a contagem a cada segundo)
    const esperar = useCallback(async (ms: number, vivo: () => boolean) => {
        const fim = Date.now() + ms
        while (vivo() && Date.now() < fim) {
            setSegundosParaProxima(Math.ceil((fim - Date.now()) / 1000))
            await new Promise((r) => setTimeout(r, Math.min(250, fim - Date.now())))
        }
    }, [])

    const registrarResposta = useCallback(
        (descricao: DescricaoResposta) => {
            guardarDescricao(descricao)
            setUltima(descricao)
            setFalas((lista) =>
                [
                    {
                        id: descricao.id,
                        texto: descricao.descricaoCompleta,
                        novidade: descricao.novidade !== false,
                        hora: hora(descricao.criadoEm),
                    },
                    ...lista,
                ].slice(0, FALAS_RECENTES),
            )
        },
        [guardarDescricao],
    )

    // Fala SEMPRE a descricaoCompleta. Novidade interrompe a fala atual e dá o aviso;
    // confirmação ("continua no mesmo lugar") é descartada se ainda houver outra fala tocando.
    const falarDescricao = useCallback((descricao: DescricaoResposta) => {
        const novidade = descricao.novidade !== false
        if (novidade) {
            avisar("alerta")
            if (temPerigoProximo(descricao)) vibrarPerigoProximo()
        }
        falar(descricao.descricaoCompleta, { interromper: novidade })
    }, [])

    // Uma foto por vez: a próxima só sai depois da resposta da anterior (nunca setInterval)
    const loop = useCallback(async () => {
        const minhaGeracao = ++geracao.current
        const vivo = () => rodando.current && geracao.current === minhaGeracao
        while (vivo()) {
            const inicio = Date.now()
            let esperaMs = intervalo.current * 1000

            // Depois de uma pausa longa a caminhada recomeça com a descrição completa
            if (Date.now() - ultimaRespostaEm.current > RECOMECAR_APOS_PAUSA_MS) anteriorId.current = null

            try {
                if (!camera.current) throw new Error("câmera não está pronta")
                setOcupado(true)
                setSegundosParaProxima(null)
                const uri = await capturarFoto(camera.current)
                controle.current = new AbortController()
                const descricao = await descrever(
                    uri,
                    "AMBIENTE",
                    anteriorId.current,
                    controle.current.signal,
                )
                if (!vivo()) break

                if (falhasSeguidas.current >= FALHAS_ANTES_DO_AVISO) falar("Conexão de volta.")
                falhasSeguidas.current = 0
                anteriorId.current = descricao.id
                ultimaRespostaEm.current = Date.now()
                registrarResposta(descricao)
                falarDescricao(descricao)

                if (descricao.sugestaoRelato) {
                    // Pausa até a pessoa responder (a tela cuida dos 10 s)
                    rodando.current = false
                    setPausadoPelaPessoa(true)
                    aoSugerir.current(descricao)
                    break
                }
            } catch (e) {
                if (!vivo()) break
                const erro = e instanceof ErroApi ? e : null

                if (erro?.status === 401) {
                    // O client já encerrou a sessão e falou "Sua sessão expirou"
                    rodando.current = false
                    break
                }
                if (erro?.status === 429) {
                    // Limite de 20 por minuto: espera em silêncio o tempo que a API pediu
                    esperaMs = Math.min(erro.retryAfterSegundos ?? 10, ESPERA_MAXIMA_429_S) * 1000
                } else if (erro?.status === 404 && anteriorId.current != null) {
                    // A descrição anterior foi excluída: zera e repete já, em silêncio
                    anteriorId.current = null
                    esperaMs = 0
                } else if (erro && (erro.status === 400 || erro.status === 413 || erro.status === 415)) {
                    console.warn("Foto recusada pela API:", erro.status, erro.mensagem)
                } else {
                    // 502, 5xx, timeout, sem rede ou falha da câmera: conta e só avisa na 3ª seguida.
                    // Nunca dizemos que o caminho está livre quando não há resposta.
                    falhasSeguidas.current += 1
                    if (falhasSeguidas.current === FALHAS_ANTES_DO_AVISO) {
                        avisar("erro")
                        falar("Estou com dificuldade de conexão. Continuo tentando.")
                        anteriorId.current = null // quando voltar, recomeça com a cena completa
                    }
                    esperaMs = ESPERA_APOS_FALHA_MS
                }
            } finally {
                if (geracao.current === minhaGeracao) {
                    setOcupado(false)
                    controle.current = null
                }
            }

            const restante = esperaMs - (Date.now() - inicio)
            if (restante > 0) await esperar(restante, vivo)
        }
        if (geracao.current === minhaGeracao) setSegundosParaProxima(null)
    }, [camera, esperar, falarDescricao, registrarResposta])

    // Liga e desliga o loop conforme a tela permite e a pessoa quer
    useEffect(() => {
        if (!ativo) return
        rodando.current = true
        activateKeepAwakeAsync(CHAVE_KEEP_AWAKE) // tela ligada enquanto o loop roda
        const inicio = setTimeout(loop, 0) // começa fora do efeito, que só liga e desliga o loop
        return () => {
            clearTimeout(inicio)
            rodando.current = false
            controle.current?.abort()
            deactivateKeepAwake(CHAVE_KEEP_AWAKE)
        }
    }, [ativo, loop])

    const pausar = useCallback((silencioso = false) => {
        rodando.current = false
        controle.current?.abort()
        setPausadoPelaPessoa(true)
        if (!silencioso) anunciar("Pausado.")
    }, [])

    const retomar = useCallback((silencioso = false) => {
        setPausadoPelaPessoa(false)
        if (!silencioso) anunciar("Retomando.")
    }, [])

    // "Descrever agora" e "Ler texto": pausam o loop e fazem uma descrição completa, sem anteriorId
    const descreverAgora = useCallback(
        async (modo: ModoDescricao) => {
            pausar(true)
            if (!camera.current) throw new ErroApi(0, "A câmera ainda não está pronta.")
            setOcupado(true)
            try {
                const uri = await capturarFoto(camera.current)
                const descricao = await descrever(uri, modo, null)
                guardarDescricao(descricao)
                // A descrição completa serve de referência para a próxima foto automática (guia 6.1)
                if (modo === "AMBIENTE") {
                    anteriorId.current = descricao.id
                    ultimaRespostaEm.current = Date.now()
                }
                return descricao
            } finally {
                setOcupado(false)
            }
        },
        [camera, guardarDescricao, pausar],
    )

    return {
        rodando: ativo,
        pausado: pausadoPelaPessoa,
        ocupado,
        segundosParaProxima,
        ultima,
        falas,
        pausar,
        retomar,
        descreverAgora,
    }
}
