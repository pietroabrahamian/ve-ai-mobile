import type { ReactNode } from "react"
import { StyleSheet, Text, type TextProps } from "react-native"

import { cores, fontes } from "@/theme"

type Variante = "marca" | "tituloGrande" | "titulo" | "subtitulo" | "corpo" | "destaque" | "pequeno" | "secao"

type Props = TextProps & {
    variante?: Variante
    negrito?: boolean
    cor?: string
    centro?: boolean
}

// Texto com as fontes do app. Respeita o tamanho de fonte escolhido no sistema (allowFontScaling).
export function Texto({ variante = "corpo", negrito, cor, centro, style, ...props }: Props) {
    return (
        <Text
            {...props}
            style={[
                estilos[variante],
                negrito && { fontFamily: fontes.negrito },
                cor !== undefined && { color: cor },
                centro && { textAlign: "center" },
                style,
            ]}
        />
    )
}

// Palavra destacada em amarelo dentro de um título ("Como posso ajudar *você* hoje?")
export function Destaque({ children }: { children: ReactNode }) {
    return <Text style={{ color: cores.amarelo }}>{children}</Text>
}

const estilos = StyleSheet.create({
    marca: { fontFamily: fontes.titulo, fontSize: 40, lineHeight: 44, letterSpacing: -1, color: cores.texto },
    tituloGrande: {
        fontFamily: fontes.titulo,
        fontSize: 35,
        lineHeight: 40,
        letterSpacing: -0.8,
        color: cores.texto,
    },
    titulo: {
        fontFamily: fontes.titulo,
        fontSize: 30,
        lineHeight: 34,
        letterSpacing: -0.6,
        color: cores.texto,
    },
    subtitulo: { fontFamily: fontes.texto, fontSize: 17, lineHeight: 23, color: cores.textoSecundario },
    corpo: { fontFamily: fontes.texto, fontSize: 17, lineHeight: 24, color: cores.texto },
    destaque: { fontFamily: fontes.texto, fontSize: 20, lineHeight: 29, color: cores.texto },
    pequeno: { fontFamily: fontes.texto, fontSize: 14.5, lineHeight: 19, color: cores.textoSecundario },
    secao: {
        fontFamily: fontes.negrito,
        fontSize: 13,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: cores.textoTerciario,
    },
})
