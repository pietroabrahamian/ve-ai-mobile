// Chaves do cache do TanStack Query. Invalidar uma chave faz as telas buscarem de novo.
export const chaves = {
    descricoes: ["descricoes"] as const,
    descricao: (id: number) => ["descricoes", id] as const,
    relatos: ["relatos"] as const,
    relato: (id: number) => ["relatos", id] as const,
    notificacoes: ["notificacoes"] as const,
    naoLidas: ["notificacoes", "nao-lidas"] as const,
    fila: ["fila"] as const,
    filaRelato: (id: number) => ["fila", id] as const,
    historico: (id: number) => ["fila", id, "historico"] as const,
    regioes: ["regioes"] as const,
    saude: ["saude"] as const,
}
