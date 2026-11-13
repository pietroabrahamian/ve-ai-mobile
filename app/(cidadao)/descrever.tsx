import { Ionicons } from "@expo/vector-icons"
import { useQueryClient } from "@tanstack/react-query"
import { CameraView, useCameraPermissions } from "expo-camera"
import { router, useFocusEffect, useIsFocused } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, AppState, Pressable, StyleSheet, View } from "react-native"

import { ErroApi, mensagemDe } from "@/api/erros"
import { listarNotificacoes } from "@/api/notificacoes"
import { BadgeNovidade } from "@/components/Badges"
import { CaixaInfo, Cartao, Secao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { BottomSheet } from "@/components/BottomSheet"
import { Campo } from "@/components/Campo"
import { IconeTexto, IconeTipo, Ondas } from "@/components/Icones"
import { ItemLista } from "@/components/ItemLista"
import { Segmentado } from "@/components/Segmentado"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { BotaoIcone } from "@/components/Topo"
import { chaves } from "@/hooks/queries/chaves"
import { usePreferencias } from "@/contexts/PreferenciasContext"
import { useLoopAutomatico } from "@/hooks/useLoopAutomatico"
import { perguntar } from "@/api/descricoes"
import { lerUltimaFoto } from "@/services/camera"
import { anunciar, avisar, falar, toqueLeve } from "@/services/fala"
import { borda, cores, fontes } from "@/theme"
import type { DescricaoResposta, ModoDescricao } from "@/types/api"
import { tipoFalado } from "@/utils/textos"

// Sem resposta à sugestão de relato em 10 s, conta como "não" e o loop volta (guia 5.4)
const TEMPO_SUGESTAO_MS = 10_000

export default function Descrever() {
    const prefs = usePreferencias()
    const automatico = prefs.modo === "AUTOMATICO"
    const focada = useIsFocused()
    const queryClient = useQueryClient()
    const [permissao, pedirPermissao] = useCameraPermissions()
    const camera = useRef<CameraView>(null)
    const [cameraPronta, setCameraPronta] = useState(false)
    const [appAtivo, setAppAtivo] = useState(AppState.currentState === "active")
    const [modoManual, setModoManual] = useState<ModoDescricao>("AMBIENTE")
    const [sugestao, setSugestao] = useState<DescricaoResposta | null>(null)
    const [perguntaAberta, setPerguntaAberta] = useState(false)
    const retomarAoVoltar = useRef(false)
    const loopJaRodou = useRef(false)

    // O app em segundo plano pausa o loop (a câmera não funciona fora da tela)
    useEffect(() => {
        const sub = AppState.addEventListener("change", (estado) => setAppAtivo(estado === "active"))
        return () => sub.remove()
    }, [])

    const aoSugerirRelato = useCallback((descricao: DescricaoResposta) => {
        avisar("pergunta")
        falar(descricao.sugestaoRelato?.pergunta ?? "Quer avisar a rede de apoio?")
        setSugestao(descricao)
    }, [])

    const loop = useLoopAutomatico({
        camera,
        intervaloSegundos: prefs.intervaloSegundos,
        podeRodar:
            automatico && focada && appAtivo && cameraPronta && !!permissao?.granted && !perguntaAberta,
        aoSugerirRelato,
    })

    useEffect(() => {
        if (loop.rodando) loopJaRodou.current = true
    }, [loop.rodando])

    // Ao abrir a tela no automático, avisa que o modo está ligado
    useFocusEffect(
        useCallback(() => {
            if (prefs.modo === "AUTOMATICO") {
                anunciar(
                    `Modo automático ligado. Vou descrever o caminho a cada ${prefs.intervaloSegundos} segundos.`,
                )
            }
            if (retomarAoVoltar.current) {
                retomarAoVoltar.current = false
                loop.retomar()
            }
            return () => {
                // Ao sair do modo automático: "Você tem N notificações novas." (guia 11)
                if (!loopJaRodou.current) return
                loopJaRodou.current = false
                queryClient
                    .fetchQuery({
                        queryKey: chaves.naoLidas,
                        queryFn: () => listarNotificacoes({ lida: false, tamanho: 5 }),
                    })
                    .then((p) => {
                        if (p.totalElementos > 0) {
                            falar(
                                p.totalElementos === 1
                                    ? "Você tem 1 notificação nova."
                                    : `Você tem ${p.totalElementos} notificações novas.`,
                            )
                        }
                    })
                    .catch(() => undefined)
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [prefs.modo]),
    )

    // Timer da sugestão: 10 s sem resposta = "não"
    useEffect(() => {
        if (!sugestao) return
        const id = setTimeout(() => responderSugestao(false), TEMPO_SUGESTAO_MS)
        return () => clearTimeout(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sugestao])

    function responderSugestao(sim: boolean) {
        const descricao = sugestao
        setSugestao(null)
        if (sim && descricao?.sugestaoRelato) {
            retomarAoVoltar.current = automatico // ao voltar do relato, o loop continua
            router.push({
                pathname: "/relato/novo",
                params: {
                    tipo: descricao.sugestaoRelato.tipo,
                    gravidade: descricao.sugestaoRelato.gravidade,
                    texto: descricao.resumo,
                    descricaoId: descricao.id,
                    origem: "sugestao",
                },
            })
        } else if (automatico) {
            loop.retomar()
        }
    }

    // "Descrever agora", "Ler texto" e a captura do modo manual: descrição completa e tela de resultado
    async function descreverAgora(modo: ModoDescricao) {
        toqueLeve()
        falar(modo === "TEXTO" ? "Lendo o texto." : "Descrevendo a cena completa.")
        try {
            const descricao = await loop.descreverAgora(modo)
            router.push({ pathname: "/descricao/[id]", params: { id: descricao.id, novo: "1" } })
        } catch (e) {
            avisar("erro")
            falar(mensagemDe(e))
        }
    }

    function abrirPergunta() {
        loop.pausar(true)
        setPerguntaAberta(true)
        falar("Pode perguntar.")
    }

    if (!permissao) return <Tela comTopo>{null}</Tela>

    if (!permissao.granted) {
        return (
            <Tela comTopo>
                <Texto variante="titulo" centro accessibilityRole="header">
                    Permitir a <Destaque>câmera</Destaque>
                </Texto>
                <Texto variante="subtitulo" centro style={{ marginTop: 10 }}>
                    O Vê AI usa a câmera para descrever o que está à sua frente. Nenhuma foto é salva no
                    aparelho nem no servidor.
                </Texto>
                <View style={{ marginTop: 24 }}>
                    <Botao texto="Permitir câmera" icone="camera-outline" onPress={pedirPermissao} />
                </View>
            </Tela>
        )
    }

    const topoDireita = (
        <BotaoIcone
            icone="settings-outline"
            rotulo="Preferências de voz"
            onPress={() => router.navigate("/perfil")}
        />
    )
    const visor = (
        <Visor
            camera={camera}
            aoFicarPronta={() => setCameraPronta(true)}
            ocupado={loop.ocupado}
            automatico={automatico}
            aoVivo={loop.rodando}
            contagem={loop.segundosParaProxima}
            altura={automatico ? 250 : 300}
        />
    )

    if (!automatico) {
        return (
            <Tela comTopo direitaTopo={topoDireita} semMargem>
                <Cabecalho
                    titulo={modoManual === "TEXTO" ? "Texto" : "Ambiente"}
                    subtitulo={
                        modoManual === "TEXTO"
                            ? "Aponte a câmera para a placa, cardápio ou documento."
                            : "Modo manual: toque para tirar cada foto."
                    }
                />
                {visor}
                <View style={estilos.margem}>
                    <View style={{ marginTop: 22 }}>
                        <Segmentado
                            rotuloGrupo="O que descrever"
                            valor={modoManual}
                            onChange={(m) => {
                                setModoManual(m)
                                toqueLeve()
                                anunciar(m === "TEXTO" ? "Modo ler texto." : "Modo ambiente.")
                            }}
                            opcoes={[
                                {
                                    valor: "AMBIENTE",
                                    rotulo: "Ambiente",
                                    icone: (c) => <Ionicons name="camera-outline" size={28} color={c} />,
                                },
                                {
                                    valor: "TEXTO",
                                    rotulo: "Ler Texto",
                                    icone: (c) => <IconeTexto cor={c} tamanho={28} />,
                                },
                            ]}
                        />
                    </View>
                </View>
                <BotaoCaptura
                    icone="camera"
                    rotulo={modoManual === "TEXTO" ? "Capturar e ler o texto" : "Capturar foto e descrever"}
                    legenda={loop.ocupado ? "Analisando…" : "Toque para capturar"}
                    ocupado={loop.ocupado}
                    onPress={() => descreverAgora(modoManual)}
                />
                <View style={[estilos.margem, { marginTop: 18, gap: 20 }]}>
                    <ItemLista
                        titulo="Ligar modo automático"
                        subtitulo={`Foto a cada ${prefs.intervaloSegundos} s, com a descrição falada.`}
                        icone={<Ionicons name="headset-outline" size={28} color={cores.amarelo} />}
                        onPress={() => prefs.mudarLocal({ modo: "AUTOMATICO" })}
                    />
                    <CaixaInfo>
                        O app irá falar primeiro{" "}
                        <Texto cor={cores.amarelo} negrito>
                            os perigos
                        </Texto>
                        , depois o resto da cena.
                    </CaixaInfo>
                </View>
            </Tela>
        )
    }

    const ultima = loop.ultima
    return (
        <Tela comTopo direitaTopo={topoDireita} semMargem>
            <Cabecalho
                titulo="Ambiente"
                subtitulo={`Modo automático: uma foto a cada ${prefs.intervaloSegundos} s, falada em voz alta.`}
            />
            {visor}
            <View style={estilos.margem}>
                <Secao
                    titulo="Última fala"
                    direita={ultima && <BadgeNovidade novidade={ultima.novidade !== false} />}
                />
                <Cartao>
                    <Texto
                        variante="destaque"
                        cor={ultima ? cores.texto : cores.textoSecundario}
                        accessibilityLiveRegion="polite"
                    >
                        {ultima?.descricaoCompleta ?? "Preparando a primeira foto…"}
                    </Texto>
                </Cartao>
            </View>

            <BotaoCaptura
                icone={loop.rodando ? "pause" : "play"}
                rotulo={loop.rodando ? "Pausar modo automático" : "Retomar modo automático"}
                legenda={loop.rodando ? "Toque para pausar" : "Pausado · toque para retomar"}
                onPress={() => {
                    toqueLeve()
                    if (loop.rodando) loop.pausar()
                    else loop.retomar()
                }}
            />

            <View style={[estilos.margem, { marginTop: 16 }]}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Botao
                            texto="Descrever agora"
                            rotulo="Descrever agora, descrição completa"
                            icone="camera-outline"
                            variante="fantasma"
                            pequeno
                            onPress={() => descreverAgora("AMBIENTE")}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Botao
                            texto="Ler texto"
                            iconeCustom={<IconeTexto cor={cores.texto} />}
                            variante="fantasma"
                            pequeno
                            onPress={() => descreverAgora("TEXTO")}
                        />
                    </View>
                </View>
                {prefs.perguntaLivreAtiva && (
                    <View style={{ marginTop: 12 }}>
                        <Botao
                            texto="Perguntar sobre a cena"
                            icone="mic-outline"
                            variante="fantasma"
                            pequeno
                            desabilitado={!ultima}
                            onPress={abrirPergunta}
                        />
                    </View>
                )}

                <Secao titulo="Falas recentes" />
                <Cartao style={{ paddingVertical: 4 }}>
                    {loop.falas.length === 0 ? (
                        <Texto variante="pequeno" style={{ paddingVertical: 12 }}>
                            Nenhuma fala ainda.
                        </Texto>
                    ) : (
                        loop.falas.map((f, i) => (
                            <View
                                key={f.id}
                                style={[estilos.fala, i < loop.falas.length - 1 && estilos.divisor]}
                            >
                                <Texto variante="pequeno" style={{ width: 46 }}>
                                    {f.hora}
                                </Texto>
                                <Texto
                                    style={{
                                        flex: 1,
                                        fontSize: 15,
                                        color: f.novidade ? cores.texto : cores.textoSecundario,
                                    }}
                                >
                                    {f.texto}
                                </Texto>
                            </View>
                        ))
                    )}
                </Cartao>
                <View style={{ marginTop: 20 }}>
                    <CaixaInfo>
                        Os{" "}
                        <Texto cor={cores.amarelo} negrito>
                            perigos
                        </Texto>{" "}
                        vêm primeiro. Novidade dá um aviso; sem mudança, só uma confirmação curta.
                    </CaixaInfo>
                </View>
            </View>

            <BottomSheet
                visivel={!!sugestao}
                aoFechar={() => responderSugestao(false)}
                topo={
                    sugestao?.sugestaoRelato && (
                        <View style={estilos.iconeSugestao}>
                            <IconeTipo tipo={sugestao.sugestaoRelato.tipo} tamanho={36} />
                        </View>
                    )
                }
                titulo={
                    sugestao?.sugestaoRelato && (
                        <>
                            Parece haver <Destaque>{tipoFalado[sugestao.sugestaoRelato.tipo]}</Destaque>.
                        </>
                    )
                }
                texto="Quer avisar a rede de apoio? Sua localização vai só neste relato."
            >
                <Texto variante="pequeno" style={{ marginTop: 8 }}>
                    O modo automático está pausado. Sem resposta em 10 s, conto como “não”.
                </Texto>
                <View style={{ marginTop: 22, gap: 12 }}>
                    <Botao texto="Sim, avisar" icone="checkmark" onPress={() => responderSugestao(true)} />
                    <Botao texto="Não" variante="fantasma" onPress={() => responderSugestao(false)} />
                </View>
            </BottomSheet>

            <PerguntaLivre
                visivel={perguntaAberta}
                descricaoId={ultima?.id ?? null}
                aoFechar={() => {
                    setPerguntaAberta(false)
                    loop.retomar(true)
                }}
            />
        </Tela>
    )
}

function Cabecalho({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
    return (
        <View style={estilos.margem}>
            <Texto variante="titulo" centro style={{ marginTop: 6 }} accessibilityRole="header">
                Descrever <Destaque>{titulo}</Destaque>
            </Texto>
            <Texto variante="subtitulo" centro style={{ marginTop: 8 }}>
                {subtitulo}
            </Texto>
        </View>
    )
}

// Visor da câmera com os cantos amarelos, o selo AO VIVO/PAUSADO e a contagem para a próxima foto
function Visor(props: {
    camera: React.RefObject<CameraView | null>
    aoFicarPronta: () => void
    ocupado: boolean
    automatico: boolean
    aoVivo: boolean
    contagem: number | null
    altura: number
}) {
    const { camera, aoFicarPronta, ocupado, automatico, aoVivo, contagem, altura } = props
    const textoContagem = !aoVivo
        ? "Pausado"
        : ocupado
          ? "Analisando…"
          : contagem != null
            ? `Próxima foto em ${contagem} s`
            : "Primeira foto…"
    return (
        <View
            style={[estilos.visor, { height: altura }]}
            accessible
            accessibilityLabel={automatico ? `Câmera. ${aoVivo ? "Ao vivo" : "Pausado"}` : "Câmera"}
        >
            <CameraView
                ref={camera}
                style={StyleSheet.absoluteFill}
                facing="back"
                onCameraReady={aoFicarPronta}
                animateShutter={false}
            />
            <View
                style={[
                    estilos.canto,
                    { top: 18, left: 18, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 14 },
                ]}
            />
            <View
                style={[
                    estilos.canto,
                    {
                        top: 18,
                        right: 18,
                        borderLeftWidth: 0,
                        borderBottomWidth: 0,
                        borderTopRightRadius: 14,
                    },
                ]}
            />
            <View
                style={[
                    estilos.canto,
                    {
                        bottom: 18,
                        left: 18,
                        borderRightWidth: 0,
                        borderTopWidth: 0,
                        borderBottomLeftRadius: 14,
                    },
                ]}
            />
            <View
                style={[
                    estilos.canto,
                    {
                        bottom: 18,
                        right: 18,
                        borderLeftWidth: 0,
                        borderTopWidth: 0,
                        borderBottomRightRadius: 14,
                    },
                ]}
            />
            {automatico && (
                <>
                    <View style={estilos.aoVivo}>
                        <View style={[estilos.pontoVivo, !aoVivo && { backgroundColor: cores.cinza }]} />
                        <Texto style={estilos.textoVivo}>{aoVivo ? "AO VIVO" : "PAUSADO"}</Texto>
                    </View>
                    <View style={estilos.contagem}>
                        <Texto style={estilos.textoContagem}>{textoContagem}</Texto>
                    </View>
                </>
            )}
            {ocupado && !automatico && (
                <View style={estilos.analisando}>
                    <ActivityIndicator size="large" color={cores.amarelo} />
                    <Texto negrito>Analisando a imagem…</Texto>
                </View>
            )}
        </View>
    )
}

// Botão circular amarelo de 150 dp com anel e ondas dos lados (.capture do protótipo)
function BotaoCaptura({
    icone,
    rotulo,
    legenda,
    onPress,
    ocupado,
}: {
    icone: "camera" | "pause" | "play"
    rotulo: string
    legenda: string
    onPress: () => void
    ocupado?: boolean
}) {
    return (
        <View style={{ alignItems: "center", marginTop: 24 }}>
            <View style={estilos.linhaCaptura}>
                <Ondas alturas={[14, 26, 46, 70, 30]} />
                <Pressable
                    onPress={onPress}
                    disabled={ocupado}
                    accessibilityRole="button"
                    accessibilityLabel={rotulo}
                    accessibilityState={{ busy: !!ocupado }}
                    style={({ pressed }) => [estilos.captura, pressed && { transform: [{ scale: 0.96 }] }]}
                >
                    <View style={estilos.capturaMiolo}>
                        {ocupado ? (
                            <ActivityIndicator size="large" color={cores.sobreAmarelo} />
                        ) : (
                            <Ionicons name={icone} size={58} color={cores.sobreAmarelo} />
                        )}
                    </View>
                </Pressable>
                <Ondas alturas={[30, 70, 46, 26, 14]} />
            </View>
            <Texto style={{ fontSize: 20, marginTop: 14 }} importantForAccessibility="no">
                {legenda}
            </Texto>
        </View>
    )
}

// Pergunta livre (guia 8): a pergunta é digitada ou ditada pelo microfone do próprio teclado
function PerguntaLivre({
    visivel,
    descricaoId,
    aoFechar,
}: {
    visivel: boolean
    descricaoId: number | null
    aoFechar: () => void
}) {
    const prefs = usePreferencias()
    const [texto, setTexto] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [resposta, setResposta] = useState<string | null>(null)
    const [desativada, setDesativada] = useState(false)

    function fechar() {
        setTexto("")
        setResposta(null)
        setDesativada(false)
        aoFechar()
    }

    async function enviar() {
        const foto = lerUltimaFoto()
        if (!texto.trim() || !foto || descricaoId == null) return
        setEnviando(true)
        try {
            const r = await perguntar(descricaoId, foto, texto)
            setResposta(r.resposta)
            falar(r.resposta)
        } catch (e) {
            // 403: pergunta livre desligada nas preferências; oferece o atalho para ligar
            if (e instanceof ErroApi && e.status === 403) setDesativada(true)
            avisar("erro")
            falar(mensagemDe(e))
            setResposta(mensagemDe(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <BottomSheet
            visivel={visivel}
            aoFechar={fechar}
            titulo={
                <>
                    Perguntar sobre a <Destaque>cena</Destaque>
                </>
            }
            texto="Toque no microfone do teclado para falar a pergunta."
        >
            <Campo
                rotulo="Sua pergunta"
                value={texto}
                onChangeText={setTexto}
                placeholder="Ex.: Tem algum banco para sentar por perto?"
                multiline
                maxLength={500}
                autoFocus
            />
            {resposta && (
                <Cartao style={{ marginTop: 12 }}>
                    <Texto variante="destaque" accessibilityLiveRegion="polite">
                        {resposta}
                    </Texto>
                </Cartao>
            )}
            <View style={{ marginTop: 18, gap: 12 }}>
                {desativada ? (
                    <Botao
                        texto="Ativar pergunta livre"
                        onPress={async () => {
                            await prefs.mudarDaConta({ perguntaLivreAtiva: true }).catch(() => undefined)
                            setDesativada(false)
                            setResposta(null)
                        }}
                    />
                ) : (
                    <Botao
                        texto="Enviar pergunta"
                        icone="send"
                        carregando={enviando}
                        textoCarregando="Perguntando…"
                        desabilitado={!texto.trim()}
                        onPress={enviar}
                    />
                )}
                <Botao
                    texto={resposta ? "Voltar a descrever" : "Cancelar"}
                    variante="fantasma"
                    onPress={fechar}
                />
            </View>
        </BottomSheet>
    )
}

const estilos = StyleSheet.create({
    margem: { paddingHorizontal: 22 },
    visor: {
        marginTop: 18,
        marginHorizontal: 14,
        borderRadius: 30,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: cores.borda2,
        backgroundColor: "#0B1530",
    },
    canto: { position: "absolute", width: 52, height: 52, borderWidth: 5, borderColor: cores.amarelo },
    aoVivo: {
        position: "absolute",
        top: 16,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(6,14,36,0.82)",
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 99,
    },
    pontoVivo: { width: 10, height: 10, borderRadius: 5, backgroundColor: cores.perigo },
    textoVivo: { fontFamily: fontes.negrito, fontSize: 13, letterSpacing: 1 },
    contagem: {
        position: "absolute",
        bottom: 16,
        alignSelf: "center",
        backgroundColor: cores.amarelo,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 99,
    },
    textoContagem: { fontFamily: fontes.negrito, fontSize: 15, color: cores.sobreAmarelo },
    analisando: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(6,14,36,0.72)",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    linhaCaptura: { flexDirection: "row", alignItems: "center", gap: 22 },
    captura: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: cores.fundo2,
        borderWidth: 4,
        borderColor: "rgba(255,200,30,0.55)",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 8px rgba(255,200,30,0.08), 0 0 38px rgba(255,200,30,0.25)",
    },
    capturaMiolo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#FFD23F",
        alignItems: "center",
        justifyContent: "center",
    },
    fala: { flexDirection: "row", gap: 10, paddingVertical: 10 },
    divisor: { borderBottomWidth: 1, borderBottomColor: cores.divisor },
    iconeSugestao: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: "rgba(255,200,30,0.14)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: borda,
        borderColor: "transparent",
    },
})
