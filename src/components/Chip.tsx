import { Ionicons } from "@expo/vector-icons"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"

import { alvoToque, borda, cores, fontes, raios } from "@/theme"

import type { NomeIcone } from "./Botao"
import { Texto } from "./Texto"

// Etiqueta simples (.chip do protótipo), por exemplo os objetos vistos na foto
export function Chip({ texto, icone }: { texto: string; icone?: NomeIcone }) {
    return (
        <View style={estilos.etiqueta}>
            {icone && <Ionicons name={icone} size={16} color={cores.textoSecundario} />}
            <Texto style={estilos.textoEtiqueta}>{texto}</Texto>
        </View>
    )
}

type OpcaoFiltro<T extends string> = { valor: T; rotulo: string }

// Filtros em pílula com rolagem lateral (.filter do protótipo)
export function Filtros<T extends string>({
    opcoes,
    valor,
    onChange,
    rotuloGrupo,
}: {
    opcoes: OpcaoFiltro<T>[]
    valor: T
    onChange: (v: T) => void
    rotuloGrupo: string
}) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.filtros}
            accessibilityRole="radiogroup"
            accessibilityLabel={rotuloGrupo}
        >
            {opcoes.map((o) => {
                const marcado = o.valor === valor
                return (
                    <Pressable
                        key={o.valor}
                        onPress={() => onChange(o.valor)}
                        accessibilityRole="radio"
                        accessibilityLabel={o.rotulo}
                        accessibilityState={{ checked: marcado }}
                        style={[estilos.filtro, marcado && estilos.filtroMarcado]}
                    >
                        <Texto
                            style={[
                                estilos.textoFiltro,
                                { color: marcado ? cores.sobreAmarelo : cores.textoSecundario },
                            ]}
                        >
                            {o.rotulo}
                        </Texto>
                    </Pressable>
                )
            })}
        </ScrollView>
    )
}

const estilos = StyleSheet.create({
    etiqueta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: raios.pilula,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundColor: "#0E1D45",
    },
    textoEtiqueta: { fontSize: 15, color: cores.textoSecundario },
    filtros: { gap: 8, paddingVertical: 2 },
    filtro: {
        minHeight: alvoToque.minimo,
        paddingHorizontal: 18,
        borderRadius: raios.pilula,
        borderWidth: borda,
        borderColor: cores.borda,
        alignItems: "center",
        justifyContent: "center",
    },
    filtroMarcado: { backgroundColor: cores.amarelo, borderColor: cores.amarelo },
    textoFiltro: { fontFamily: fontes.negrito, fontSize: 15 },
})
