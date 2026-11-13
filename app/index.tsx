import { Redirect } from "expo-router"

import { Carregando } from "@/components/Estados"
import { useAuth } from "@/contexts/AuthContext"

// Porta de entrada: sem sessão vai ao login; com sessão, à área do papel (cidadão ou gestor)
export default function Entrada() {
    const { usuario, papel, iniciando } = useAuth()

    if (iniciando) return <Carregando mensagem="Abrindo o Vê AI…" />
    if (!usuario) return <Redirect href="/login" />
    return <Redirect href={papel === "GESTOR" ? "/fila" : "/inicio"} />
}
