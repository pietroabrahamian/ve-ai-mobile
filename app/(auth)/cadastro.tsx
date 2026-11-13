import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { View } from "react-native"

import { login, registrar } from "@/api/auth"
import { paraErroApi } from "@/api/erros"
import { Cartao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { Campo } from "@/components/Campo"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { mostrarToast } from "@/components/Toast"
import { useAuth } from "@/contexts/AuthContext"
import { avisar, falar } from "@/services/fala"
import { cores } from "@/theme"
import { contarErros, validarCadastro, type ErrosFormulario } from "@/utils/validacao"

export default function Cadastro() {
    const { entrar } = useAuth()
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmacao, setConfirmacao] = useState("")
    const [erros, setErros] = useState<ErrosFormulario>({})
    const [enviando, setEnviando] = useState(false)

    async function enviar() {
        const encontrados = validarCadastro(nome, email, senha, confirmacao)
        setErros(encontrados)
        const n = contarErros(encontrados)
        if (n > 0) {
            avisar("erro")
            falar(n === 1 ? "Há 1 campo com erro." : `Há ${n} campos com erro.`)
            return
        }
        setEnviando(true)
        try {
            await registrar(nome, email, senha)
            // A API cria a conta (201) e o app já entra com ela
            const resposta = await login(email, senha)
            await entrar(resposta)
            mostrarToast("Conta criada. Bem-vindo!")
            falar("Conta criada. Bem-vindo ao Vê AI.")
            router.replace("/")
        } catch (e) {
            // 409 "Já existe uma conta com este e-mail." ou 400 com os campos marcados
            const erro = paraErroApi(e)
            setErros({
                nome: erro.campos.nome,
                email: erro.campos.email ?? (erro.status === 409 ? erro.mensagem : undefined),
                senha: erro.campos.senha,
            })
            avisar("erro")
            falar(erro.mensagem)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Tela comTopo>
            <Texto variante="titulo" accessibilityRole="header">
                Criar <Destaque>conta</Destaque>
            </Texto>
            <Texto variante="subtitulo" style={{ marginTop: 8 }}>
                O cadastro é para cidadãos. Gestores da rede de apoio recebem acesso da organização.
            </Texto>

            <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={setNome}
                placeholder="Como quer ser chamado"
                autoComplete="name"
                maxLength={120}
                erro={erros.nome}
            />
            <Campo
                rotulo="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                maxLength={160}
                erro={erros.email}
            />
            <Campo
                rotulo="Senha"
                value={senha}
                onChangeText={setSenha}
                placeholder="Mínimo de 8 caracteres"
                senha
                autoComplete="new-password"
                maxLength={72}
                erro={erros.senha}
            />
            <Campo
                rotulo="Confirmar senha"
                value={confirmacao}
                onChangeText={setConfirmacao}
                placeholder="Repita a senha"
                senha
                autoComplete="new-password"
                maxLength={72}
                erro={erros.confirmacao}
                onSubmitEditing={enviar}
            />

            <Cartao style={{ marginTop: 20, flexDirection: "row", gap: 12 }}>
                <Ionicons name="shield-checkmark-outline" size={28} color={cores.amarelo} />
                <Texto variante="pequeno" style={{ flex: 1, lineHeight: 21 }}>
                    <Texto negrito style={{ fontSize: 14.5 }}>
                        Sua privacidade:{" "}
                    </Texto>
                    as fotos nunca são armazenadas. Guardamos só o texto da descrição. A localização só é
                    enviada quando você decide relatar um problema.
                </Texto>
            </Cartao>

            <View style={{ marginTop: 20 }}>
                <Botao
                    texto="Criar conta"
                    textoCarregando="Criando conta…"
                    carregando={enviando}
                    onPress={enviar}
                />
            </View>
        </Tela>
    )
}
