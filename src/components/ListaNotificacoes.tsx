import { router } from "expo-router"
import { View } from "react-native"

import { useAuth } from "@/contexts/AuthContext"
import { useMarcarLida, useNotificacoes } from "@/hooks/queries/useNotificacoes"
import { falar } from "@/services/fala"
import type { NotificacaoResposta } from "@/types/api"
import { quando } from "@/utils/datas"

import { Botao } from "./Botao"
import { Carregando, EstadoErro, EstadoVazio } from "./Estados"
import { ItemLista } from "./ItemLista"
import { Destaque, Texto } from "./Texto"

// Notificações (cidadão e gestor). As mensagens já vêm escritas para serem faladas (guia 11).
export function ListaNotificacoes() {
    const { papel } = useAuth()
    const consulta = useNotificacoes()
    const marcar = useMarcarLida()
    const lista = consulta.data?.conteudo ?? []
    const naoLidas = lista.filter((n) => !n.lida)

    // Ao falar uma notificação, ela é marcada como lida
    function lerEmVozAlta() {
        const alvo = naoLidas.length ? naoLidas : lista.slice(0, 2)
        if (!alvo.length) {
            falar("Você não tem notificações.")
            return
        }
        falar(alvo.map((n) => n.mensagem).join(" "))
        naoLidas.forEach((n) => marcar.mutate(n.id))
    }

    function abrir(n: NotificacaoResposta) {
        falar(n.mensagem)
        if (!n.lida) marcar.mutate(n.id)
        if (papel === "GESTOR") router.push({ pathname: "/analise/[id]", params: { id: n.relatoId } })
        else router.push({ pathname: "/relato/[id]", params: { id: n.relatoId } })
    }

    return (
        <View>
            <Texto variante="titulo" accessibilityRole="header">
                Notifica<Destaque>ções</Destaque>
            </Texto>
            <Texto variante="subtitulo" style={{ marginTop: 8 }}>
                {naoLidas.length
                    ? `${naoLidas.length} não lida${naoLidas.length > 1 ? "s" : ""}`
                    : "Tudo lido"}
            </Texto>
            <View style={{ marginTop: 16 }}>
                <Botao texto="Ler em voz alta" icone="volume-high-outline" onPress={lerEmVozAlta} />
            </View>
            <View style={{ marginTop: 16, gap: 10 }}>
                {consulta.isLoading && <Carregando mensagem="Carregando notificações…" />}
                {consulta.error && <EstadoErro erro={consulta.error} aoTentar={() => consulta.refetch()} />}
                {!consulta.isLoading && !consulta.error && lista.length === 0 && (
                    <EstadoVazio icone="notifications-outline" mensagem="Nenhuma notificação ainda." />
                )}
                {lista.map((n) => (
                    <ItemLista
                        key={n.id}
                        titulo={n.mensagem}
                        subtitulo={quando(n.criadoEm)}
                        naoLido={!n.lida}
                        onPress={() => abrir(n)}
                    />
                ))}
            </View>
        </View>
    )
}
