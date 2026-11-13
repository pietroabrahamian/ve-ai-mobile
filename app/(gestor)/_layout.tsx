import { Redirect, Stack } from "expo-router"

import { Carregando } from "@/components/Estados"
import { useAuth } from "@/contexts/AuthContext"
import { useSessao } from "@/hooks/useSessao"
import { cores } from "@/theme"

// Área do gestor da rede de apoio: exige sessão e papel GESTOR (rota protegida)
export default function LayoutGestor() {
    const { usuario, papel, iniciando } = useAuth()
    useSessao({ encerrar: true })

    if (iniciando) return <Carregando />
    if (!usuario) return <Redirect href="/login" />
    if (papel !== "GESTOR") return <Redirect href="/" />

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
}
