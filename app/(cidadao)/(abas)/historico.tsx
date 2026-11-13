import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BadgeGravidade } from "@/components/Badges"
import { Carregando, EstadoErro, EstadoVazio } from "@/components/Estados"
import { IconeTexto } from "@/components/Icones"
import { ItemLista } from "@/components/ItemLista"
import { Segmentado } from "@/components/Segmentado"
import { Destaque, Texto } from "@/components/Texto"
import { useDescricoes } from "@/hooks/queries/useDescricoes"
import { cores } from "@/theme"
import type { DescricaoResposta } from "@/types/api"
import { hora, rotuloDia } from "@/utils/datas"

type Filtro = "TODOS" | "AMBIENTE" | "TEXTO"

export default function Historico() {
    const consulta = useDescricoes()
    const [filtro, setFiltro] = useState<Filtro>("TODOS")

    // Agrupa por dia ("Hoje", "Ontem", "07/11") e aplica o filtro de modo
    const secoes = useMemo(() => {
        const todas = consulta.data?.pages.flatMap((p) => p.conteudo) ?? []
        const grupos = new Map<string, DescricaoResposta[]>()
        for (const d of todas) {
            if (filtro !== "TODOS" && d.modo !== filtro) continue
            const dia = rotuloDia(d.criadoEm)
            grupos.set(dia, [...(grupos.get(dia) ?? []), d])
        }
        return [...grupos.entries()].map(([title, data]) => ({ title, data }))
    }, [consulta.data, filtro])

    const cabecalho = (
        <View style={{ paddingTop: 20 }}>
            <Texto variante="titulo" accessibilityRole="header">
                Meu <Destaque>histórico</Destaque>
            </Texto>
            <Texto variante="subtitulo" style={{ marginTop: 8 }}>
                Só o texto das descrições fica salvo.
            </Texto>
            <View style={{ marginTop: 18 }}>
                <Segmentado
                    pequeno
                    rotuloGrupo="Filtrar por modo"
                    valor={filtro}
                    onChange={setFiltro}
                    opcoes={[
                        { valor: "TODOS", rotulo: "Todas" },
                        { valor: "AMBIENTE", rotulo: "Ambiente" },
                        { valor: "TEXTO", rotulo: "Texto" },
                    ]}
                />
            </View>
        </View>
    )

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <SectionList
                sections={secoes}
                keyExtractor={(d) => String(d.id)}
                contentContainerStyle={estilos.lista}
                ListHeaderComponent={cabecalho}
                renderSectionHeader={({ section }) => (
                    <Texto variante="secao" style={estilos.dia} accessibilityRole="header">
                        {section.title}
                    </Texto>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => <ItemDescricao descricao={item} />}
                ListEmptyComponent={
                    consulta.isLoading ? (
                        <Carregando mensagem="Carregando seu histórico…" />
                    ) : consulta.error ? (
                        <EstadoErro erro={consulta.error} aoTentar={() => consulta.refetch()} />
                    ) : (
                        <EstadoVazio icone="time-outline" mensagem="Nenhuma descrição ainda." />
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
                stickySectionHeadersEnabled={false}
            />
        </SafeAreaView>
    )
}

// O histórico mostra o `resumo` (a cena inteira), e não a fala curta do modo automático (guia 9)
function ItemDescricao({ descricao }: { descricao: DescricaoResposta }) {
    const perigos = descricao.perigos.length
    const avaliacao = descricao.util === true ? "útil" : descricao.util === false ? "não útil" : ""
    return (
        <ItemLista
            titulo={descricao.resumo}
            icone={
                descricao.modo === "TEXTO" ? (
                    <IconeTexto tamanho={28} />
                ) : (
                    <Ionicons name="camera-outline" size={28} color={cores.amarelo} />
                )
            }
            rotulo={`${descricao.modo === "TEXTO" ? "Texto lido" : "Ambiente"}, ${hora(descricao.criadoEm)}. ${descricao.resumo}${perigos ? `. ${perigos} perigo${perigos > 1 ? "s" : ""}` : ""}${avaliacao ? `. Avaliada como ${avaliacao}` : ""}`}
            meta={
                <>
                    <Texto variante="pequeno">
                        <Ionicons name="time-outline" size={14} color={cores.textoSecundario} />{" "}
                        {hora(descricao.criadoEm)}
                    </Texto>
                    {perigos > 0 && <BadgeGravidade gravidade="ALTA" />}
                    {perigos > 0 && (
                        <Texto variante="pequeno" cor={cores.perigo}>
                            {perigos} perigo{perigos > 1 ? "s" : ""}
                        </Texto>
                    )}
                    {!!avaliacao && (
                        <Texto
                            variante="pequeno"
                            cor={descricao.util ? cores.sucesso : cores.textoSecundario}
                        >
                            {avaliacao}
                        </Texto>
                    )}
                </>
            }
            onPress={() => router.push({ pathname: "/descricao/[id]", params: { id: descricao.id } })}
        />
    )
}

const estilos = StyleSheet.create({
    lista: { paddingHorizontal: 22, paddingBottom: 120, flexGrow: 1 },
    dia: { marginTop: 24, marginBottom: 10, marginLeft: 4 },
})
