import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"

import { cores } from "@/theme"
import type { Direcao, Perigo } from "@/types/api"

import { Nota } from "./Blocos"
import { Texto } from "./Texto"

const DIRECAO: Record<Direcao, string> = {
    frente: "à frente",
    "frente-direita": "à frente, à direita",
    direita: "à direita",
    "frente-esquerda": "à frente, à esquerda",
    esquerda: "à esquerda",
}

// Perigo da descrição (.hazard do protótipo): vermelho, com direção e distância
export function CardPerigo({ perigo }: { perigo: Perigo }) {
    const detalhe = `${DIRECAO[perigo.direcao] ?? perigo.direcao} · ${perigo.distanciaAprox}`
    return (
        <View style={estilos.card} accessible accessibilityLabel={`Perigo: ${perigo.descricao}, ${detalhe}`}>
            <View style={estilos.icone}>
                <Ionicons name="warning-outline" size={28} color={cores.perigo} />
            </View>
            <View style={{ flex: 1 }}>
                <Texto negrito style={{ fontSize: 18 }}>
                    {perigo.descricao}
                </Texto>
                <Texto variante="pequeno">{detalhe}</Texto>
            </View>
        </View>
    )
}

// Lista de perigos. Sem perigo, o app NUNCA diz que o caminho está livre.
export function ListaPerigos({ perigos }: { perigos: Perigo[] }) {
    if (perigos.length === 0) {
        return <Nota texto="Nenhum perigo identificado. Isso não garante que o caminho esteja livre." />
    }
    return (
        <View style={{ gap: 10 }}>
            {perigos.map((p, i) => (
                <CardPerigo key={i} perigo={p} />
            ))}
        </View>
    )
}

const estilos = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 14,
        alignItems: "center",
        padding: 16,
        borderRadius: 20,
        backgroundColor: "rgba(255,107,94,0.1)",
        borderWidth: 1.5,
        borderColor: "rgba(255,107,94,0.45)",
    },
    icone: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: "rgba(255,107,94,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
})
