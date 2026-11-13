// A API manda as datas em UTC (ISO 8601). Mostramos e falamos no fuso de São Paulo.
const FUSO = "America/Sao_Paulo"

const formato = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
})

function partes(data: Date) {
    const p: Record<string, string> = {}
    for (const parte of formato.formatToParts(data)) p[parte.type] = parte.value
    return {
        dia: `${p.day}/${p.month}`,
        ano: p.year,
        hora: p.hour,
        minuto: p.minute,
        chave: `${p.year}-${p.month}-${p.day}`,
    }
}

function relativo(iso: string): "hoje" | "ontem" | null {
    const alvo = partes(new Date(iso)).chave
    if (alvo === partes(new Date()).chave) return "hoje"
    if (alvo === partes(new Date(Date.now() - 86_400_000)).chave) return "ontem"
    return null
}

// "14:32"
export function hora(iso: string) {
    const p = partes(new Date(iso))
    return `${p.hora}:${p.minuto}`
}

// "Hoje", "Ontem" ou "07/11" (cabeçalho dos grupos do histórico)
export function rotuloDia(iso: string) {
    const r = relativo(iso)
    if (r === "hoje") return "Hoje"
    if (r === "ontem") return "Ontem"
    return partes(new Date(iso)).dia
}

// "hoje às 19h10", "ontem às 8h05", "07/11 às 14h40" (para mostrar e para falar)
export function quando(iso: string) {
    const p = partes(new Date(iso))
    return `${relativo(iso) ?? p.dia} às ${Number(p.hora)}h${p.minuto}`
}

// "07/11/2026"
export function dataCurta(iso: string) {
    const p = partes(new Date(iso))
    return `${p.dia}/${p.ano}`
}

// O JWT ainda vale? (usa o `expiraEm` devolvido no login)
export function sessaoValida(expiraEm: string) {
    return new Date(expiraEm).getTime() > Date.now()
}

// Dias inteiros desde a data (idade do relato na fila do gestor)
export function diasDesde(iso: string) {
    return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}
