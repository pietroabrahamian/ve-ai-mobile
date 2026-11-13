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

export function falar(texto: string, opcoes: OpcoesFala = { interromper: true }) {
    if (!texto) return
    if (falando && !opcoes.interromper) return
    Speech.stop()
    falando = true
    Speech.speak(texto, {
        language: "pt-BR",
        rate: velocidade,
        onDone: () => {
            falando = false
        },
        onStopped: () => {
            falando = false
        },
        onError: () => {
            falando = false
        },
    })
}

export function pararFala() {
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
