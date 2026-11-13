import { StyleSheet, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

import { cores } from "@/theme"

import { Texto } from "./Texto"

// Cor das ondas externas do logo
const ONDA_EXTERNA = "#8FA3C9"

// Logo do Vê AI: um olho com ondas de som dos dois lados ("ver" pelo áudio).
// Desenhado em vetor a partir da arte do grupo, sem o quadrado de fundo, para combinar com qualquer tela.
export function SimboloLogo({ largura = 120 }: { largura?: number }) {
    return (
        <Svg width={largura} height={(largura * 104) / 170} viewBox="0 0 170 104" fill="none">
            <Path
                d="M8 52 C 48 2, 122 2, 162 52 C 122 102, 48 102, 8 52 Z"
                stroke={cores.amarelo}
                strokeWidth={10}
                strokeLinejoin="round"
            />
            <Circle cx={85} cy={52} r={14} fill={cores.amarelo} />
            <Path d="M64 37 A 19 19 0 0 0 64 67" stroke={cores.texto} strokeWidth={6} strokeLinecap="round" />
            <Path
                d="M106 37 A 19 19 0 0 1 106 67"
                stroke={cores.texto}
                strokeWidth={6}
                strokeLinecap="round"
            />
            <Path
                d="M52 29 A 30 30 0 0 0 52 75"
                stroke={ONDA_EXTERNA}
                strokeWidth={6}
                strokeLinecap="round"
            />
            <Path
                d="M118 29 A 30 30 0 0 1 118 75"
                stroke={ONDA_EXTERNA}
                strokeWidth={6}
                strokeLinecap="round"
            />
        </Svg>
    )
}

// "completo": logo + "Vê AI" + "Enxergue além." (Início e Login). "mini": topo das subtelas.
export function Logo({ variante = "completo" }: { variante?: "completo" | "mini" }) {
    const mini = variante === "mini"
    return (
        <View
            style={estilos.linha}
            accessible
            accessibilityRole="image"
            accessibilityLabel={mini ? "Vê AI" : "Vê AI. Enxergue além."}
        >
            <SimboloLogo largura={mini ? 64 : 112} />
            <View style={[estilos.separador, mini && { height: 32 }]} />
            <View>
                <Texto variante="marca" style={mini && estilos.marcaMini}>
                    Vê{" "}
                    <Texto variante="marca" cor={cores.amarelo} style={mini && estilos.marcaMini}>
                        AI
                    </Texto>
                </Texto>
                {!mini && (
                    <Texto variante="subtitulo" style={estilos.slogan}>
                        Enxergue além.
                    </Texto>
                )}
            </View>
        </View>
    )
}

const estilos = StyleSheet.create({
    linha: { flexDirection: "row", alignItems: "center", gap: 12 },
    separador: { width: 2, height: 58, borderRadius: 2, backgroundColor: cores.borda2 },
    marcaMini: { fontSize: 24, lineHeight: 28 },
    slogan: { marginTop: 2 },
})
