import { Ionicons } from "@expo/vector-icons"
import { useState, type ReactNode } from "react"
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native"

import { borda, cores, fontes, raios } from "@/theme"

import { Texto } from "./Texto"

type Props = Omit<TextInputProps, "style"> & {
    rotulo: string
    erro?: string
    senha?: boolean // mostra o botão "Mostrar senha"
    acessorio?: ReactNode // botão dentro do campo (ex.: ditado)
}

// Campo de formulário (.field + .input do protótipo). O erro entra no que o leitor de tela fala.
export function Campo({ rotulo, erro, senha, acessorio, multiline, onFocus, onBlur, ...props }: Props) {
    const [focado, setFocado] = useState(false)
    const [mostrar, setMostrar] = useState(false)

    return (
        <View style={estilos.bloco}>
            <Texto style={estilos.rotulo} importantForAccessibility="no" accessibilityElementsHidden>
                {rotulo}
            </Texto>
            <View>
                <TextInput
                    {...props}
                    multiline={multiline}
                    secureTextEntry={senha && !mostrar}
                    accessibilityLabel={erro ? `${rotulo}. Erro: ${erro}` : rotulo}
                    placeholderTextColor={cores.textoTerciario}
                    selectionColor={cores.amarelo}
                    onFocus={(e) => {
                        setFocado(true)
                        onFocus?.(e)
                    }}
                    onBlur={(e) => {
                        setFocado(false)
                        onBlur?.(e)
                    }}
                    style={[
                        estilos.input,
                        multiline && estilos.multilinha,
                        senha || acessorio ? { paddingRight: 64 } : null,
                        focado && { borderColor: cores.amarelo },
                        !!erro && { borderColor: cores.perigo },
                    ]}
                />
                {senha && (
                    <Pressable
                        onPress={() => setMostrar((v) => !v)}
                        accessibilityRole="button"
                        accessibilityLabel={mostrar ? "Esconder senha" : "Mostrar senha"}
                        style={estilos.botaoSenha}
                    >
                        <Ionicons
                            name={mostrar ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color={cores.textoSecundario}
                        />
                    </Pressable>
                )}
                {acessorio && <View style={estilos.acessorio}>{acessorio}</View>}
            </View>
            {!!erro && (
                <View
                    style={estilos.erro}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                >
                    <Ionicons name="alert-circle-outline" size={18} color={cores.perigo} />
                    <Texto style={estilos.textoErro}>{erro}</Texto>
                </View>
            )}
        </View>
    )
}

const estilos = StyleSheet.create({
    bloco: { marginTop: 16 },
    rotulo: {
        fontFamily: fontes.negrito,
        fontSize: 15,
        color: cores.textoSecundario,
        marginLeft: 4,
        marginBottom: 8,
    },
    input: {
        minHeight: 62,
        borderRadius: raios.campo,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundColor: cores.campo,
        paddingHorizontal: 18,
        fontFamily: fontes.texto,
        fontSize: 18,
        color: cores.texto,
    },
    multilinha: { minHeight: 120, paddingTop: 16, paddingBottom: 16, textAlignVertical: "top" },
    botaoSenha: {
        position: "absolute",
        right: 6,
        top: 5,
        width: 52,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
    },
    acessorio: { position: "absolute", right: 10, bottom: 10 },
    erro: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7, marginLeft: 4 },
    textoErro: { color: cores.perigo, fontSize: 14.5, flex: 1 },
})
