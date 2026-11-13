import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { definirToken, quandoSessaoExpirar } from "@/api/client"
import { apagarSessao, lerSessao, salvarSessao } from "@/services/armazenamento"
import { descartarFotos } from "@/services/camera"
import { falar, pararFala } from "@/services/fala"
import type { Papel, TokenResposta, UsuarioResposta } from "@/types/api"
import { sessaoValida } from "@/utils/datas"

// AuthContext enxuto (feedback do professor no PetFlow): só guarda o estado da sessão e expõe
// entrar/sair. As chamadas HTTP ficam em src/api, o armazenamento em services/armazenamento.ts
// e a expiração do JWT no hook useSessao.

type MotivoSaida = "pedido" | "expirou"

interface AuthContexto {
    usuario: UsuarioResposta | null
    papel: Papel | null
    expiraEm: string | null
    iniciando: boolean
    entrar: (resposta: TokenResposta) => Promise<void>
    sair: (motivo?: MotivoSaida) => Promise<void>
    atualizarUsuario: (usuario: UsuarioResposta) => void
}

const Contexto = createContext<AuthContexto | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [usuario, setUsuario] = useState<UsuarioResposta | null>(null)
    const [papel, setPapel] = useState<Papel | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [expiraEm, setExpiraEm] = useState<string | null>(null)
    const [iniciando, setIniciando] = useState(true)

    const limparEstado = useCallback(() => {
        definirToken(null)
        setUsuario(null)
        setPapel(null)
        setToken(null)
        setExpiraEm(null)
    }, [])

    // Ao abrir o app: restaura a sessão salva. Token vencido vai direto ao login.
    useEffect(() => {
        lerSessao().then(async (sessao) => {
            if (sessao && sessaoValida(sessao.expiraEm)) {
                definirToken(sessao.token)
                setUsuario(sessao.usuario)
                setPapel(sessao.papel)
                setToken(sessao.token)
                setExpiraEm(sessao.expiraEm)
            } else if (sessao) {
                await apagarSessao()
            }
            setIniciando(false)
        })
    }, [])

    const entrar = useCallback(async (resposta: TokenResposta) => {
        await salvarSessao({
            token: resposta.token,
            expiraEm: resposta.expiraEm,
            papel: resposta.papel,
            usuario: resposta.usuario,
        })
        definirToken(resposta.token)
        setUsuario(resposta.usuario)
        setPapel(resposta.papel)
        setToken(resposta.token)
        setExpiraEm(resposta.expiraEm)
    }, [])

    // Logout limpa tudo: token, dados em cache do React Query e a última foto
    const sair = useCallback(
        async (motivo: MotivoSaida = "pedido") => {
            pararFala()
            await apagarSessao()
            limparEstado()
            queryClient.clear()
            descartarFotos()
            if (motivo === "expirou") falar("Sua sessão expirou. Faça login de novo.")
        },
        [limparEstado, queryClient],
    )

    // Qualquer 401 da API encerra a sessão
    useEffect(() => {
        quandoSessaoExpirar(() => {
            if (token) sair("expirou")
        })
    }, [token, sair])

    const atualizarUsuario = useCallback(
        (novo: UsuarioResposta) => {
            setUsuario(novo)
            if (token && expiraEm && papel) salvarSessao({ token, expiraEm, papel, usuario: novo })
        },
        [token, expiraEm, papel],
    )

    const valor = useMemo(
        () => ({ usuario, papel, expiraEm, iniciando, entrar, sair, atualizarUsuario }),
        [usuario, papel, expiraEm, iniciando, entrar, sair, atualizarUsuario],
    )

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAuth() {
    const contexto = useContext(Contexto)
    if (!contexto) throw new Error("useAuth precisa estar dentro do AuthProvider")
    return contexto
}
