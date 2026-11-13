import { useEffect, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"

// A API não tem refresh token: o JWT vale 8 horas e depois disso só fazendo login de novo.
// Usamos o `expiraEm` do login (feedback do professor no PetFlow).

// A partir de quanto tempo antes do vencimento o app avisa, com calma
export const AVISO_ANTES_MS = 15 * 60_000

// Acompanha a expiração da sessão logada:
// - com `encerrar` (só nos layouts das áreas logadas): no horário do vencimento, encerra a sessão;
// - nos 15 minutos antes, devolve os minutos restantes para a tela mostrar um aviso calmo
//   (o aviso fica na tela Início, nunca no meio do modo automático).
export function useSessao({ encerrar = false } = {}) {
    const { expiraEm, sair } = useAuth()
    const [agora, setAgora] = useState(() => Date.now())

    useEffect(() => {
        if (!expiraEm) return
        const relogio = setInterval(() => setAgora(Date.now()), 60_000)
        if (!encerrar) return () => clearInterval(relogio)
        const restante = new Date(expiraEm).getTime() - Date.now()
        const fim = setTimeout(() => sair("expirou"), Math.max(0, restante))
        return () => {
            clearTimeout(fim)
            clearInterval(relogio)
        }
    }, [expiraEm, sair, encerrar])

    if (!expiraEm) return { minutosRestantes: null }
    const restante = new Date(expiraEm).getTime() - agora
    return { minutosRestantes: restante <= AVISO_ANTES_MS ? Math.max(1, Math.ceil(restante / 60_000)) : null }
}
