import { Pressable, StyleSheet, View } from "react-native"

import { cores } from "@/theme"

import { Texto } from "./Texto"

// Linha com chave liga/desliga (.toggle do protótipo). O leitor de tela fala "ligado"/"desligado".
export function Interruptor({
    titulo,
    descricao,
    valor,
    onChange,
    ultimo,
}: {
    titulo: string
    descricao?: string
    valor: boolean
    onChange: (v: boolean) => void
    ultimo?: boolean
}) {
    return (
        <Pressable
            onPress={() => onChange(!valor)}
            accessibilityRole="switch"
            accessibilityLabel={titulo}
            accessibilityHint={descricao}
            accessibilityState={{ checked: valor }}
            style={[estilos.linha, !ultimo && estilos.divisor]}
        >
            <View style={{ flex: 1 }}>
                <Texto negrito style={{ fontSize: 17.5 }}>
                    {titulo}
                </Texto>
                {!!descricao && (
                    <Texto variante="pequeno" style={{ marginTop: 3 }}>
                        {descricao}
                    </Texto>
                )}
            </View>
            <View style={[estilos.trilho, valor && { backgroundColor: cores.amarelo }]}>
                <View style={[estilos.bola, valor && { left: 30, backgroundColor: cores.sobreAmarelo }]} />
            </View>
        </Pressable>
    )
}

const estilos = StyleSheet.create({
    linha: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 76, paddingVertical: 12 },
    divisor: { borderBottomWidth: 1, borderBottomColor: cores.divisor },
    trilho: { width: 62, height: 36, borderRadius: 99, backgroundColor: "#24386C" },
    bola: {
        position: "absolute",
        top: 4,
        left: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: cores.texto,
    },
})
