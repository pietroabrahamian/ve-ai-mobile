import type { Gravidade, StatusRelato, TipoRelato } from "@/types/api"

// Rótulos de tela vêm do protótipo; as frases faladas vêm do guia da API (seção 10.1)

export const rotuloStatus: Record<StatusRelato, string> = {
    ABERTO: "Aberto",
    EM_TRIAGEM: "Em triagem",
    ENCAMINHADO: "Encaminhado",
    RESOLVIDO: "Resolvido",
    DESCARTADO: "Descartado",
}

export const statusFalado: Record<StatusRelato, string> = {
    ABERTO: "aguardando análise",
    EM_TRIAGEM: "em análise pela rede de apoio",
    ENCAMINHADO: "encaminhado ao órgão responsável",
    RESOLVIDO: "resolvido",
    DESCARTADO: "encerrado",
}

export const rotuloGravidade: Record<Gravidade, string> = { ALTA: "ALTA", MEDIA: "MÉDIA", BAIXA: "BAIXA" }
export const gravidadeFalada: Record<Gravidade, string> = {
    ALTA: "gravidade alta",
    MEDIA: "gravidade média",
    BAIXA: "gravidade baixa",
}
export const pesoGravidade: Record<Gravidade, number> = { BAIXA: 1, MEDIA: 3, ALTA: 5 }

export const rotuloTipo: Record<TipoRelato, string> = {
    CALCADA_DANIFICADA: "Calçada danificada",
    OBSTRUCAO_PERMANENTE: "Obstrução permanente",
    PISO_TATIL: "Piso tátil ausente ou interrompido",
    RAMPA: "Rampa irregular ou ausente",
    SEMAFORO_SEM_SOM: "Semáforo sem som",
    OBRA_SEM_SINALIZACAO: "Obra sem sinalização",
    OUTRO: "Outro problema",
}

export const tipoFalado: Record<TipoRelato, string> = {
    CALCADA_DANIFICADA: "calçada danificada",
    OBSTRUCAO_PERMANENTE: "calçada obstruída",
    PISO_TATIL: "problema no piso tátil",
    RAMPA: "problema na rampa",
    SEMAFORO_SEM_SOM: "semáforo sem som",
    OBRA_SEM_SINALIZACAO: "obra sem sinalização",
    OUTRO: "barreira",
}

export const TIPOS: TipoRelato[] = [
    "CALCADA_DANIFICADA",
    "OBSTRUCAO_PERMANENTE",
    "PISO_TATIL",
    "RAMPA",
    "SEMAFORO_SEM_SOM",
    "OBRA_SEM_SINALIZACAO",
    "OUTRO",
]

// Transições permitidas (guia 12.3): sem pular etapa e sem voltar,
// mais DESCARTADO a partir de qualquer status não final
export const proximosStatus: Record<StatusRelato, StatusRelato[]> = {
    ABERTO: ["EM_TRIAGEM", "DESCARTADO"],
    EM_TRIAGEM: ["ENCAMINHADO", "DESCARTADO"],
    ENCAMINHADO: ["RESOLVIDO", "DESCARTADO"],
    RESOLVIDO: [],
    DESCARTADO: [],
}

export const FLUXO_STATUS: StatusRelato[] = ["ABERTO", "EM_TRIAGEM", "ENCAMINHADO", "RESOLVIDO"]

export function plural(n: number, singular: string, varios: string) {
    return `${n} ${n === 1 ? singular : varios}`
}
