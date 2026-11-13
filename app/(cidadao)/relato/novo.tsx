import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { paraErroApi } from "@/api/erros"
import { Nota, Secao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { Campo } from "@/components/Campo"
import { Carregando, EstadoErro } from "@/components/Estados"
import { IconeTipo } from "@/components/Icones"
import { Mapa } from "@/components/Mapa"
import { Segmentado } from "@/components/Segmentado"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { mostrarToast } from "@/components/Toast"
import { useCriarRelato, useEditarRelato, useRelato } from "@/hooks/queries/useRelatos"
import { useLocalizacao } from "@/hooks/useLocalizacao"
import { avisar, falar, toqueLeve } from "@/services/fala"
import { borda, cores, fontes } from "@/theme"
import type { Gravidade, RelatoRequisicao, RelatoResposta, TipoRelato } from "@/types/api"
import { TIPOS, rotuloTipo } from "@/utils/textos"
import { gerarUuid } from "@/utils/uuid"

const TEXTO_MINIMO = 10
const TEXTO_MAXIMO = 1000

type Parametros = {
    id?: string // edição
    tipo?: TipoRelato
    gravidade?: Gravidade
    texto?: string
    descricaoId?: string
    origem?: "sugestao" | "descricao"
}

// Novo relato (também a partir da sugestão da IA ou de uma descrição) e edição de um relato aberto
export default function NovoRelato() {
    const params = useLocalSearchParams<Parametros>()
    const idEdicao = params.id ? Number(params.id) : 0
    const existente = useRelato(idEdicao)

    if (idEdicao) {
        if (existente.isLoading)
            return (
                <Tela comTopo>
                    <Carregando />
                </Tela>
            )
        if (existente.error || !existente.data) {
            return (
                <Tela comTopo>
                    <EstadoErro erro={existente.error} aoTentar={() => existente.refetch()} />
                </Tela>
            )
        }
        return <Formulario params={params} relato={existente.data} />
    }
    return <Formulario params={params} />
}

function Formulario({ params, relato }: { params: Parametros; relato?: RelatoResposta }) {
    const edicao = !!relato
    const criar = useCriarRelato()
    const editar = useEditarRelato()
    const local = useLocalizacao()
    const [tipo, setTipo] = useState<TipoRelato | null>(relato?.tipo ?? params.tipo ?? null)
    const [gravidade, setGravidade] = useState<Gravidade>(relato?.gravidade ?? params.gravidade ?? "MEDIA")
    const [texto, setTexto] = useState(relato?.texto ?? params.texto ?? "")
    const [erros, setErros] = useState<{ tipo?: string; texto?: string; local?: string }>({})
    // A chave de idempotência é criada ao confirmar e reaproveitada se o MESMO envio for repetido
    const envio = useRef<{ chave: string; conteudo: string } | null>(null)

    const { buscar } = local
    useEffect(() => {
        if (!edicao) buscar()
    }, [edicao, buscar])

    const origem =
        params.origem === "sugestao"
            ? "Sugerido pela IA durante a descrição"
            : params.origem === "descricao"
              ? "A partir da sua descrição"
              : null

    async function enviar() {
        const novosErros = {
            tipo: tipo ? undefined : "Escolha o tipo de problema.",
            texto:
                texto.trim().length < TEXTO_MINIMO
                    ? `Descreva o problema com pelo menos ${TEXTO_MINIMO} caracteres.`
                    : texto.length > TEXTO_MAXIMO
                      ? `Use no máximo ${TEXTO_MAXIMO} caracteres.`
                      : undefined,
            local: !edicao && !local.posicao ? "Preciso da sua localização para enviar o relato." : undefined,
        }
        setErros(novosErros)
        const n = Object.values(novosErros).filter(Boolean).length
        if (n > 0 || !tipo) {
            avisar("erro")
            falar(n === 1 ? (Object.values(novosErros).find(Boolean) ?? "") : `Há ${n} campos com erro.`)
            return
        }

        try {
            if (relato) {
                const atualizado = await editar.mutateAsync({
                    id: relato.id,
                    edicao: { tipo, gravidade, texto: texto.trim(), endereco: relato.endereco },
                })
                mostrarToast("Relato atualizado")
                falar("Relato atualizado.")
                router.replace({ pathname: "/relato/[id]", params: { id: atualizado.id } })
                return
            }

            const posicao = local.posicao!
            const corpo: RelatoRequisicao = {
                tipo,
                gravidade,
                texto: texto.trim(),
                latitude: posicao.latitude,
                longitude: posicao.longitude,
                ...(posicao.endereco ? { endereco: posicao.endereco } : {}),
                ...(params.descricaoId ? { descricaoId: Number(params.descricaoId) } : {}),
            }
            const conteudo = JSON.stringify(corpo)
            if (!envio.current || envio.current.conteudo !== conteudo)
                envio.current = { chave: gerarUuid(), conteudo }
            const registro = await criar.mutateAsync({ relato: corpo, chave: envio.current.chave })
            envio.current = null
            router.replace({
                pathname: "/relato/enviado",
                params: {
                    resultado: registro.resultado,
                    id: registro.relato.id,
                    apoios: registro.relato.totalApoios,
                    regiao: registro.relato.regiao.nome,
                    tipo: registro.relato.tipo,
                    status: registro.relato.status,
                    origem: params.origem ?? "",
                },
            })
        } catch (e) {
            // 400 com campos, 404 (descrição de origem), 422 (relato não está mais aberto ou chave repetida)
            const erro = paraErroApi(e)
            setErros({ texto: erro.campos.texto, tipo: erro.campos.tipo })
            avisar("erro")
            falar(erro.mensagem)
            mostrarToast(erro.mensagem, "erro")
        }
    }

    const enviando = criar.isPending || editar.isPending

    return (
        <Tela comTopo>
            <Texto variante="titulo" accessibilityRole="header">
                {edicao ? (
                    <>
                        Editar <Destaque>relato</Destaque>
                    </>
                ) : (
                    <>
                        Relatar <Destaque>problema</Destaque>
                    </>
                )}
            </Texto>
            {origem ? (
                <View style={{ marginTop: 12 }}>
                    <Nota texto={origem} tom="aviso" />
                </View>
            ) : (
                !edicao && (
                    <Texto variante="subtitulo" style={{ marginTop: 8 }}>
                        Para barreiras que a câmera não vê, como semáforo sem som.
                    </Texto>
                )
            )}

            <Secao titulo="Tipo de problema" />
            <View style={estilos.grade} accessibilityRole="radiogroup" accessibilityLabel="Tipo de problema">
                {TIPOS.map((t) => {
                    const marcado = tipo === t
                    return (
                        <Pressable
                            key={t}
                            onPress={() => {
                                toqueLeve()
                                setTipo(t)
                            }}
                            accessibilityRole="radio"
                            accessibilityLabel={rotuloTipo[t]}
                            accessibilityState={{ checked: marcado }}
                            style={[estilos.tipo, marcado && estilos.tipoMarcado]}
                        >
                            <IconeTipo tipo={t} tamanho={30} />
                            <Texto style={estilos.textoTipo}>{rotuloTipo[t]}</Texto>
                        </Pressable>
                    )
                })}
            </View>
            {!!erros.tipo && <Texto style={estilos.erro}>{erros.tipo}</Texto>}

            <Secao titulo="Gravidade" />
            <Segmentado
                pequeno
                rotuloGrupo="Gravidade"
                valor={gravidade}
                onChange={setGravidade}
                opcoes={[
                    { valor: "BAIXA", rotulo: "Baixa" },
                    { valor: "MEDIA", rotulo: "Média" },
                    { valor: "ALTA", rotulo: "Alta" },
                ]}
            />

            <Campo
                rotulo="O que acontece aqui?"
                value={texto}
                onChangeText={setTexto}
                placeholder="Ex.: buraco grande perto do ponto de ônibus"
                multiline
                maxLength={TEXTO_MAXIMO}
                erro={erros.texto}
            />
            <Texto variante="pequeno" style={{ marginTop: 6, marginLeft: 4 }}>
                <Ionicons name="mic-outline" size={14} color={cores.textoSecundario} /> Toque no microfone do
                teclado para falar.
            </Texto>

            <Secao titulo="Localização" />
            {edicao && relato ? (
                <>
                    <Mapa
                        latitude={relato.latitude}
                        longitude={relato.longitude}
                        titulo={relato.endereco ?? undefined}
                    />
                    <Texto variante="pequeno" style={{ marginTop: 10 }}>
                        A localização do relato não muda na edição.
                    </Texto>
                </>
            ) : local.buscando ? (
                <Carregando mensagem="Buscando sua localização…" />
            ) : local.posicao ? (
                <>
                    <Mapa
                        latitude={local.posicao.latitude}
                        longitude={local.posicao.longitude}
                        titulo={local.posicao.endereco ?? undefined}
                    />
                    <View style={estilos.endereco} accessible>
                        <Ionicons name="location-outline" size={22} color={cores.amarelo} />
                        <View style={{ flex: 1 }}>
                            <Texto negrito>{local.posicao.endereco ?? "Endereço não encontrado"}</Texto>
                            <Texto variante="pequeno">
                                GPS
                                {local.posicao.precisao
                                    ? ` · precisão de ${Math.round(local.posicao.precisao)} m`
                                    : ""}{" "}
                                · enviada só neste relato
                            </Texto>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Botao
                            texto="Atualizar localização"
                            icone="refresh"
                            variante="fantasma"
                            pequeno
                            onPress={buscar}
                        />
                    </View>
                </>
            ) : (
                <>
                    <Nota
                        texto={local.erro ?? erros.local ?? "Sem localização ainda."}
                        tom="perigo"
                        icone="location-outline"
                    />
                    <View style={{ marginTop: 10 }}>
                        <Botao
                            texto="Tentar de novo"
                            icone="refresh"
                            variante="fantasma"
                            pequeno
                            onPress={buscar}
                        />
                    </View>
                </>
            )}

            <View style={{ marginTop: 24 }}>
                <Botao
                    texto={edicao ? "Salvar alterações" : "Enviar para a rede de apoio"}
                    textoCarregando={edicao ? "Salvando…" : "Enviando…"}
                    carregando={enviando}
                    onPress={enviar}
                />
            </View>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    tipo: {
        width: "48%",
        flexGrow: 1,
        minHeight: 92,
        borderRadius: 20,
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundColor: "#0E1D45",
        padding: 14,
        justifyContent: "space-between",
        gap: 8,
    },
    tipoMarcado: { borderColor: cores.amarelo, backgroundColor: "rgba(255,200,30,0.12)", borderWidth: 3 },
    textoTipo: { fontFamily: fontes.negrito, fontSize: 15.5, lineHeight: 19 },
    erro: { color: cores.perigo, fontSize: 14.5, marginTop: 8, marginLeft: 4 },
    endereco: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
})
