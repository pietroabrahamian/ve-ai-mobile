import { Ionicons } from "@expo/vector-icons"
import { ActivityIndicator, StyleSheet, View } from "react-native"

import { mensagemDe } from "@/api/erros"
import { cores } from "@/theme"

import { Botao, type NomeIcone } from "./Botao"
import { Texto } from "./Texto"

// Carregando: spinner amarelo do protótipo
export function Carregando({ mensagem = "Carregando…" }: { mensagem?: string }) {
    return (
        <View style={estilos.caixa} accessible accessibilityRole="progressbar" accessibilityLabel={mensagem}>
            <ActivityIndicator size="large" color={cores.amarelo} />
            <Texto variante="subtitulo">{mensagem}</Texto>
        </View>
    )
}

// Lista vazia (.empty do protótipo)
export function EstadoVazio({ icone, mensagem }: { icone: NomeIcone; mensagem: string }) {
    return (
        <View style={estilos.caixa} accessible accessibilityLabel={mensagem}>
            <Ionicons name={icone} size={48} color={cores.textoSecundario} />
            <Texto variante="subtitulo" centro>
                {mensagem}
            </Texto>
        </View>
    )
}

// Erro de carregamento com a mensagem da API e o botão "Tentar de novo"
export function EstadoErro({ erro, aoTentar }: { erro: unknown; aoTentar: () => void }) {
    const mensagem = mensagemDe(erro)
    return (
        <View style={estilos.caixa}>
            <View
                accessible
                accessibilityRole="alert"
                accessibilityLabel={mensagem}
                style={{ alignItems: "center", gap: 12 }}
            >
                <Ionicons name="cloud-offline-outline" size={48} color={cores.perigo} />
                <Texto centro>{mensagem}</Texto>
            </View>
            <View style={{ alignSelf: "stretch", marginTop: 8 }}>
                <Botao
                    texto="Tentar de novo"
                    icone="refresh"
                    variante="fantasma"
                    pequeno
                    onPress={aoTentar}
                />
            </View>
        </View>
    )
}

const estilos = StyleSheet.create({
    caixa: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 40,
        paddingHorizontal: 12,
    },
})
