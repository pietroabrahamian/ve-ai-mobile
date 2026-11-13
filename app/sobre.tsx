import Constants from "expo-constants"
import { StyleSheet, View } from "react-native"

import { URL_API } from "@/api/client"
import { Cartao, Linha } from "@/components/Blocos"
import { Chip } from "@/components/Chip"
import { SimboloLogo } from "@/components/Logo"
import { Tela } from "@/components/Tela"
import { Texto } from "@/components/Texto"
import { useSaudeApi } from "@/hooks/queries/useGestor"
import { cores, coresStatus, fontes } from "@/theme"

// Tela "Sobre o App": versão e hash do commit (requisito da rubrica), status da API, equipe e ODS
export default function Sobre() {
    const saude = useSaudeApi()
    const versao = Constants.expoConfig?.version ?? "1.0.0"
    const commit = String(Constants.expoConfig?.extra?.commitHash ?? "sem commit")
    const online = !!saude.data?.api
    const iaOnline = !!saude.data?.ia

    return (
        <Tela comTopo>
            <View
                style={{ alignItems: "center", marginTop: 16 }}
                accessible
                accessibilityLabel="Vê AI. Enxergue além."
            >
                <SimboloLogo largura={150} />
                <Texto variante="marca" style={{ marginTop: 12 }}>
                    Vê{" "}
                    <Texto variante="marca" cor={cores.amarelo}>
                        AI
                    </Texto>
                </Texto>
                <Texto variante="subtitulo">Enxergue além.</Texto>
            </View>

            <Cartao style={{ marginTop: 24 }}>
                <Linha rotulo="Versão">{versao}</Linha>
                <Linha rotulo="Commit">
                    <Texto style={estilos.commit} accessibilityLabel={`Commit ${commit.split("").join(" ")}`}>
                        {commit}
                    </Texto>
                </Linha>
                <Linha rotulo="API">
                    {saude.isLoading ? (
                        <Texto variante="pequeno">verificando…</Texto>
                    ) : (
                        <Situacao ok={online} nome="API" />
                    )}
                </Linha>
                {online && (
                    <Linha rotulo="IA de descrição">
                        <Situacao ok={iaOnline} nome="IA de descrição" />
                    </Linha>
                )}
                <Texto variante="pequeno" style={{ marginTop: 10 }} numberOfLines={1}>
                    {URL_API || "URL da API não configurada"}
                </Texto>
            </Cartao>

            <Cartao style={{ marginTop: 12 }}>
                <Texto variante="pequeno" style={{ lineHeight: 21 }}>
                    O Vê AI descreve o ambiente por áudio e transforma barreiras de acessibilidade em relatos
                    para a rede de apoio. Não substitui bengala nem cão-guia.
                </Texto>
                <Texto style={{ marginTop: 12, fontSize: 15 }}>Lucas · Lucca · Pietro · Pedro</Texto>
                <Texto variante="pequeno">FIAP · 2TDS · Global Solution 2026/2</Texto>
            </Cartao>

            <View style={estilos.ods}>
                {["ODS 3", "ODS 9", "ODS 10", "ODS 11"].map((o) => (
                    <Chip key={o} texto={o} />
                ))}
            </View>
        </Tela>
    )
}

// Pílula "online" (verde) ou "fora do ar" (cinza)
function Situacao({ ok, nome }: { ok: boolean; nome: string }) {
    const { cor, fundo } = ok ? coresStatus.RESOLVIDO : coresStatus.DESCARTADO
    return (
        <View
            style={[estilos.situacao, { backgroundColor: fundo }]}
            accessible
            accessibilityLabel={`${nome} ${ok ? "online" : "fora do ar"}`}
        >
            <View style={[estilos.ponto, { backgroundColor: cor }]} />
            <Texto style={{ fontFamily: fontes.negrito, fontSize: 13, color: cor }}>
                {ok ? "online" : "fora do ar"}
            </Texto>
        </View>
    )
}

const estilos = StyleSheet.create({
    situacao: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 99,
    },
    ponto: { width: 8, height: 8, borderRadius: 4 },
    commit: { fontFamily: fontes.negrito, color: cores.amarelo, letterSpacing: 1 },
    ods: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 },
})
