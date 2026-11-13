import { Ionicons } from "@expo/vector-icons"
import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { borda, cores, fontes, gradientes, raios } from "@/theme"

import { Texto } from "./Texto"

type Props = {
    titulo: string
    subtitulo?: string
    icone?: ReactNode
    meta?: ReactNode // linha de baixo: badges, hora, apoios
    extra?: ReactNode // conteúdo livre embaixo (ex.: barra de prioridade)
    naoLido?: boolean // notificação não lida: borda amarela e texto em negrito
    onPress: () => void
    rotulo?: string // o que o leitor de tela lê no lugar dos pedaços soltos
}

// Item de lista clicável (.list-item do protótipo)
export function ItemLista({ titulo, subtitulo, icone, meta, extra, naoLido, onPress, rotulo }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={
                rotulo ?? [naoLido ? "Não lida" : "", titulo, subtitulo].filter(Boolean).join(". ")
            }
            style={({ pressed }) => [
                estilos.item,
                naoLido && { borderColor: cores.amarelo },
                pressed && { opacity: 0.85 },
            ]}
        >
            {naoLido && <View style={estilos.ponto} />}
            {icone && <View style={estilos.icone}>{icone}</View>}
            <View style={{ flex: 1, minWidth: 0 }}>
                <Texto style={[estilos.titulo, naoLido === false && { fontFamily: fontes.texto }]}>
                    {titulo}
                </Texto>
                {!!subtitulo && (
                    <Texto variante="pequeno" style={{ marginTop: 4 }}>
                        {subtitulo}
                    </Texto>
                )}
                {meta && <View style={estilos.meta}>{meta}</View>}
                {extra}
            </View>
            <Ionicons name="chevron-forward" size={24} color={cores.texto} />
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        minHeight: 88,
        padding: 16,
        borderRadius: 22,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundImage: gradientes.card,
    },
    ponto: { width: 11, height: 11, borderRadius: 6, backgroundColor: cores.amarelo },
    icone: {
        width: 52,
        height: 52,
        borderRadius: raios.botaoPequeno,
        backgroundColor: "rgba(255,200,30,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    titulo: { fontFamily: fontes.negrito, fontSize: 17.5, lineHeight: 22, color: cores.texto },
    meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 },
})
