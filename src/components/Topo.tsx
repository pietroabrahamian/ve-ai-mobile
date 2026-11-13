import { Ionicons } from "@expo/vector-icons"
import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { alvoToque, borda, cores } from "@/theme"

import type { NomeIcone } from "./Botao"
import { Logo } from "./Logo"
import { Texto } from "./Texto"

// Topo das subtelas (.topbar do protótipo): "‹ Voltar", logo pequeno no meio e um botão à direita
export function Topo({ aoVoltar, direita }: { aoVoltar: () => void; direita?: ReactNode }) {
    return (
        <View style={estilos.topo}>
            <View style={estilos.lado}>
                <Pressable
                    onPress={aoVoltar}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    hitSlop={8}
                    style={estilos.voltar}
                >
                    <Ionicons name="chevron-back" size={28} color={cores.texto} />
                    <Texto>Voltar</Texto>
                </Pressable>
            </View>
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                <Logo variante="mini" />
            </View>
            <View style={[estilos.lado, { alignItems: "flex-end" }]}>{direita}</View>
        </View>
    )
}

// Botão redondo só com ícone (.iconbtn), como a engrenagem e o sino
export function BotaoIcone({
    icone,
    rotulo,
    onPress,
    contorno,
    amarelo,
    ponto,
    tamanho = 52,
}: {
    icone: NomeIcone
    rotulo: string
    onPress: () => void
    contorno?: boolean
    amarelo?: boolean
    ponto?: boolean // bolinha amarela de "tem novidade"
    tamanho?: number
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            style={[
                estilos.botaoIcone,
                { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
                contorno && estilos.contorno,
                amarelo && { backgroundColor: cores.amarelo },
            ]}
        >
            <Ionicons name={icone} size={tamanho * 0.55} color={amarelo ? cores.sobreAmarelo : cores.texto} />
            {ponto && <View style={estilos.ponto} />}
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    topo: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 60,
        paddingTop: 6,
        paddingBottom: 4,
        paddingHorizontal: 12,
    },
    lado: { flex: 1 },
    voltar: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: alvoToque.minimo,
        alignSelf: "flex-start",
        paddingRight: 6,
    },
    botaoIcone: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: alvoToque.minimo,
        minHeight: alvoToque.minimo,
    },
    contorno: { borderWidth: borda, borderColor: cores.borda, backgroundColor: "rgba(10,20,48,0.6)" },
    ponto: {
        position: "absolute",
        top: 8,
        right: 9,
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: cores.amarelo,
        borderWidth: 2,
        borderColor: cores.fundo,
    },
})
