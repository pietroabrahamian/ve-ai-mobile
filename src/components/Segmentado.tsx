import type { ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { borda, cores, fontes, gradientes, raios } from "@/theme"

import { Texto } from "./Texto"

export type OpcaoSegmentado<T extends string | number> = {
    valor: T
    rotulo: string
    icone?: (cor: string) => ReactNode
}

type Props<T extends string | number> = {
    opcoes: OpcaoSegmentado<T>[]
    valor: T
    onChange: (valor: T) => void
    rotuloGrupo: string // nome do grupo para o leitor de tela
    pequeno?: boolean
}

// Controle segmentado (.seg do protótipo). O leitor de tela anuncia a opção marcada.
export function Segmentado<T extends string | number>({
    opcoes,
    valor,
    onChange,
    rotuloGrupo,
    pequeno,
}: Props<T>) {
    return (
        <View style={estilos.grupo} accessibilityRole="radiogroup" accessibilityLabel={rotuloGrupo}>
            {opcoes.map((opcao) => {
                const marcado = opcao.valor === valor
                const cor = marcado ? cores.sobreAmarelo : cores.texto
                return (
                    <Pressable
                        key={String(opcao.valor)}
                        onPress={() => onChange(opcao.valor)}
                        accessibilityRole="radio"
                        accessibilityLabel={opcao.rotulo}
                        accessibilityState={{ checked: marcado }}
                        style={[estilos.opcao, pequeno && { minHeight: 52 }, marcado && estilos.marcada]}
                    >
                        {opcao.icone?.(cor)}
                        <Texto style={[estilos.texto, pequeno && { fontSize: 16 }, { color: cor }]}>
                            {opcao.rotulo}
                        </Texto>
                    </Pressable>
                )
            })}
        </View>
    )
}

const estilos = StyleSheet.create({
    grupo: {
        flexDirection: "row",
        borderWidth: borda,
        borderColor: cores.borda,
        borderRadius: raios.pilula,
        backgroundColor: "#0D1B40",
    },
    opcao: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        minHeight: 72,
        borderRadius: raios.pilula,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    marcada: { backgroundImage: gradientes.amarelo },
    texto: { fontFamily: fontes.negrito, fontSize: 20 },
})
