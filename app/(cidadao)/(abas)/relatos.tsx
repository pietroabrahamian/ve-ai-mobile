import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BadgeStatus } from "@/components/Badges"
import { Filtros } from "@/components/Chip"
import { Carregando, EstadoErro, EstadoVazio } from "@/components/Estados"
import { IconeTipo } from "@/components/Icones"
import { ItemLista } from "@/components/ItemLista"
import { Destaque, Texto } from "@/components/Texto"
import { BotaoIcone } from "@/components/Topo"
import { useMeusRelatos } from "@/hooks/queries/useRelatos"
import { cores } from "@/theme"
import type { RelatoResposta, StatusRelato } from "@/types/api"
import { plural, rotuloTipo, statusFalado } from "@/utils/textos"

type Filtro = "TODOS" | "ABERTOS" | "ANDAMENTO" | "CONCLUIDOS"
const FILTROS: Record<Filtro, StatusRelato[] | null> = {
    TODOS: null,
    ABERTOS: ["ABERTO"],
    ANDAMENTO: ["EM_TRIAGEM", "ENCAMINHADO"],
    CONCLUIDOS: ["RESOLVIDO", "DESCARTADO"],
}

export default function MeusRelatos() {
    const consulta = useMeusRelatos()
    const [filtro, setFiltro] = useState<Filtro>("TODOS")

    const relatos = useMemo(() => {
        const todos = consulta.data?.pages.flatMap((p) => p.conteudo) ?? []
        const aceitos = FILTROS[filtro]
        return aceitos ? todos.filter((r) => aceitos.includes(r.status)) : todos
    }, [consulta.data, filtro])

    const cabecalho = (
        <View style={{ paddingTop: 20, paddingBottom: 16 }}>
            <View style={estilos.linhaTitulo}>
                <Texto variante="titulo" accessibilityRole="header">
                    Meus <Destaque>relatos</Destaque>
                </Texto>
                <BotaoIcone
                    icone="add"
                    rotulo="Novo relato"
                    amarelo
                    onPress={() => router.push("/relato/novo")}
                />
            </View>
            <View style={{ marginTop: 16 }}>
                <Filtros
                    rotuloGrupo="Filtrar relatos"
                    valor={filtro}
                    onChange={setFiltro}
                    opcoes={[
                        { valor: "TODOS", rotulo: "Todos" },
                        { valor: "ABERTOS", rotulo: "Abertos" },
                        { valor: "ANDAMENTO", rotulo: "Em andamento" },
                        { valor: "CONCLUIDOS", rotulo: "Concluídos" },
                    ]}
                />
            </View>
        </View>
    )

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <FlatList
                data={relatos}
                keyExtractor={(r) => String(r.id)}
                contentContainerStyle={estilos.lista}
                ListHeaderComponent={cabecalho}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => <ItemRelato relato={item} />}
                ListEmptyComponent={
                    consulta.isLoading ? (
                        <Carregando mensagem="Carregando seus relatos…" />
                    ) : consulta.error ? (
                        <EstadoErro erro={consulta.error} aoTentar={() => consulta.refetch()} />
                    ) : (
                        <EstadoVazio icone="clipboard-outline" mensagem="Nenhum relato aqui." />
                    )
                }
                onEndReached={() =>
                    consulta.hasNextPage && !consulta.isFetchingNextPage && consulta.fetchNextPage()
                }
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    consulta.isFetchingNextPage ? (
                        <ActivityIndicator color={cores.amarelo} style={{ margin: 16 }} />
                    ) : undefined
                }
                refreshControl={
                    <RefreshControl
                        refreshing={consulta.isRefetching}
                        onRefresh={() => {
                            consulta.refetch()
                        }}
                        tintColor={cores.amarelo}
                    />
                }
            />
        </SafeAreaView>
    )
}

function ItemRelato({ relato }: { relato: RelatoResposta }) {
    const endereco = relato.endereco ?? relato.regiao.nome
    return (
        <ItemLista
            titulo={rotuloTipo[relato.tipo]}
            subtitulo={endereco}
            icone={<IconeTipo tipo={relato.tipo} />}
            rotulo={`${rotuloTipo[relato.tipo]}, ${endereco}. Status: ${statusFalado[relato.status]}. ${plural(relato.totalApoios, "apoio", "apoios")}`}
            meta={
                <>
                    <BadgeStatus status={relato.status} />
                    {relato.totalApoios > 0 && (
                        <Texto variante="pequeno">
                            <Ionicons name="people-outline" size={14} color={cores.textoSecundario} />{" "}
                            {plural(relato.totalApoios, "apoio", "apoios")}
                        </Texto>
                    )}
                </>
            }
            onPress={() => router.push({ pathname: "/relato/[id]", params: { id: relato.id } })}
        />
    )
}

const estilos = StyleSheet.create({
    lista: { paddingHorizontal: 22, paddingBottom: 120, flexGrow: 1 },
    linhaTitulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
})
