import { Ionicons } from "@expo/vector-icons"
import { router, useIsFocused } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"

import { Nota } from "@/components/Blocos"
import { BotaoAcao } from "@/components/BotaoAcao"
import { IconeDescrever, IconeRelatar } from "@/components/Icones"
import { Logo } from "@/components/Logo"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { BotaoIcone } from "@/components/Topo"
import { useAuth } from "@/contexts/AuthContext"
import { useNaoLidas } from "@/hooks/queries/useNotificacoes"
import { pedirPermissaoLocalizacao } from "@/hooks/useLocalizacao"
import { useSessao } from "@/hooks/useSessao"
import { falar } from "@/services/fala"
import { cores } from "@/theme"

// Saudação falada uma vez por login (guarda o id de quem já foi saudado)
let saudado: number | null = null

export default function Inicio() {
    const { usuario } = useAuth()
    const focada = useIsFocused()
    const { data: naoLidas } = useNaoLidas(focada)
    const { minutosRestantes } = useSessao()
    const total = naoLidas?.totalElementos ?? 0
    const primeiroNome = usuario?.nome.split(" ")[0] ?? ""

    // "Olá, Ana. Você tem N notificações novas."
    useEffect(() => {
        if (!usuario || !naoLidas || saudado === usuario.id) return
        saudado = usuario.id
        const aviso =
            total === 0
                ? "Nenhuma notificação nova."
                : total === 1
                  ? "Você tem 1 notificação nova."
                  : `Você tem ${total} notificações novas.`
        falar(`Olá, ${primeiroNome}. ${aviso}`)
    }, [usuario, naoLidas, total, primeiroNome])

    // A permissão de localização é pedida aqui, antes da caminhada, e não no meio dela
    useEffect(() => {
        pedirPermissaoLocalizacao()
    }, [])

    return (
        <Tela decorada semMargem>
            <View style={estilos.topo}>
                <Logo />
                <BotaoIcone
                    icone="notifications-outline"
                    rotulo={`Notificações, ${total} não lidas`}
                    onPress={() => router.push("/notificacoes")}
                    contorno
                    ponto={total > 0}
                    tamanho={64}
                />
            </View>

            <View style={estilos.margem}>
                {minutosRestantes != null && (
                    <View style={{ marginTop: 20 }}>
                        <Nota
                            tom="aviso"
                            icone="time-outline"
                            texto={`Sua sessão termina em ${minutosRestantes} minuto${minutosRestantes === 1 ? "" : "s"}. Quando parar de andar, entre de novo.`}
                        />
                    </View>
                )}
                <Texto variante="tituloGrande" style={{ marginTop: 40 }} accessibilityRole="header">
                    Como posso{"\n"}ajudar <Destaque>você</Destaque> hoje?
                </Texto>
                <Texto variante="subtitulo" style={{ marginTop: 12, marginBottom: 22, fontSize: 18 }}>
                    Escolha uma opção abaixo:
                </Texto>
            </View>

            <View style={estilos.acoes}>
                <BotaoAcao
                    destaque
                    titulo={"Descrever\nAmbiente"}
                    subtitulo="Ouça o que está à sua frente."
                    icone={<IconeDescrever />}
                    onPress={() => router.push("/descrever")}
                />
                <BotaoAcao
                    titulo={"Relatar\nProblema"}
                    subtitulo="Ajude a melhorar a cidade."
                    icone={<IconeRelatar />}
                    onPress={() => router.push("/relato/novo")}
                />
                <BotaoAcao
                    titulo="Meu Histórico"
                    subtitulo="Veja suas descrições e relatos."
                    icone={<Ionicons name="time-outline" size={66} color={cores.amarelo} />}
                    onPress={() => router.navigate("/historico")}
                />
            </View>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    topo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 22,
        paddingHorizontal: 22,
    },
    margem: { paddingHorizontal: 22 },
    acoes: { gap: 16, paddingHorizontal: 14, paddingBottom: 110 },
})
