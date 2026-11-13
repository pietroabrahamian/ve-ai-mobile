import { StyleSheet, View } from "react-native"

import { coresGravidade, coresStatus, fontes, raios } from "@/theme"
import type { Gravidade, StatusRelato } from "@/types/api"
import { gravidadeFalada, rotuloGravidade, rotuloStatus, statusFalado } from "@/utils/textos"

import { Texto } from "./Texto"

// Selo de status (.badge .st-*). O leitor de tela ouve o status do jeito do guia ("aguardando análise").
export function BadgeStatus({ status }: { status: StatusRelato }) {
    const { cor, fundo } = coresStatus[status]
    return (
        <View
            style={[estilos.status, { backgroundColor: fundo }]}
            accessible
            accessibilityLabel={`Status: ${statusFalado[status]}`}
        >
            <View style={[estilos.bolinha, { backgroundColor: cor }]} />
            <Texto style={[estilos.textoStatus, { color: cor }]}>{rotuloStatus[status]}</Texto>
        </View>
    )
}

// Selo de gravidade (.gv-*)
export function BadgeGravidade({ gravidade }: { gravidade: Gravidade }) {
    const { cor, fundo } = coresGravidade[gravidade]
    return (
        <View
            style={[estilos.gravidade, { backgroundColor: fundo }]}
            accessible
            accessibilityLabel={gravidadeFalada[gravidade]}
        >
            <Texto style={[estilos.textoGravidade, { color: cor }]}>{rotuloGravidade[gravidade]}</Texto>
        </View>
    )
}

// Selo "Novidade" / "Sem mudança" da última fala do modo automático
export function BadgeNovidade({ novidade }: { novidade: boolean }) {
    return (
        <View
            style={[
                estilos.status,
                { backgroundColor: novidade ? "rgba(255,200,30,0.16)" : "rgba(142,154,184,0.15)" },
            ]}
        >
            <Texto
                style={[
                    estilos.textoStatus,
                    { color: novidade ? coresStatus.EM_TRIAGEM.cor : coresStatus.DESCARTADO.cor },
                ]}
            >
                {novidade ? "Novidade" : "Sem mudança"}
            </Texto>
        </View>
    )
}

const estilos = StyleSheet.create({
    status: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: raios.pilula,
    },
    bolinha: { width: 8, height: 8, borderRadius: 4 },
    textoStatus: { fontFamily: fontes.negrito, fontSize: 13 },
    gravidade: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 9, borderRadius: 8 },
    textoGravidade: { fontFamily: fontes.negrito, fontSize: 12.5, letterSpacing: 0.4 },
})
