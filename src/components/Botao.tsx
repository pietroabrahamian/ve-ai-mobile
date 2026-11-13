import { Ionicons } from "@expo/vector-icons"
import type { ReactNode } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"

import { alvoToque, borda, cores, fontes, gradientes, raios } from "@/theme"

import { Texto } from "./Texto"

export type NomeIcone = keyof typeof Ionicons.glyphMap

type Props = {
    texto: string
    onPress: () => void
    variante?: "primario" | "fantasma" | "perigo"
    pequeno?: boolean
    icone?: NomeIcone
    iconeCustom?: ReactNode
    carregando?: boolean
    textoCarregando?: string
    desabilitado?: boolean
    rotulo?: string // quando o texto visível não basta para o leitor de tela
    selecionado?: boolean
}

// Botão padrão (.btn do protótipo): amarelo, contorno ou vermelho, com alvo de toque de 64 dp
export function Botao({
    texto,
    onPress,
    variante = "primario",
    pequeno,
    icone,
    iconeCustom,
    carregando,
    textoCarregando,
    desabilitado,
    rotulo,
    selecionado,
}: Props) {
    const inativo = desabilitado || carregando
    const cor =
        variante === "primario" ? cores.sobreAmarelo : variante === "perigo" ? cores.perigo : cores.texto

    return (
        <Pressable
            onPress={onPress}
            disabled={inativo}
            accessibilityRole="button"
            accessibilityLabel={carregando ? (textoCarregando ?? texto) : (rotulo ?? texto)}
            accessibilityState={{ disabled: !!inativo, busy: !!carregando, selected: selecionado }}
            style={({ pressed }) => [
                estilos.base,
                pequeno && estilos.pequeno,
                estilos[variante],
                desabilitado && estilos.inativo,
                pressed && { transform: [{ scale: 0.985 }] },
            ]}
        >
            <View style={estilos.conteudo}>
                {carregando ? (
                    <ActivityIndicator color={cor} />
                ) : (
                    (iconeCustom ?? (icone && <Ionicons name={icone} size={pequeno ? 22 : 24} color={cor} />))
                )}
                <Texto style={[estilos.texto, pequeno && { fontSize: 16 }, { color: cor }]}>
                    {carregando ? (textoCarregando ?? texto) : texto}
                </Texto>
            </View>
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    base: {
        minHeight: alvoToque.principal,
        borderRadius: raios.botao,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    pequeno: { minHeight: 52, borderRadius: raios.botaoPequeno },
    primario: { backgroundImage: gradientes.amarelo },
    fantasma: { borderWidth: borda, borderColor: cores.borda2 },
    perigo: { borderWidth: borda, borderColor: "rgba(255,107,94,0.6)" },
    inativo: { opacity: 0.45 },
    conteudo: { flexDirection: "row", alignItems: "center", gap: 10 },
    texto: { fontFamily: fontes.negrito, fontSize: 19 },
})
