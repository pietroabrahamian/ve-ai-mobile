import { Ionicons } from "@expo/vector-icons"
import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { borda, cores, fontes, gradientes, raios } from "@/theme"

import { Texto } from "./Texto"

type Props = {
    titulo: string
    subtitulo: string
    icone: ReactNode
    onPress: () => void
    destaque?: boolean // o card principal (Descrever Ambiente) é amarelo
}

// Card grande da tela Início (.action do protótipo): ícone, divisor, título, subtítulo e seta.
// O leitor de tela lê o card inteiro como um botão só.
export function BotaoAcao({ titulo, subtitulo, icone, onPress, destaque }: Props) {
    const cor = destaque ? cores.sobreAmarelo : cores.texto
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${titulo.replace("\n", " ")}. ${subtitulo}`}
            style={({ pressed }) => [
                estilos.card,
                destaque && estilos.destaque,
                pressed && { transform: [{ scale: 0.985 }] },
            ]}
        >
            <View style={estilos.icone}>{icone}</View>
            <View
                style={[
                    estilos.divisor,
                    { backgroundColor: destaque ? cores.sobreAmarelo : "rgba(255,255,255,0.75)" },
                ]}
            />
            <View style={{ flex: 1 }}>
                <Texto style={[estilos.titulo, { color: cor }]}>{titulo}</Texto>
                <Texto style={[estilos.subtitulo, { color: destaque ? "#1C2340" : cores.textoSecundario }]}>
                    {subtitulo}
                </Texto>
            </View>
            <Ionicons name="chevron-forward" size={32} color={cor} />
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 128,
        borderRadius: raios.cardGrande,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundImage: gradientes.card,
        paddingVertical: 18,
        paddingLeft: 16,
        paddingRight: 10,
    },
    destaque: {
        backgroundImage: gradientes.amarelo,
        borderColor: "transparent",
        boxShadow: "0 14px 34px rgba(255,200,30,0.18)",
    },
    icone: { width: 84, alignItems: "center", justifyContent: "center" },
    divisor: {
        width: 2,
        alignSelf: "stretch",
        marginVertical: 6,
        marginLeft: 10,
        marginRight: 16,
        borderRadius: 2,
    },
    titulo: { fontFamily: fontes.titulo, fontSize: 24, lineHeight: 28, letterSpacing: -0.4 },
    subtitulo: { fontFamily: fontes.texto, fontSize: 15.5, lineHeight: 20, marginTop: 6 },
})
