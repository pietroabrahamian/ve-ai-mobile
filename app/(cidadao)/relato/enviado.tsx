import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, View } from "react-native"

import { BadgeStatus } from "@/components/Badges"
import { Cartao, Linha } from "@/components/Blocos"
import { Botao, type NomeIcone } from "@/components/Botao"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { avisar, falar } from "@/services/fala"
import { cores, fontes } from "@/theme"
import type { RegistroRelatoResposta, StatusRelato, TipoRelato } from "@/types/api"
import { tipoFalado } from "@/utils/textos"

type Parametros = {
    resultado: RegistroRelatoResposta["resultado"]
    id: string
    apoios: string
    regiao: string
    tipo: TipoRelato
    status: StatusRelato
    origem?: string
}

// As três respostas do POST /relatos, com as falas do guia (10.2)
export default function RelatoEnviado() {
    const p = useLocalSearchParams<Parametros>()
    const apoios = Number(p.apoios)

    const tela: { icone: NomeIcone; cor: string; titulo: [string, string]; texto: string; fala: string } =
        p.resultado === "APOIO_REGISTRADO"
            ? {
                  icone: "hand-left-outline",
                  cor: cores.amarelo,
                  titulo: ["Esse problema ", "já foi relatado"],
                  texto: `Alguém já avisou sobre ${tipoFalado[p.tipo]} a menos de 30 m daqui. Registramos o seu apoio.`,
                  fala: `Alguém já tinha avisado sobre esta barreira. Seu apoio foi somado: agora ${apoios} pessoas confirmaram.`,
              }
            : p.resultado === "JA_REGISTRADO"
              ? {
                    icone: "information-circle-outline",
                    cor: cores.azul,
                    titulo: ["Você ", "já tinha avisado"],
                    texto: "Você já é autor ou apoiador de um relato igual a menos de 30 m daqui. Nada foi duplicado.",
                    fala: "Você já tinha avisado sobre esta barreira.",
                }
              : {
                    icone: "checkmark",
                    cor: cores.sucesso,
                    titulo: ["Relato ", "enviado"],
                    texto: `A rede de apoio da região ${p.regiao} vai analisar. Você será avisado a cada mudança de status.`,
                    fala: "Pronto. Seu relato foi enviado para a rede de apoio.",
                }

    useEffect(() => {
        avisar("sucesso")
        falar(tela.fala)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const daSugestao = p.origem === "sugestao"

    return (
        <Tela>
            <View style={{ alignItems: "center", paddingTop: 70 }}>
                <View style={[estilos.circulo, { borderColor: tela.cor, backgroundColor: `${tela.cor}22` }]}>
                    <Ionicons name={tela.icone} size={72} color={tela.cor} />
                </View>
                <Texto variante="titulo" centro style={{ marginTop: 24 }} accessibilityRole="header">
                    {tela.titulo[0]}
                    <Destaque>{tela.titulo[1]}</Destaque>
                </Texto>
                <Texto variante="subtitulo" centro style={{ marginTop: 8 }}>
                    {tela.texto}
                </Texto>
            </View>

            <Cartao style={{ marginTop: 24 }}>
                <Linha rotulo="Relato">{`#${p.id}`}</Linha>
                {p.resultado === "APOIO_REGISTRADO" && (
                    <Linha rotulo="Apoios">
                        <Texto style={{ fontFamily: fontes.negrito, fontSize: 20, color: cores.amarelo }}>
                            +1 · agora {apoios} pessoas
                        </Texto>
                    </Linha>
                )}
                <Linha rotulo="Status">
                    <BadgeStatus status={p.status} />
                </Linha>
            </Cartao>

            <View style={{ marginTop: 24, gap: 12 }}>
                {daSugestao ? (
                    <Botao texto="Continuar a caminhada" icone="walk-outline" onPress={() => router.back()} />
                ) : (
                    <Botao
                        texto="Acompanhar relato"
                        onPress={() => router.replace({ pathname: "/relato/[id]", params: { id: p.id } })}
                    />
                )}
                <Botao
                    texto={daSugestao ? "Ver o relato" : "Voltar ao início"}
                    variante="fantasma"
                    onPress={() =>
                        daSugestao
                            ? router.replace({ pathname: "/relato/[id]", params: { id: p.id } })
                            : router.dismissTo("/inicio")
                    }
                />
            </View>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    circulo: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
    },
})
