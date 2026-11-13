import type { ReactNode } from "react"
import { Modal, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { borda, cores, fontes, raios } from "@/theme"

import { Texto } from "./Texto"

type Props = {
    visivel: boolean
    aoFechar: () => void
    titulo?: ReactNode
    texto?: string
    topo?: ReactNode // ícone acima do título
    children?: ReactNode
}

// Painel que sobe de baixo (.sheet do protótipo), feito com o Modal do próprio React Native.
// Usado na sugestão de relato, nas confirmações e na pergunta livre.
export function BottomSheet({ visivel, aoFechar, titulo, texto, topo, children }: Props) {
    const margens = useSafeAreaInsets()
    return (
        <Modal
            visible={visivel}
            transparent
            animationType="slide"
            onRequestClose={aoFechar}
            statusBarTranslucent
        >
            <View style={estilos.fundo}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={aoFechar}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                />
                <View
                    style={[estilos.painel, { paddingBottom: 30 + margens.bottom }]}
                    accessibilityViewIsModal
                >
                    <View style={estilos.alca} />
                    {topo}
                    {titulo && (
                        <Texto
                            style={[estilos.titulo, !!topo && { marginTop: 16 }]}
                            accessibilityRole="header"
                        >
                            {titulo}
                        </Texto>
                    )}
                    {!!texto && (
                        <Texto variante="subtitulo" style={{ marginTop: 10 }}>
                            {texto}
                        </Texto>
                    )}
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const estilos = StyleSheet.create({
    fundo: { flex: 1, justifyContent: "flex-end", backgroundColor: cores.sobreposicao },
    painel: {
        backgroundColor: cores.sheet,
        borderTopWidth: borda,
        borderColor: cores.borda2,
        borderTopLeftRadius: raios.sheet,
        borderTopRightRadius: raios.sheet,
        paddingTop: 14,
        paddingHorizontal: 22,
    },
    alca: {
        width: 52,
        height: 5,
        borderRadius: 5,
        backgroundColor: cores.borda2,
        alignSelf: "center",
        marginBottom: 18,
    },
    titulo: {
        fontFamily: fontes.titulo,
        fontSize: 25,
        lineHeight: 30,
        letterSpacing: -0.4,
        color: cores.texto,
    },
})
