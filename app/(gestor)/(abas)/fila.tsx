import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BadgeGravidade, BadgeStatus } from "@/components/Badges"
import { Secao } from "@/components/Blocos"
import { Filtros } from "@/components/Chip"
import { Carregando, EstadoErro, EstadoVazio } from "@/components/Estados"
import { IconeTipo } from "@/components/Icones"
import { ItemLista } from "@/components/ItemLista"
import { Destaque, Texto } from "@/components/Texto"
import { useAuth } from "@/contexts/AuthContext"
import { useFila, useTotalPorStatus } from "@/hooks/queries/useGestor"
import { borda, cores, fontes } from "@/theme"
import type { RelatoResposta, StatusRelato } from "@/types/api"
import { diasDesde } from "@/utils/datas"
import { gravidadeFalada, plural, rotuloTipo, statusFalado } from "@/utils/textos"

type FiltroStatus = "TODOS" | StatusRelato

// Fila do gestor: já vem ordenada pela prioridade, só com as regiões dele (guia 12.1)
export default function Fila() {
    const { usuario } = useAuth()
    const [status, setStatus] = useState<FiltroStatus>("TODOS")
    const [regiao, setRegiao] = useState("TODAS")
    const consulta = useFila({
        status: status === "TODOS" ? undefined : status,
        regiaoId: regiao === "TODAS" ? undefined : Number(regiao),
    })
    const relatos = useMemo(() => consulta.data?.pages.flatMap((p) => p.conteudo) ?? [], [consulta.data])
    const maior = Math.max(1, ...relatos.map((r) => r.prioridade))
    const regioes = usuario?.regioes ?? []

    const cabecalho = (
        <View style={{ paddingTop: 20 }}>
            <Texto variante="subtitulo">
                Rede de apoio · {regioes.map((r) => r.nome).join(" e ") || "suas regiões"}
            </Texto>
            <Texto variante="titulo" style={{ marginTop: 4 }} accessibilityRole="header">
                Fila de <Destaque>relatos</Destaque>
            </Texto>
            <View style={estilos.kpis}>
                <Kpi status="ABERTO" rotulo="Abertos" cor={cores.texto} />
                <Kpi status="EM_TRIAGEM" rotulo="Em triagem" cor={cores.amarelo} />
                <Kpi status="ENCAMINHADO" rotulo="Encaminhados" cor={cores.roxo} />
            </View>
            <View style={{ marginTop: 16 }}>
                <Filtros
                    rotuloGrupo="Filtrar por status"
                    valor={status}
                    onChange={setStatus}
                    opcoes={[
                        { valor: "TODOS", rotulo: "Todos" },
                        { valor: "ABERTO", rotulo: "Abertos" },
                        { valor: "EM_TRIAGEM", rotulo: "Em triagem" },
                        { valor: "ENCAMINHADO", rotulo: "Encaminhados" },
                        { valor: "RESOLVIDO", rotulo: "Resolvidos" },
                        { valor: "DESCARTADO", rotulo: "Descartados" },
                    ]}
                />
            </View>
            {regioes.length > 1 && (
                <View style={{ marginTop: 10 }}>
                    <Filtros
                        rotuloGrupo="Filtrar por região"
                        valor={regiao}
                        onChange={setRegiao}
                        opcoes={[
                            { valor: "TODAS", rotulo: "Todas as regiões" },
                            ...regioes.map((r) => ({ valor: String(r.id), rotulo: r.nome })),
                        ]}
                    />
                </View>
            )}
            <Secao titulo="Ordenado por prioridade" />
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
                renderItem={({ item }) => <ItemFila relato={item} maior={maior} />}
                ListEmptyComponent={
                    consulta.isLoading ? (
                        <Carregando mensagem="Carregando a fila…" />
                    ) : consulta.error ? (
                        <EstadoErro erro={consulta.error} aoTentar={() => consulta.refetch()} />
                    ) : (
                        <EstadoVazio icone="checkmark-done-outline" mensagem="Nada nesta fila." />
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

function Kpi({ status, rotulo, cor }: { status: StatusRelato; rotulo: string; cor: string }) {
    const { data } = useTotalPorStatus(status)
    return (
        <View style={estilos.kpi} accessible accessibilityLabel={`${rotulo}: ${data ?? "carregando"}`}>
            <Texto style={[estilos.kpiNumero, { color: cor }]}>{data ?? "–"}</Texto>
            <Texto variante="pequeno" style={{ fontSize: 12.5 }}>
                {rotulo}
            </Texto>
        </View>
    )
}

function ItemFila({ relato: r, maior }: { relato: RelatoResposta; maior: number }) {
    const dias = diasDesde(r.criadoEm)
    return (
        <ItemLista
            titulo={rotuloTipo[r.tipo]}
            subtitulo={`${r.endereco ?? "Sem endereço"} · ${r.regiao.nome}`}
            icone={<IconeTipo tipo={r.tipo} />}
            rotulo={`${rotuloTipo[r.tipo]}, ${gravidadeFalada[r.gravidade]}, em ${r.regiao.nome}. Status: ${statusFalado[r.status]}. Prioridade ${r.prioridade}. ${plural(r.totalApoios, "apoio", "apoios")}, ${plural(dias, "dia", "dias")}.`}
            meta={
                <>
                    <BadgeStatus status={r.status} />
                    <BadgeGravidade gravidade={r.gravidade} />
                    <Texto variante="pequeno">
                        <Ionicons name="people-outline" size={14} color={cores.textoSecundario} />{" "}
                        {r.totalApoios} · {plural(dias, "dia", "dias")}
                    </Texto>
                </>
            }
            extra={
                <View style={estilos.prioridade}>
                    <Texto variante="pequeno" style={{ fontSize: 13 }}>
                        Prioridade
                    </Texto>
                    <View style={estilos.barra}>
                        <View style={[estilos.barraCheia, { width: `${(r.prioridade / maior) * 100}%` }]} />
                    </View>
                    <Texto negrito style={{ fontSize: 14 }}>
                        {r.prioridade}
                    </Texto>
                </View>
            }
            onPress={() => router.push({ pathname: "/analise/[id]", params: { id: r.id } })}
        />
    )
}

const estilos = StyleSheet.create({
    lista: { paddingHorizontal: 22, paddingBottom: 120, flexGrow: 1 },
    kpis: { flexDirection: "row", gap: 8, marginTop: 16 },
    kpi: {
        flex: 1,
        borderRadius: 18,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundColor: "#0E1D45",
        padding: 12,
    },
    kpiNumero: { fontFamily: fontes.titulo, fontSize: 28, lineHeight: 34 },
    prioridade: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    barra: { flex: 1, height: 6, borderRadius: 6, backgroundColor: "#1E3165", overflow: "hidden" },
    barraCheia: { height: "100%", backgroundImage: "linear-gradient(90deg, #FFC81E, #FF6B5E)" },
})
