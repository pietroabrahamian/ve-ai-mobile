import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { login } from "@/api/auth"
import { paraErroApi } from "@/api/erros"
import { Botao } from "@/components/Botao"
import { Campo } from "@/components/Campo"
import { Logo } from "@/components/Logo"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { useAuth } from "@/contexts/AuthContext"
import { avisar, falar } from "@/services/fala"
import { cores, fontes } from "@/theme"
import { contarErros, validarLogin, type ErrosFormulario } from "@/utils/validacao"

export default function Login() {
    const { entrar } = useAuth()
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [erros, setErros] = useState<ErrosFormulario>({})
    const [enviando, setEnviando] = useState(false)

    async function enviar() {
        const encontrados = validarLogin(email, senha)
        setErros(encontrados)
        const n = contarErros(encontrados)
        if (n > 0) {
            avisar("erro")
            falar(n === 1 ? "Há 1 campo com erro." : `Há ${n} campos com erro.`)
            return
        }
        setEnviando(true)
        try {
            const resposta = await login(email, senha)
            await entrar(resposta)
            router.replace("/")
        } catch (e) {
            // 401 "E-mail ou senha incorretos." e qualquer outra mensagem da API: mostra e fala
            const erro = paraErroApi(e)
            setErros({ email: erro.campos.email, senha: erro.campos.senha ?? erro.mensagem })
            avisar("erro")
            falar(erro.mensagem)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Tela decorada>
            <View style={estilos.topo}>
                <Logo />
            </View>
            <Texto variante="tituloGrande" style={{ marginTop: 44, fontSize: 32 }} accessibilityRole="header">
                Que bom ter{"\n"}
                <Destaque>você</Destaque> aqui.
            </Texto>
            <Texto variante="subtitulo" style={{ marginTop: 8 }}>
                Entre para descrever o ambiente e relatar barreiras.
            </Texto>

            <Campo
                rotulo="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                erro={erros.email}
            />
            <Campo
                rotulo="Senha"
                value={senha}
                onChangeText={setSenha}
                placeholder="Sua senha"
                senha
                autoComplete="current-password"
                textContentType="password"
                erro={erros.senha}
                onSubmitEditing={enviar}
            />
            <View style={{ marginTop: 24 }}>
                <Botao texto="Entrar" textoCarregando="Entrando…" carregando={enviando} onPress={enviar} />
            </View>

            <View style={estilos.linhaCadastro}>
                <Texto variante="subtitulo">Ainda não tem conta? </Texto>
                <Pressable onPress={() => router.push("/cadastro")} accessibilityRole="link" hitSlop={12}>
                    <Texto style={estilos.link}>Criar conta</Texto>
                </Pressable>
            </View>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    topo: { paddingTop: 48 },
    linhaCadastro: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        minHeight: 48,
    },
    link: { color: cores.amarelo, fontFamily: fontes.negrito, textDecorationLine: "underline", fontSize: 17 },
})
