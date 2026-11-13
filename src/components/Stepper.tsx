import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"

import { cores, fontes } from "@/theme"
import type { StatusRelato } from "@/types/api"
import { FLUXO_STATUS, rotuloStatus, statusFalado } from "@/utils/textos"

import { Nota } from "./Blocos"
import { Texto } from "./Texto"

// Andamento do relato (.stepper): Aberto → Em triagem → Encaminhado → Resolvido
export function Stepper({ status }: { status: StatusRelato }) {
    if (status === "DESCARTADO") return <Nota texto="Relato descartado" icone="close" tom="neutro" />
    const atual = FLUXO_STATUS.indexOf(status)
    return (
        <View style={estilos.linha} accessible accessibilityLabel={`Andamento: ${statusFalado[status]}`}>
            {FLUXO_STATUS.map((etapa, i) => {
                const feito = i <= atual
                return (
                    <View key={etapa} style={estilos.etapa}>
                        {i > 0 && (
                            <View style={[estilos.trilho, feito && { backgroundColor: cores.amarelo }]} />
                        )}
                        <View
                            style={[
                                estilos.bola,
                                feito && estilos.bolaFeita,
                                i === atual && estilos.bolaAtual,
                            ]}
                        >
                            {feito && <Ionicons name="checkmark" size={16} color={cores.sobreAmarelo} />}
                        </View>
                        <Texto style={[estilos.rotulo, feito && { color: cores.texto }]}>
                            {rotuloStatus[etapa]}
                        </Texto>
                    </View>
                )
            })}
        </View>
    )
}

const estilos = StyleSheet.create({
    linha: { flexDirection: "row", alignItems: "flex-start", marginVertical: 4 },
    etapa: { flex: 1, alignItems: "center", gap: 8 },
    trilho: {
        position: "absolute",
        top: 14,
        right: "50%",
        width: "100%",
        height: 2,
        backgroundColor: cores.borda2,
    },
    bola: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: cores.borda2,
        backgroundColor: cores.fundo,
        alignItems: "center",
        justifyContent: "center",
    },
    bolaFeita: { backgroundColor: cores.amarelo, borderColor: cores.amarelo },
    bolaAtual: { boxShadow: "0 0 0 5px rgba(255,200,30,0.2)" },
    rotulo: { fontFamily: fontes.negrito, fontSize: 12.5, color: cores.textoTerciario, textAlign: "center" },
})
