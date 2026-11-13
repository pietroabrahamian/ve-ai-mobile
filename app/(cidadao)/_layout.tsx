import { Redirect, Stack } from "expo-router"

import { Carregando } from "@/components/Estados"
import { useAuth } from "@/contexts/AuthContext"
import { useSessao } from "@/hooks/useSessao"
import { cores } from "@/theme"

// Área do cidadão: exige sessão e papel CIDADAO (rota protegida)
export default function LayoutCidadao() {
    const { usuario, papel, iniciando } = useAuth()
    useSessao({ encerrar: true }) // encerra a sessão quando o JWT vence

    if (iniciando) return <Carregando />
    if (!usuario) return <Redirect href="/login" />
    if (papel !== "CIDADAO") return <Redirect href="/" />

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
}
