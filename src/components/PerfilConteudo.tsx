import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { mensagemDe } from "@/api/erros"
import { useAuth } from "@/contexts/AuthContext"
import { usePreferencias } from "@/contexts/PreferenciasContext"
import { INTERVALOS_SEGUNDOS } from "@/hooks/useLoopAutomatico"
import { falar } from "@/services/fala"
import { cores, coresStatus, fontes } from "@/theme"

import { Cartao, Secao } from "./Blocos"
import { Botao } from "./Botao"
import { BottomSheet } from "./BottomSheet"
import { Chip } from "./Chip"
import { Interruptor } from "./Interruptor"
import { ItemLista } from "./ItemLista"
import { Segmentado } from "./Segmentado"
import { Texto } from "./Texto"
import { mostrarToast } from "./Toast"

const VELOCIDADE_MIN = 0.5
const VELOCIDADE_MAX = 2
const PASSO = 0.1

// Perfil e preferências (cidadão e gestor). O gestor não descreve o ambiente, então não vê essa parte.
export function PerfilConteudo() {
    const { usuario, papel, sair } = useAuth()
    const prefs = usePreferencias()
    const gestor = papel === "GESTOR"
    const [confirmarSaida, setConfirmarSaida] = useState(false)

    // A velocidade muda na hora (botões − e +) e é salva na API 0,8 s depois do último toque
    // (enquanto não salva, mostramos o valor escolhido; depois, o que veio da API)
    const [velocidadeEscolhida, setVelocidade] = useState<number | null>(null)
    const velocidade = velocidadeEscolhida ?? prefs.velocidadeVoz
    const espera = useRef<ReturnType<typeof setTimeout> | null>(null)

    function mudarVelocidade(delta: number) {
        const nova =
            Math.round(Math.min(VELOCIDADE_MAX, Math.max(VELOCIDADE_MIN, velocidade + delta)) * 10) / 10
        setVelocidade(nova)
        if (espera.current) clearTimeout(espera.current)
        espera.current = setTimeout(() => {
            prefs
                .mudarDaConta({ velocidadeVoz: nova })
                .catch((e) => mostrarToast(mensagemDe(e), "erro"))
                .finally(() => setVelocidade(null))
        }, 800)
    }

    async function mudarPerguntaLivre(ativa: boolean) {
        try {
            await prefs.mudarDaConta({ perguntaLivreAtiva: ativa })
        } catch (e) {
            mostrarToast(mensagemDe(e), "erro")
        }
    }

    if (!usuario) return null
    const iniciais = usuario.nome
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    return (
        <View>
            <View
                style={estilos.cabecalho}
                accessible
                accessibilityLabel={`${usuario.nome}, ${usuario.email}, ${gestor ? "gestor da rede de apoio" : "cidadão"}`}
            >
                <View style={estilos.avatar}>
                    <Texto style={estilos.iniciais}>{iniciais}</Texto>
                </View>
                <View style={{ flex: 1 }}>
                    <Texto style={estilos.nome}>{usuario.nome}</Texto>
                    <Texto variante="subtitulo">{usuario.email}</Texto>
                    <View
                        style={[
                            estilos.papel,
                            {
                                backgroundColor: gestor
                                    ? coresStatus.ENCAMINHADO.fundo
                                    : coresStatus.ABERTO.fundo,
                            },
                        ]}
                    >
                        <Texto
                            style={{
                                fontFamily: fontes.negrito,
                                fontSize: 13,
                                color: gestor ? cores.roxo : cores.azul,
                            }}
                        >
                            {gestor ? "Gestor · rede de apoio" : "Cidadão"}
                        </Texto>
                    </View>
                </View>
            </View>

            {gestor && (
                <>
                    <Secao titulo="Minhas regiões" />
                    <View style={estilos.chips}>
                        {usuario.regioes.map((r) => (
                            <Chip key={r.id} texto={r.nome} icone="location-outline" />
                        ))}
                    </View>
                </>
            )}

            {!gestor && (
                <>
                    <Secao titulo="Descrição do ambiente" />
                    <Cartao style={{ paddingVertical: 6 }}>
                        <View style={estilos.bloco}>
                            <Texto negrito style={{ fontSize: 17.5 }}>
                                Modo de descrição
                            </Texto>
                            <Texto variante="pequeno" style={{ marginTop: 6 }}>
                                Automático: o app tira a foto sozinho e fala. Manual: você toca para tirar
                                cada foto.
                            </Texto>
                            <View style={{ marginTop: 12 }}>
                                <Segmentado
                                    pequeno
                                    rotuloGrupo="Modo de descrição"
                                    valor={prefs.modo}
                                    onChange={(modo) => {
                                        prefs.mudarLocal({ modo })
                                        falar(modo === "AUTOMATICO" ? "Modo automático." : "Modo manual.")
                                    }}
                                    opcoes={[
                                        { valor: "AUTOMATICO", rotulo: "Automático" },
                                        { valor: "MANUAL", rotulo: "Manual" },
                                    ]}
                                />
                            </View>
                        </View>
                        {prefs.modo === "AUTOMATICO" && (
                            <View style={estilos.bloco}>
                                <Texto negrito style={{ fontSize: 17.5 }}>
                                    Tirar uma foto a cada
                                </Texto>
                                <View style={{ marginTop: 12 }}>
                                    <Segmentado
                                        pequeno
                                        rotuloGrupo="Intervalo entre fotos"
                                        valor={prefs.intervaloSegundos}
                                        onChange={(intervaloSegundos) =>
                                            prefs.mudarLocal({ intervaloSegundos })
                                        }
                                        opcoes={INTERVALOS_SEGUNDOS.map((s) => ({
                                            valor: s,
                                            rotulo: `${s} s`,
                                        }))}
                                    />
                                </View>
                            </View>
                        )}
                        <Interruptor
                            titulo="Sons de aviso"
                            descricao="Vibração curta antes de novidades, perguntas e erros."
                            valor={prefs.sons}
                            onChange={(sons) => prefs.mudarLocal({ sons })}
                            ultimo
                        />
                        <Texto variante="pequeno" style={{ paddingBottom: 14 }}>
                            Salvo só neste aparelho.
                        </Texto>
                    </Cartao>
                </>
            )}

            <Secao titulo="Voz" />
            <Cartao style={{ paddingVertical: 6 }}>
                <View style={estilos.bloco}>
                    <View style={estilos.linha}>
                        <Texto negrito style={{ fontSize: 17.5 }}>
                            Velocidade da voz
                        </Texto>
                        <Texto style={{ color: cores.amarelo, fontFamily: fontes.negrito, fontSize: 18 }}>
                            {velocidade.toFixed(1)}×
                        </Texto>
                    </View>
                    <View
                        style={[estilos.linha, { marginTop: 12 }]}
                        accessible
                        accessibilityRole="adjustable"
                        accessibilityLabel="Velocidade da voz"
                        accessibilityValue={{ text: `${velocidade.toFixed(1)} vezes` }}
                        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
                        onAccessibilityAction={(e) =>
                            mudarVelocidade(e.nativeEvent.actionName === "increment" ? PASSO : -PASSO)
                        }
                    >
                        <BotaoPasso
                            icone="remove"
                            rotulo="Mais devagar"
                            onPress={() => mudarVelocidade(-PASSO)}
                        />
                        <View style={estilos.trilho}>
                            <View
                                style={[
                                    estilos.preenchido,
                                    {
                                        width: `${((velocidade - VELOCIDADE_MIN) / (VELOCIDADE_MAX - VELOCIDADE_MIN)) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                        <BotaoPasso icone="add" rotulo="Mais rápido" onPress={() => mudarVelocidade(PASSO)} />
                    </View>
                    <View style={{ marginTop: 12 }}>
                        <Botao
                            texto="Testar voz"
                            icone="play"
                            variante="fantasma"
                            pequeno
                            onPress={() => falar("Esta é a velocidade da sua voz no Vê AI.")}
                        />
                    </View>
                </View>
                {!gestor && (
                    <Interruptor
                        titulo="Pergunta livre por voz"
                        descricao="Fazer perguntas sobre a última foto."
                        valor={prefs.perguntaLivreAtiva}
                        onChange={mudarPerguntaLivre}
                    />
                )}
                <Interruptor
                    titulo="Vibração"
                    descricao="Avisa perigo a menos de 2 metros."
                    valor={prefs.vibracao}
                    onChange={(vibracao) => prefs.mudarLocal({ vibracao })}
                    ultimo
                />
            </Cartao>

            <Secao titulo="Conta" />
            <View style={{ gap: 10 }}>
                {!gestor && (
                    <ItemLista
                        titulo="Notificações"
                        icone={<Ionicons name="notifications-outline" size={26} color={cores.amarelo} />}
                        onPress={() => router.push("/notificacoes")}
                    />
                )}
                <ItemLista
                    titulo="Sobre o App"
                    subtitulo="Versão e commit"
                    icone={<Ionicons name="information-circle-outline" size={26} color={cores.amarelo} />}
                    onPress={() => router.push("/sobre")}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Botao
                    texto="Sair da conta"
                    icone="log-out-outline"
                    variante="perigo"
                    onPress={() => setConfirmarSaida(true)}
                />
            </View>

            <BottomSheet
                visivel={confirmarSaida}
                aoFechar={() => setConfirmarSaida(false)}
                titulo="Sair da conta?"
                texto="Você vai precisar entrar de novo para usar o app."
            >
                <View style={{ marginTop: 24, gap: 12 }}>
                    <Botao
                        texto="Sair"
                        icone="log-out-outline"
                        variante="perigo"
                        onPress={async () => {
                            setConfirmarSaida(false)
                            await sair()
                            mostrarToast("Sessão encerrada")
                            router.replace("/login")
                        }}
                    />
                    <Botao texto="Cancelar" variante="fantasma" onPress={() => setConfirmarSaida(false)} />
                </View>
            </BottomSheet>
        </View>
    )
}

function BotaoPasso({
    icone,
    rotulo,
    onPress,
}: {
    icone: "add" | "remove"
    rotulo: string
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            style={estilos.passo}
        >
            <Ionicons name={icone} size={26} color={cores.sobreAmarelo} />
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    cabecalho: { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 20 },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: cores.amarelo,
        alignItems: "center",
        justifyContent: "center",
    },
    iniciais: { fontFamily: fontes.titulo, fontSize: 28, color: cores.sobreAmarelo },
    nome: { fontFamily: fontes.titulo, fontSize: 23, lineHeight: 28, color: cores.texto },
    papel: {
        alignSelf: "flex-start",
        marginTop: 8,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 99,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    bloco: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: cores.divisor },
    linha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    trilho: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "#24386C", overflow: "hidden" },
    preenchido: { height: "100%", backgroundColor: cores.amarelo },
    passo: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: cores.amarelo,
        alignItems: "center",
        justifyContent: "center",
    },
})
