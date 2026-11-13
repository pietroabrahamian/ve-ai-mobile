import { useMutation } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { salvarPreferencias } from "@/api/usuarios"
import {
    PREFERENCIAS_PADRAO,
    lerPreferencias,
    salvarPreferenciasLocais,
    type PreferenciasLocais,
} from "@/services/armazenamento"
import { configurarFala } from "@/services/fala"

import { useAuth } from "./AuthContext"

// Dois tipos de preferência (guia 4.4):
// - locais, só no aparelho (AsyncStorage): modo automático/manual, intervalo, sons e vibração;
// - da conta, na API (PUT /usuarios/me/preferencias): velocidade da voz e pergunta livre.

interface PreferenciasContexto extends PreferenciasLocais {
    velocidadeVoz: number
    perguntaLivreAtiva: boolean
    mudarLocal: (parcial: Partial<PreferenciasLocais>) => void
    mudarDaConta: (parcial: { velocidadeVoz?: number; perguntaLivreAtiva?: boolean }) => Promise<void>
    salvandoDaConta: boolean
}

const Contexto = createContext<PreferenciasContexto | null>(null)

export function PreferenciasProvider({ children }: { children: ReactNode }) {
    const { usuario, atualizarUsuario } = useAuth()
    const [locais, setLocais] = useState<PreferenciasLocais>(PREFERENCIAS_PADRAO)

    useEffect(() => {
        lerPreferencias().then(setLocais)
    }, [])

    const velocidadeVoz = usuario?.velocidadeVoz ?? 1
    const perguntaLivreAtiva = usuario?.perguntaLivreAtiva ?? false

    // Toda fala do app usa a velocidade do perfil
    useEffect(() => {
        configurarFala({ velocidade: velocidadeVoz, avisos: locais.sons, vibracao: locais.vibracao })
    }, [velocidadeVoz, locais.sons, locais.vibracao])

    const mudarLocal = useCallback((parcial: Partial<PreferenciasLocais>) => {
        setLocais((atual) => {
            const novo = { ...atual, ...parcial }
            salvarPreferenciasLocais(novo)
            return novo
        })
    }, [])

    const mutacao = useMutation({
        mutationFn: (p: { velocidadeVoz: number; perguntaLivreAtiva: boolean }) =>
            salvarPreferencias(p.velocidadeVoz, p.perguntaLivreAtiva),
        onSuccess: atualizarUsuario,
    })

    // É um PUT: manda sempre os dois campos
    const mudarDaConta = useCallback(
        async (parcial: { velocidadeVoz?: number; perguntaLivreAtiva?: boolean }) => {
            await mutacao.mutateAsync({
                velocidadeVoz: parcial.velocidadeVoz ?? velocidadeVoz,
                perguntaLivreAtiva: parcial.perguntaLivreAtiva ?? perguntaLivreAtiva,
            })
        },
        [mutacao, velocidadeVoz, perguntaLivreAtiva],
    )

    const valor = useMemo(
        () => ({
            ...locais,
            velocidadeVoz,
            perguntaLivreAtiva,
            mudarLocal,
            mudarDaConta,
            salvandoDaConta: mutacao.isPending,
        }),
        [locais, velocidadeVoz, perguntaLivreAtiva, mudarLocal, mudarDaConta, mutacao.isPending],
    )

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function usePreferencias() {
    const contexto = useContext(Contexto)
    if (!contexto) throw new Error("usePreferencias precisa estar dentro do PreferenciasProvider")
    return contexto
}
