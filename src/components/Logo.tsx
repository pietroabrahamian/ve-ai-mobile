import { StyleSheet, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

import { cores } from "@/theme"

import { Texto } from "./Texto"

// O mesmo SVG do protótipo: um olho com ondas de som dos dois lados ("ver" pelo áudio)
export function SimboloLogo({ largura = 120 }: { largura?: number }) {
    return (
        <Svg width={largura} height={(largura * 110) / 160} viewBox="0 0 160 110" fill="none">
            <Path
                d="M8 55 C 40 6, 120 6, 152 55 C 120 104, 40 104, 8 55 Z"
                stroke={cores.amarelo}
                strokeWidth={10}
                strokeLinejoin="round"
            />
            <Path
                d="M150 58 C 135 80, 112 96, 84 100"
                stroke={cores.amarelo2}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={0.6}
            />
            <Circle cx={80} cy={55} r={23} fill={cores.amarelo} />
            <Circle cx={80} cy={55} r={15} fill={cores.fundo} />
            <Path d="M80 44v10" stroke={cores.amarelo} strokeWidth={5} strokeLinecap="round" />
            <Path d="M74 50a8 8 0 1 0 12 0" stroke={cores.amarelo} strokeWidth={4} strokeLinecap="round" />
            <Path
                d="M50 42a20 20 0 0 0 0 26M41 36a30 30 0 0 0 0 38"
                stroke={cores.texto}
                strokeWidth={5}
                strokeLinecap="round"
            />
            <Path
                d="M110 42a20 20 0 0 1 0 26M119 36a30 30 0 0 1 0 38"
                stroke={cores.texto}
                strokeWidth={5}
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
