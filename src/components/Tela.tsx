import { router } from "expo-router"
import type { ReactNode } from "react"
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
    type ScrollViewProps,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { cores, margemTela } from "@/theme"

import { FundoDecorativo } from "./FundoDecorativo"
import { Topo } from "./Topo"

type Props = {
    children: ReactNode
    // Subtelas mostram o topo com "‹ Voltar" e o logo pequeno
    comTopo?: boolean
    direitaTopo?: ReactNode
    aoVoltar?: () => void
    decorada?: boolean // faixas amarelas do fundo (Início e Login)
    rolar?: boolean
    semMargem?: boolean
} & Pick<ScrollViewProps, "refreshControl">

// Moldura comum das telas: área segura, fundo, topo opcional e rolagem
export function Tela({
    children,
    comTopo,
    direitaTopo,
    aoVoltar,
    decorada,
    rolar = true,
    semMargem,
    refreshControl,
}: Props) {
    const voltar = aoVoltar ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))
    const conteudo = <View style={[!semMargem && estilos.margem, estilos.final]}>{children}</View>

    return (
        <SafeAreaView style={estilos.tela} edges={["top", "left", "right"]}>
            {decorada && <FundoDecorativo />}
            {comTopo && <Topo aoVoltar={voltar} direita={direitaTopo} />}
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {rolar ? (
                    <ScrollView keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
                        {conteudo}
                    </ScrollView>
                ) : (
                    conteudo
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: "transparent" },
    margem: { paddingHorizontal: margemTela },
    final: { paddingBottom: 28, flexGrow: 1 },
})

export const fundoTela = { flex: 1, backgroundColor: cores.fundo }
