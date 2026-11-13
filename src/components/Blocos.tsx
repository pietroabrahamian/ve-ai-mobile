import { Ionicons } from "@expo/vector-icons"
import type { ReactNode } from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"

import { borda, cores, gradientes, raios } from "@/theme"

import type { NomeIcone } from "./Botao"
import { Texto } from "./Texto"

// Pequenos blocos visuais repetidos nas telas (card, título de seção, notas e caixa de informação)

export function Cartao({ children, style }: { children: ReactNode; style?: ViewStyle }) {
    return <View style={[estilos.cartao, style]}>{children}</View>
}

export function Secao({ titulo, direita }: { titulo: string; direita?: ReactNode }) {
    return (
        <View style={estilos.secao}>
            <Texto variante="secao" accessibilityRole="header">
                {titulo}
            </Texto>
            {direita}
        </View>
    )
}

type TomNota = "sucesso" | "aviso" | "neutro" | "perigo"
const TONS: Record<TomNota, { cor: string; fundo: string; borda: string }> = {
    sucesso: { cor: cores.sucesso, fundo: "rgba(74,222,128,0.08)", borda: "rgba(74,222,128,0.25)" },
    aviso: { cor: cores.amarelo, fundo: "rgba(255,200,30,0.08)", borda: "rgba(255,200,30,0.3)" },
    neutro: { cor: cores.textoSecundario, fundo: "#0E1D45", borda: cores.borda },
    perigo: { cor: cores.perigo, fundo: "rgba(255,107,94,0.1)", borda: "rgba(255,107,94,0.45)" },
}

// Faixa de aviso (.ok-note do protótipo)
export function Nota({
    texto,
    icone = "information-circle-outline",
    tom = "sucesso",
}: {
    texto: string
    icone?: NomeIcone
    tom?: TomNota
}) {
    const t = TONS[tom]
    return (
        <View
            style={[estilos.nota, { backgroundColor: t.fundo, borderColor: t.borda }]}
            accessible
            accessibilityLabel={texto}
        >
            <Ionicons name={icone} size={20} color={t.cor} />
            <Texto style={{ color: t.cor, fontSize: 14.5, flex: 1, lineHeight: 19 }}>{texto}</Texto>
        </View>
    )
}

// Caixa "i" do rodapé da tela Descrever (.infobox)
export function CaixaInfo({ children }: { children: ReactNode }) {
    return (
        <View style={estilos.info} accessible>
            <View style={estilos.infoIcone}>
                <Texto style={{ color: cores.fundo, fontSize: 26, fontWeight: "700" }}>i</Texto>
            </View>
            <View style={estilos.infoDivisor} />
            <Texto style={{ flex: 1 }}>{children}</Texto>
        </View>
    )
}

// Linha "rótulo ........ valor" dos cards de resumo
export function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
    return (
        <View style={estilos.linha}>
            <Texto variante="subtitulo">{rotulo}</Texto>
            {typeof children === "string" ? <Texto negrito>{children}</Texto> : children}
        </View>
    )
}

const estilos = StyleSheet.create({
    cartao: {
        backgroundImage: gradientes.card,
        borderWidth: borda,
        borderColor: cores.borda,
        borderRadius: raios.card,
        padding: 18,
    },
    secao: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 10,
        marginHorizontal: 4,
    },
    nota: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderWidth: borda,
        borderColor: cores.borda,
        borderRadius: 22,
        backgroundColor: "#0F2150",
    },
    infoIcone: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: cores.texto,
        alignItems: "center",
        justifyContent: "center",
    },
    infoDivisor: { width: 2, alignSelf: "stretch", backgroundColor: "rgba(255,255,255,0.7)" },
    linha: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginTop: 10,
    },
})
