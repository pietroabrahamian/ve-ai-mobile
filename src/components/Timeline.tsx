import { StyleSheet, View } from "react-native"

import { cores } from "@/theme"

import { Texto } from "./Texto"

export type EventoTimeline = { titulo: string; quando: string; texto?: string | null }

// Histórico do relato (.timeline do protótipo), do mais recente para o mais antigo
export function Timeline({ eventos }: { eventos: EventoTimeline[] }) {
    return (
        <View style={estilos.timeline}>
            <View style={estilos.trilho} />
            {eventos.map((e, i) => (
                <View
                    key={i}
                    style={estilos.item}
                    accessible
                    accessibilityLabel={`${e.titulo}, ${e.quando}. ${e.texto ?? ""}`}
                >
                    <View style={estilos.bola} />
                    <Texto>
                        <Texto negrito>{e.titulo}</Texto>
                        <Texto variante="pequeno"> · {e.quando}</Texto>
                    </Texto>
                    {!!e.texto && (
                        <Texto variante="pequeno" style={{ marginTop: 3 }}>
                            {e.texto}
                        </Texto>
                    )}
                </View>
            ))}
        </View>
    )
}

const estilos = StyleSheet.create({
    timeline: { paddingLeft: 26 },
    trilho: { position: "absolute", left: 7, top: 6, bottom: 6, width: 2, backgroundColor: cores.borda2 },
    item: { paddingBottom: 16 },
    bola: {
        position: "absolute",
        left: -25,
        top: 5,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: cores.amarelo,
        borderWidth: 3,
        borderColor: cores.fundo,
    },
})
