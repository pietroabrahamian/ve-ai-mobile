import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

import { ErroApi, mensagemDe } from "@/api/erros"
import { BadgeGravidade, BadgeStatus } from "@/components/Badges"
import { Cartao, Nota, Secao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { BottomSheet } from "@/components/BottomSheet"
import { Carregando, EstadoErro } from "@/components/Estados"
import { Mapa } from "@/components/Mapa"
import { Stepper } from "@/components/Stepper"
import { Tela } from "@/components/Tela"
import { Texto } from "@/components/Texto"
import { mostrarToast } from "@/components/Toast"
import { useExcluirRelato, useRelato } from "@/hooks/queries/useRelatos"
import { avisar, falar } from "@/services/fala"
import { cores } from "@/theme"
import type { RelatoResposta } from "@/types/api"
import { dataCurta, quando } from "@/utils/datas"
import { plural, rotuloTipo, statusFalado } from "@/utils/textos"

// Detalhe do relato do cidadão (autor ou apoiador)
export default function RelatoDetalhe() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const consulta = useRelato(Number(id))

    if (consulta.isLoading)
        return (
            <Tela comTopo>
                <Carregando />
            </Tela>
        )
    if (consulta.error || !consulta.data) {
        return (
            <Tela comTopo>
                <EstadoErro erro={consulta.error} aoTentar={() => consulta.refetch()} />
            </Tela>
        )
    }
    return <Conteudo relato={consulta.data} />
}

// "Calçada danificada. Status: encaminhado ao órgão responsável, protocolo X. 3 apoios."
function resumoFalado(r: RelatoResposta) {
    const partes = [`${rotuloTipo[r.tipo]}. Status: ${statusFalado[r.status]}`]
    if (r.protocoloOrgao) partes.push(`Protocolo ${r.protocoloOrgao}`)
    if (r.motivoDescarte) partes.push(`Motivo: ${r.motivoDescarte}`)
    partes.push(`${plural(r.totalApoios, "pessoa confirmou", "pessoas confirmaram")} além de você`)
    return partes.join(". ") + "."
}

function Conteudo({ relato: r }: { relato: RelatoResposta }) {
    const excluir = useExcluirRelato()
    const [confirmar, setConfirmar] = useState(false)
    const [bloqueio, setBloqueio] = useState<string | null>(null)
    const aberto = r.status === "ABERTO"

    async function confirmarExclusao() {
        try {
            await excluir.mutateAsync(r.id)
            setConfirmar(false)
            mostrarToast("Relato excluído")
            falar("Relato excluído.")
            router.back()
        } catch (e) {
            setConfirmar(false)
            // 409: outras pessoas já confirmaram. 422: não está mais aberto. Fala a mensagem da API.
            avisar("erro")
            falar(mensagemDe(e))
            if (e instanceof ErroApi && (e.status === 409 || e.status === 422)) setBloqueio(e.mensagem)
            else mostrarToast(mensagemDe(e), "erro")
        }
    }

    return (
        <Tela comTopo>
            <View style={estilos.badges}>
                <BadgeStatus status={r.status} />
                <BadgeGravidade gravidade={r.gravidade} />
            </View>
            <Texto variante="titulo" centro style={{ fontSize: 27, marginTop: 8 }} accessibilityRole="header">
                {rotuloTipo[r.tipo]}
            </Texto>
            <Texto variante="subtitulo" centro style={{ marginTop: 6 }}>
                <Ionicons name="location-outline" size={16} color={cores.textoSecundario} />{" "}
                {r.endereco ?? r.regiao.nome}
            </Texto>

            <Cartao style={{ marginTop: 20 }}>
                <Stepper status={r.status} />
                {!!r.protocoloOrgao && (
                    <Texto variante="pequeno" centro style={{ marginTop: 12 }}>
                        Protocolo do órgão:{" "}
                        <Texto negrito cor={cores.amarelo} style={{ fontSize: 14.5 }}>
                            {r.protocoloOrgao}
                        </Texto>
                    </Texto>
                )}
                {!!r.motivoDescarte && (
                    <Texto variante="pequeno" style={{ marginTop: 12 }}>
                        Motivo: {r.motivoDescarte}
                    </Texto>
                )}
            </Cartao>

            <Secao titulo="Seu relato" />
            <Cartao>
                <Texto style={{ fontSize: 17.5 }}>{r.texto}</Texto>
                <Texto variante="pequeno" style={{ marginTop: 12 }}>
                    <Ionicons name="people-outline" size={16} color={cores.textoSecundario} />{" "}
                    {r.totalApoios === 1
                        ? "1 pessoa também apoiou"
                        : `${r.totalApoios} pessoas também apoiaram`}{" "}
                    · criado em {dataCurta(r.criadoEm)}
                </Texto>
            </Cartao>

            {!!r.normaReferencia && (
                <>
                    <Secao titulo="Base técnica" />
                    <View
                        style={estilos.norma}
                        accessible
                        accessibilityLabel={`Norma de referência: ${r.normaReferencia}`}
                    >
                        <Texto variante="secao" cor={cores.amarelo}>
                            NBR 9050
                        </Texto>
                        <Texto style={{ marginTop: 6, fontSize: 15.5 }}>{r.normaReferencia}</Texto>
                    </View>
                </>
            )}

            <Secao titulo="Local" />
            <Mapa latitude={r.latitude} longitude={r.longitude} titulo={r.endereco ?? undefined} />
            <Texto variante="pequeno" style={{ marginTop: 10 }}>
                Região {r.regiao.nome} · atualizado {quando(r.atualizadoEm)}
            </Texto>

            <View style={{ marginTop: 16 }}>
                <Botao
                    texto="Ouvir resumo"
                    icone="volume-high-outline"
                    onPress={() => falar(resumoFalado(r))}
                />
            </View>
            {aberto ? (
                <View style={estilos.linhaBotoes}>
                    <View style={{ flex: 1 }}>
                        <Botao
                            texto="Editar"
                            icone="create-outline"
                            variante="fantasma"
                            onPress={() => router.push({ pathname: "/relato/novo", params: { id: r.id } })}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Botao
                            texto="Excluir"
                            icone="trash-outline"
                            variante="perigo"
                            onPress={() => setConfirmar(true)}
                        />
                    </View>
                </View>
            ) : (
                <View style={{ marginTop: 16 }}>
                    <Nota texto="Só dá para editar ou excluir enquanto o relato está aberto." tom="neutro" />
                </View>
            )}

            <BottomSheet
                visivel={confirmar}
                aoFechar={() => setConfirmar(false)}
                titulo="Excluir este relato?"
                texto="A rede de apoio deixa de vê-lo. Isso não pode ser desfeito."
            >
                <View style={{ marginTop: 24, gap: 12 }}>
                    <Botao
                        texto="Excluir"
                        icone="trash-outline"
                        variante="perigo"
                        carregando={excluir.isPending}
                        textoCarregando="Excluindo…"
                        onPress={confirmarExclusao}
                    />
                    <Botao texto="Cancelar" variante="fantasma" onPress={() => setConfirmar(false)} />
                </View>
            </BottomSheet>

            <BottomSheet
                visivel={!!bloqueio}
                aoFechar={() => setBloqueio(null)}
                titulo="Não dá para excluir"
                texto={bloqueio ?? undefined}
            >
                <View style={{ marginTop: 24 }}>
                    <Botao texto="Entendi" onPress={() => setBloqueio(null)} />
                </View>
            </BottomSheet>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    badges: { flexDirection: "row", justifyContent: "center", gap: 10 },
    norma: {
        borderLeftWidth: 4,
        borderLeftColor: cores.amarelo,
        backgroundColor: "rgba(255,200,30,0.07)",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    linhaBotoes: { flexDirection: "row", gap: 10, marginTop: 12 },
})
