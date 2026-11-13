import { Redirect, Stack } from "expo-router"

import { Carregando } from "@/components/Estados"
import { useAuth } from "@/contexts/AuthContext"
import { cores } from "@/theme"

// Login e cadastro: quem já está logado não volta para cá (nem pelo botão voltar)
export default function LayoutAuth() {
    const { usuario, iniciando } = useAuth()

    if (iniciando) return <Carregando />
    if (usuario) return <Redirect href="/" />

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
}
