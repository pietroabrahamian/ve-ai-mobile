import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"

import { paraErroApi } from "@/api/erros"
import { BadgeGravidade, BadgeStatus } from "@/components/Badges"
import { Cartao, Nota, Secao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { Campo } from "@/components/Campo"
import { Carregando, EstadoErro } from "@/components/Estados"
import { Mapa } from "@/components/Mapa"
import { Stepper } from "@/components/Stepper"
import { Tela } from "@/components/Tela"
import { Texto } from "@/components/Texto"
import { Timeline } from "@/components/Timeline"
import { mostrarToast } from "@/components/Toast"
import { useHistorico, useMudarStatus, useRelatoGestor } from "@/hooks/queries/useGestor"
import { avisar, falar } from "@/services/fala"
import { cores, fontes } from "@/theme"
import type { RelatoResposta, StatusRelato } from "@/types/api"
import { dataCurta, diasDesde, quando } from "@/utils/datas"
import { pesoGravidade, plural, proximosStatus, rotuloStatus, rotuloTipo } from "@/utils/textos"

// Detalhe do relato para o gestor: mapa, norma, prioridade, histórico e mudança de status
export default function Analise() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const consulta = useRelatoGestor(Number(id))

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

function Conteudo({ relato: r }: { relato: RelatoResposta }) {
    const historico = useHistorico(r.id)
    const mudar = useMudarStatus()
    // Só aparecem os botões das transições válidas para o status atual (guia 12.3)
    const proximos = proximosStatus[r.status]
    const [novo, setNovo] = useState<StatusRelato | null>(null)
    const [protocolo, setProtocolo] = useState("")
    const [motivo, setMotivo] = useState("")
    const [comentario, setComentario] = useState("")
    const [erros, setErros] = useState<{ protocolo?: string; motivo?: string; comentario?: string }>({})
    const dias = diasDesde(r.criadoEm)

    async function salvar() {
        if (!novo) return
        const encontrados = {
            protocolo:
                novo === "ENCAMINHADO" && !protocolo.trim() ? "Informe o protocolo do órgão." : undefined,
            motivo: novo === "DESCARTADO" && !motivo.trim() ? "Informe o motivo do descarte." : undefined,
        }
        setErros(encontrados)
        if (encontrados.protocolo || encontrados.motivo) {
            avisar("erro")
            falar(encontrados.protocolo ?? encontrados.motivo ?? "")
            return
        }
        try {
            await mudar.mutateAsync({
                id: r.id,
                corpo: {
                    status: novo,
                    ...(novo === "ENCAMINHADO" ? { protocoloOrgao: protocolo.trim() } : {}),
                    ...(novo === "DESCARTADO" ? { motivoDescarte: motivo.trim() } : {}),
                    ...(comentario.trim() ? { comentario: comentario.trim() } : {}),
                },
            })
            const pessoas = 1 + r.totalApoios
            mostrarToast(`Status atualizado · ${plural(pessoas, "pessoa notificada", "pessoas notificadas")}`)
            falar(`Status mudado para ${rotuloStatus[novo]}.`)
            setNovo(null)
            setProtocolo("")
            setMotivo("")
            setComentario("")
            historico.refetch()
        } catch (e) {
            // 422 (transição inválida, protocolo ou motivo faltando) ou 400 com campos: mostra e fala
            const erro = paraErroApi(e)
            setErros({
                protocolo: erro.campos.protocoloOrgao,
                motivo: erro.campos.motivoDescarte,
                comentario: erro.campos.comentario,
            })
            avisar("erro")
            falar(erro.mensagem)
            mostrarToast(erro.mensagem, "erro")
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
                {r.endereco ?? "Sem endereço"} · {r.regiao.nome}
            </Texto>

            <View style={{ marginTop: 16 }}>
                <Mapa latitude={r.latitude} longitude={r.longitude} titulo={r.endereco ?? undefined} />
            </View>
            <Cartao style={{ marginTop: 16 }}>
                <Stepper status={r.status} />
                {!!r.protocoloOrgao && (
                    <Texto variante="pequeno" centro style={{ marginTop: 12 }}>
                        Protocolo:{" "}
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

            <Secao titulo="Relato do cidadão" />
            <Cartao>
                <Texto style={{ fontSize: 17 }}>“{r.texto}”</Texto>
                <Texto variante="pequeno" style={{ marginTop: 8 }}>
                    {dataCurta(r.criadoEm)} · {plural(r.totalApoios, "apoio", "apoios")}
                    {r.descricaoId ? " · criado a partir de uma descrição da IA" : ""}
                </Texto>
            </Cartao>

            {r.normaReferencia ? (
                <>
                    <Secao titulo="Classificação (RAG · NBR 9050)" />
                    <View style={estilos.norma} accessible>
                        <Texto variante="secao" cor={cores.amarelo}>
                            Norma de referência
                        </Texto>
                        <Texto style={{ marginTop: 6, fontSize: 15.5 }}>{r.normaReferencia}</Texto>
                    </View>
                </>
            ) : (
                <>
                    <Secao titulo="Classificação" />
                    <Nota tom="neutro" texto="Sem norma de referência para este relato no momento." />
                </>
            )}

            <Secao titulo="Prioridade" />
            <Cartao>
                <View
                    style={estilos.linhaPrioridade}
                    accessible
                    accessibilityLabel={`Prioridade ${r.prioridade}`}
                >
                    <Texto variante="pequeno" style={{ flex: 1 }}>
                        Gravidade {pesoGravidade[r.gravidade]} × (1 + {r.totalApoios} apoios) + {dias} dias
                    </Texto>
                    <Texto style={{ fontFamily: fontes.titulo, fontSize: 26, color: cores.amarelo }}>
                        {r.prioridade}
                    </Texto>
                </View>
            </Cartao>

            {proximos.length > 0 ? (
                <>
                    <Secao titulo="Atualizar status" />
                    <View
                        style={estilos.opcoes}
                        accessibilityRole="radiogroup"
                        accessibilityLabel="Novo status"
                    >
                        {proximos.map((s) => (
                            <View key={s} style={{ flexGrow: 1 }}>
                                <Botao
                                    texto={rotuloStatus[s]}
                                    pequeno
                                    variante={novo === s ? "primario" : "fantasma"}
                                    selecionado={novo === s}
                                    onPress={() => {
                                        setNovo(s)
                                        setErros({})
                                    }}
                                />
                            </View>
                        ))}
                    </View>
                    {novo === "ENCAMINHADO" && (
                        <Campo
                            rotulo="Protocolo do órgão *"
                            value={protocolo}
                            onChangeText={setProtocolo}
                            placeholder="Ex.: SP156-2026-123456"
                            maxLength={40}
                            autoCapitalize="characters"
                            erro={erros.protocolo}
                        />
                    )}
                    {novo === "DESCARTADO" && (
                        <Campo
                            rotulo="Motivo do descarte *"
                            value={motivo}
                            onChangeText={setMotivo}
                            placeholder="Por que este relato será descartado?"
                            maxLength={300}
                            multiline
                            erro={erros.motivo}
                        />
                    )}
                    <Campo
                        rotulo="Comentário (o cidadão recebe)"
                        value={comentario}
                        onChangeText={setComentario}
                        placeholder="Opcional"
                        maxLength={500}
                        multiline
                        erro={erros.comentario}
                    />
                    <View style={{ marginTop: 16 }}>
                        <Botao
                            texto={novo ? `Mudar para ${rotuloStatus[novo]}` : "Escolha o novo status"}
                            desabilitado={!novo}
                            carregando={mudar.isPending}
                            textoCarregando="Salvando…"
                            onPress={salvar}
                        />
                    </View>
                </>
            ) : (
                <View style={{ marginTop: 16 }}>
                    <Nota tom="neutro" texto="Status final. Não há próximas etapas." />
                </View>
            )}

            <Secao titulo="Histórico" />
            {historico.isLoading ? (
                <Carregando mensagem="Carregando o histórico…" />
            ) : historico.error ? (
                <EstadoErro erro={historico.error} aoTentar={() => historico.refetch()} />
            ) : (
                <Timeline
                    eventos={[
                        ...[...(historico.data ?? [])].reverse().map((h) => ({
                            titulo: rotuloStatus[h.statusNovo],
                            quando: quando(h.criadoEm),
                            texto: [h.gestorNome, h.comentario].filter(Boolean).join(": "),
                        })),
                        {
                            titulo: "Aberto",
                            quando: quando(r.criadoEm),
                            texto: "Relato criado pelo cidadão.",
                        },
                    ]}
                />
            )}
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
    linhaPrioridade: { flexDirection: "row", alignItems: "center", gap: 12 },
    opcoes: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
})
