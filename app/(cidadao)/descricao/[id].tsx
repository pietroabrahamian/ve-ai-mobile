import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { mensagemDe } from "@/api/erros"
import { Cartao, Nota, Secao } from "@/components/Blocos"
import { Botao } from "@/components/Botao"
import { BottomSheet } from "@/components/BottomSheet"
import { ListaPerigos } from "@/components/CardPerigo"
import { Chip } from "@/components/Chip"
import { Carregando, EstadoErro } from "@/components/Estados"
import { IconeTipo } from "@/components/Icones"
import { Tela } from "@/components/Tela"
import { Destaque, Texto } from "@/components/Texto"
import { mostrarToast } from "@/components/Toast"
import { useAvaliarDescricao, useDescricao, useExcluirDescricao } from "@/hooks/queries/useDescricoes"
import { avisar, falar } from "@/services/fala"
import type { DescricaoResposta } from "@/types/api"
import { quando } from "@/utils/datas"
import { tipoFalado } from "@/utils/textos"

// Resultado de uma descrição (logo depois da foto, com `novo=1`) e detalhe vindo do histórico
export default function DescricaoDetalhe() {
    const params = useLocalSearchParams<{ id: string; novo?: string }>()
    const id = Number(params.id)
    const novo = params.novo === "1"
    const consulta = useDescricao(id)

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
    return <Conteudo descricao={consulta.data} novo={novo} />
}

function falarDescricao(d: DescricaoResposta) {
    falar(d.descricaoCompleta)
}

function Conteudo({ descricao: d, novo }: { descricao: DescricaoResposta; novo: boolean }) {
    const avaliar = useAvaliarDescricao()
    const excluir = useExcluirDescricao()
    const [completa, setCompleta] = useState(false)
    const [confirmarExclusao, setConfirmarExclusao] = useState(false)
    const [sugestaoAberta, setSugestaoAberta] = useState(false)
    const falou = useRef(false)
    const texto = d.modo === "TEXTO"
    const tipoBarreira = d.sugestaoRelato?.tipo ?? d.barreiraTipo

    // Logo depois da foto: fala a descrição e, no manual, a sugestão de relato sempre aparece (guia 6.1)
    useEffect(() => {
        if (!novo || falou.current) return
        falou.current = true
        falarDescricao(d)
        if (d.sugestaoRelato) {
            const id = setTimeout(() => {
                avisar("pergunta")
                setSugestaoAberta(true)
                falar(d.sugestaoRelato?.pergunta ?? "", { interromper: false })
            }, 1600)
            return () => clearTimeout(id)
        }
    }, [novo, d])

    function relatar() {
        setSugestaoAberta(false)
        router.push({
            pathname: "/relato/novo",
            params: {
                tipo: tipoBarreira ?? "OUTRO",
                gravidade: d.sugestaoRelato?.gravidade ?? "MEDIA",
                texto: d.resumo,
                descricaoId: d.id,
                origem: "descricao",
            },
        })
    }

    async function avaliarUtil(util: boolean) {
        try {
            await avaliar.mutateAsync({ id: d.id, util })
            mostrarToast("Obrigado pela avaliação")
        } catch (e) {
            mostrarToast(mensagemDe(e), "erro")
            falar(mensagemDe(e))
        }
    }

    async function confirmarExcluir() {
        try {
            await excluir.mutateAsync(d.id)
            setConfirmarExclusao(false)
            mostrarToast("Descrição excluída")
            router.back()
        } catch (e) {
            setConfirmarExclusao(false)
            mostrarToast(mensagemDe(e), "erro")
            falar(mensagemDe(e))
        }
    }

    return (
        <Tela comTopo>
            {/* Dois toques em qualquer parte do texto repetem a descrição completa */}
            <Pressable
                onPress={() => undefined}
                delayLongPress={300}
                onLongPress={() => falarDescricao(d)}
                accessible={false}
            >
                {novo ? (
                    <Texto variante="titulo" centro accessibilityRole="header">
                        {texto ? (
                            <>
                                Texto <Destaque>lido</Destaque>
                            </>
                        ) : (
                            <>
                                O que está <Destaque>à frente</Destaque>
                            </>
                        )}
                    </Texto>
                ) : (
                    <>
                        <Texto variante="subtitulo" centro>
                            {quando(d.criadoEm)} · {texto ? "Ler texto" : "Ambiente"}
                        </Texto>
                        <Texto
                            variante="titulo"
                            centro
                            style={{ fontSize: 26, marginTop: 6 }}
                            accessibilityRole="header"
                        >
                            {d.resumo}
                        </Texto>
                    </>
                )}
            </Pressable>

            <View style={{ marginTop: 16 }}>
                <Nota
                    texto="Foto descartada. Só o texto vai para o histórico."
                    icone="shield-checkmark-outline"
                />
            </View>

            {texto ? (
                <Cartao style={{ marginTop: 16 }}>
                    <Texto variante="destaque" negrito style={{ fontSize: 22 }}>
                        {d.descricaoCompleta}
                    </Texto>
                </Cartao>
            ) : (
                <>
                    <Secao
                        titulo="Perigos primeiro"
                        direita={<Texto variante="secao">{d.perigos.length}</Texto>}
                    />
                    <ListaPerigos perigos={d.perigos} />
                    <Secao titulo="Resumo" />
                    <Cartao>
                        <Texto variante="destaque">{d.resumo}</Texto>
                    </Cartao>
                </>
            )}

            <View style={estilos.linhaBotoes}>
                <View style={{ flex: 1 }}>
                    <Botao
                        texto={novo ? "Ouvir de novo" : "Ouvir"}
                        icone="volume-high-outline"
                        pequeno
                        onPress={() => falarDescricao(d)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Botao
                        texto="Completa"
                        icone="list-outline"
                        variante="fantasma"
                        pequeno
                        selecionado={completa}
                        rotulo={completa ? "Esconder descrição completa" : "Mostrar descrição completa"}
                        onPress={() => setCompleta((v) => !v)}
                    />
                </View>
            </View>

            {completa && (
                <>
                    {!texto && (
                        <>
                            <Secao titulo="Descrição completa" />
                            <Cartao>
                                <Texto>{d.descricaoCompleta}</Texto>
                            </Cartao>
                        </>
                    )}
                    <Secao titulo="Objetos" />
                    <View style={estilos.chips}>
                        {d.objetos.length ? (
                            d.objetos.map((o) => <Chip key={o} texto={o} />)
                        ) : (
                            <Texto variante="pequeno">Nenhum objeto listado.</Texto>
                        )}
                    </View>
                </>
            )}
            <Texto variante="pequeno" centro style={{ marginTop: 10 }}>
                Dica: toque e segure o título para ouvir a descrição completa.
            </Texto>

            <Secao titulo="Esta descrição foi útil?" />
            <View style={estilos.linhaBotoes}>
                <View style={{ flex: 1 }}>
                    <Botao
                        texto="Sim"
                        icone="thumbs-up-outline"
                        pequeno
                        variante={d.util === true ? "primario" : "fantasma"}
                        selecionado={d.util === true}
                        carregando={avaliar.isPending && avaliar.variables?.util === true}
                        onPress={() => avaliarUtil(true)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Botao
                        texto="Não"
                        icone="thumbs-down-outline"
                        pequeno
                        variante={d.util === false ? "primario" : "fantasma"}
                        selecionado={d.util === false}
                        carregando={avaliar.isPending && avaliar.variables?.util === false}
                        onPress={() => avaliarUtil(false)}
                    />
                </View>
            </View>

            <View style={{ marginTop: 20, gap: 12 }}>
                <Botao
                    texto={d.barreiraDetectada ? "Avisar a rede de apoio" : "Relatar problema deste lugar"}
                    icone="warning-outline"
                    variante="fantasma"
                    onPress={relatar}
                />
                {!novo && (
                    <Botao
                        texto="Excluir descrição"
                        icone="trash-outline"
                        variante="perigo"
                        onPress={() => setConfirmarExclusao(true)}
                    />
                )}
            </View>

            <BottomSheet
                visivel={confirmarExclusao}
                aoFechar={() => setConfirmarExclusao(false)}
                titulo="Excluir esta descrição?"
                texto="Ela sai do seu histórico. Isso não pode ser desfeito. Relatos criados a partir dela continuam."
            >
                <View style={{ marginTop: 24, gap: 12 }}>
                    <Botao
                        texto="Excluir"
                        icone="trash-outline"
                        variante="perigo"
                        carregando={excluir.isPending}
                        textoCarregando="Excluindo…"
                        onPress={confirmarExcluir}
                    />
                    <Botao texto="Cancelar" variante="fantasma" onPress={() => setConfirmarExclusao(false)} />
                </View>
            </BottomSheet>

            <BottomSheet
                visivel={sugestaoAberta}
                aoFechar={() => setSugestaoAberta(false)}
                topo={
                    tipoBarreira && (
                        <View style={estilos.iconeSugestao}>
                            <IconeTipo tipo={tipoBarreira} tamanho={36} />
                        </View>
                    )
                }
                titulo={
                    tipoBarreira && (
                        <>
                            Parece haver <Destaque>{tipoFalado[tipoBarreira]}</Destaque>.
                        </>
                    )
                }
                texto="Quer avisar a rede de apoio? Sua localização vai só neste relato."
            >
                <View style={{ marginTop: 24, gap: 12 }}>
                    <Botao texto="Sim, avisar" icone="checkmark" onPress={relatar} />
                    <Botao texto="Agora não" variante="fantasma" onPress={() => setSugestaoAberta(false)} />
                </View>
            </BottomSheet>
        </Tela>
    )
}

const estilos = StyleSheet.create({
    linhaBotoes: { flexDirection: "row", gap: 10, marginTop: 16 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    iconeSugestao: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: "rgba(255,200,30,0.14)",
        alignItems: "center",
        justifyContent: "center",
    },
})
