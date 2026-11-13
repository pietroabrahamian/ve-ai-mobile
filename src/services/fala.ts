import * as Haptics from "expo-haptics"
import * as Speech from "expo-speech"
import { AccessibilityInfo } from "react-native"

// Fala única do app (guia 7.1): uma frase de cada vez, em pt-BR, na velocidade do perfil.
// No lugar de arquivos de som usamos padrões de vibração diferentes (alerta, pergunta, erro),
// para não adicionar uma biblioteca de áudio.

let velocidade = 1
let avisosLigados = true // preferência "Sons de aviso" (aqui, padrões de vibração)
let vibracaoLigada = true // preferência "Vibração" (perigo a menos de 2 metros)
let falando = false

export function configurarFala(opcoes: { velocidade?: number; avisos?: boolean; vibracao?: boolean }) {
    if (opcoes.velocidade != null) velocidade = opcoes.velocidade
    if (opcoes.avisos != null) avisosLigados = opcoes.avisos
    if (opcoes.vibracao != null) vibracaoLigada = opcoes.vibracao
}

export type TipoAviso = "alerta" | "pergunta" | "erro" | "sucesso"

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Padrões de vibração que substituem os "sons curtos" do guia
export async function avisar(tipo: TipoAviso) {
    if (!avisosLigados) return
    try {
        if (tipo === "alerta") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        if (tipo === "erro") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        if (tipo === "sucesso") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        if (tipo === "pergunta") {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            await espera(120)
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
    } catch {
        // aparelho sem motor de vibração: segue só com a fala
    }
}

// Vibração forte para perigo a cerca de 1 metro ou menos
export async function vibrarPerigoProximo() {
    if (!vibracaoLigada) return
    try {
        for (let i = 0; i < 3; i++) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            await espera(90)
        }
    } catch {
        // sem motor de vibração
    }
}

export function toqueLeve() {
    Haptics.selectionAsync().catch(() => undefined)
}

interface OpcoesFala {
    // true: algo mudou ou é importante. Interrompe a fala atual e fala já (guia 7.1).
    // false: confirmação. Se ainda houver outra fala tocando, é descartada.
    interromper?: boolean
}

// A voz vem do motor de fala do próprio celular (no Android, o "Google Text-to-Speech"),
// sem API nem chave. Procuramos uma voz em português instalada; sem ela, o sistema usa a padrão.
let vozPortugues: string | undefined
let vozProcurada = false

async function escolherVoz() {
    if (vozProcurada) return vozPortugues
    vozProcurada = true
    try {
        const vozes = await Speech.getAvailableVoicesAsync()
        const pt = vozes.filter((v) => v.language.replace("_", "-").toLowerCase().startsWith("pt"))
        vozPortugues = (pt.find((v) => v.language.replace("_", "-").toLowerCase() === "pt-br") ?? pt[0])
            ?.identifier
    } catch {
        vozPortugues = undefined
    }
    return vozPortugues
}

// As falas passam por uma fila: só começamos a nova DEPOIS que a anterior parou de verdade.
// (No Android, um stop() ainda em andamento pode cancelar a fala que acabou de começar.)
let fila: Promise<void> = Promise.resolve()
let falaAtual = 0

export function falar(texto: string, opcoes: OpcoesFala = { interromper: true }) {
    if (!texto) return
    if (falando && !opcoes.interromper) return
    const minhaFala = ++falaAtual
    fila = fila
        .then(async () => {
            if (minhaFala !== falaAtual) return // já chegou outra fala mais nova
            if (await Speech.isSpeakingAsync()) await Speech.stop()
            const voz = await escolherVoz()
            falando = true
            const terminou = () => {
                if (minhaFala === falaAtual) falando = false
            }
            Speech.speak(texto, {
                language: "pt-BR",
                voice: voz,
                rate: velocidade,
                // iPhone: o sistema cria uma sessão de áudio só para a fala, que se mistura com os
                // outros sons (guia 7.1: a pessoa precisa continuar ouvindo a rua)
                useApplicationAudioSession: false,
                onDone: terminou,
                onStopped: terminou,
                onError: terminou,
            })
        })
        .catch(() => {
            falando = false
        })
}

export function pararFala() {
    falaAtual++
    falando = false
    Speech.stop()
}

export function estaFalando() {
    return falando
}

// Mensagens curtas da interface ("Pausado", "Relato enviado"). Com o TalkBack ligado, quem fala
// é o próprio leitor de tela, para não falar por cima dele (guia 7.2).
export async function anunciar(texto: string) {
    const leitorAtivo = await AccessibilityInfo.isScreenReaderEnabled()
    if (leitorAtivo) AccessibilityInfo.announceForAccessibility(texto)
    else falar(texto)
}
