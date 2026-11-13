import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { AccessibilityInfo, StyleSheet, View } from "react-native"

import { cores, fontes } from "@/theme"

import { Texto } from "./Texto"

// Aviso curto na parte de baixo da tela (.toast do protótipo).
// Qualquer tela chama mostrarToast("..."); o <ToastHost /> do layout raiz desenha.
const DURACAO_MS = 2800

type Aviso = { mensagem: string; tipo: "sucesso" | "erro" }
let ouvinte: ((aviso: Aviso) => void) | null = null

export function mostrarToast(mensagem: string, tipo: Aviso["tipo"] = "sucesso") {
    ouvinte?.({ mensagem, tipo })
}

export function ToastHost() {
    const [aviso, setAviso] = useState<Aviso | null>(null)

    useEffect(() => {
        ouvinte = setAviso
        return () => {
            ouvinte = null
        }
    }, [])

    useEffect(() => {
        if (!aviso) return
        AccessibilityInfo.announceForAccessibility(aviso.mensagem)
        const id = setTimeout(() => setAviso(null), DURACAO_MS)
        return () => clearTimeout(id)
    }, [aviso])

    if (!aviso) return null
    const erro = aviso.tipo === "erro"
    return (
        <View style={estilos.toast} pointerEvents="none" accessibilityLiveRegion="polite">
            <Ionicons
                name={erro ? "alert-circle" : "checkmark-circle"}
                size={24}
                color={erro ? "#C2372B" : cores.sobreAmarelo}
            />
            <Texto style={estilos.texto}>{aviso.mensagem}</Texto>
        </View>
    )
}

const estilos = StyleSheet.create({
    toast: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 110,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: cores.toast,
        boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
    },
    texto: { flex: 1, fontFamily: fontes.negrito, fontSize: 16, color: cores.sobreAmarelo },
})
