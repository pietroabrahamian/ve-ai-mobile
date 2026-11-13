// Contrato da API do Vê AI (seção 13 do GUIA-APP-MOBILE.md). Java e .NET seguem o mesmo contrato.

export type Papel = "CIDADAO" | "GESTOR"
export type ModoDescricao = "AMBIENTE" | "TEXTO"
export type TipoRelato =
    | "CALCADA_DANIFICADA"
    | "OBSTRUCAO_PERMANENTE"
    | "PISO_TATIL"
    | "RAMPA"
    | "SEMAFORO_SEM_SOM"
    | "OBRA_SEM_SINALIZACAO"
    | "OUTRO"
export type Gravidade = "BAIXA" | "MEDIA" | "ALTA"
export type StatusRelato = "ABERTO" | "EM_TRIAGEM" | "ENCAMINHADO" | "RESOLVIDO" | "DESCARTADO"
export type Direcao = "frente" | "frente-direita" | "direita" | "frente-esquerda" | "esquerda"

export interface Pagina<T> {
    conteudo: T[]
    pagina: number
    tamanho: number
    totalElementos: number
    totalPaginas: number
}

export interface ErroResposta {
    timestamp: string
    status: number
    erro: string
    mensagem: string
    campos: { campo: string; mensagem: string }[]
}

export interface RegiaoResposta {
    id: number
    nome: string
    cidade: string
    uf: string
    latitude: number | null
    longitude: number | null
}

export interface UsuarioResposta {
    id: number
    nome: string
    email: string
    papel: Papel
    velocidadeVoz: number
    perguntaLivreAtiva: boolean
    criadoEm: string
    regioes: RegiaoResposta[]
}

export interface TokenResposta {
    token: string
    tipo: "Bearer"
    expiraEm: string
    papel: Papel
    usuario: UsuarioResposta
}

export interface Perigo {
    descricao: string
    direcao: Direcao
    distanciaAprox: string
}

export interface SugestaoRelato {
    tipo: TipoRelato
    gravidade: Gravidade
    pergunta: string
}

export interface DescricaoResposta {
    id: number
    modo: ModoDescricao
    perigos: Perigo[]
    resumo: string
    descricaoCompleta: string
    novidade: boolean | null // só no POST; null no histórico
    objetos: string[]
    barreiraDetectada: boolean
    barreiraTipo: TipoRelato | null
    latenciaMs: number
    util: boolean | null
    criadoEm: string
    sugestaoRelato: SugestaoRelato | null
}

export interface RelatoResposta {
    id: number
    cidadaoId: number
    descricaoId: number | null
    regiao: { id: number; nome: string }
    tipo: TipoRelato
    gravidade: Gravidade
    texto: string
    latitude: number
    longitude: number
    endereco: string | null
    status: StatusRelato
    protocoloOrgao: string | null
    motivoDescarte: string | null
    totalApoios: number
    prioridade: number
    normaReferencia: string | null
    criadoEm: string
    atualizadoEm: string
}

export interface RegistroRelatoResposta {
    resultado: "CRIADO" | "APOIO_REGISTRADO" | "JA_REGISTRADO"
    apoioRegistrado: boolean
    relato: RelatoResposta
}

export interface NotificacaoResposta {
    id: number
    relatoId: number
    mensagem: string
    lida: boolean
    criadoEm: string
}

export interface AtualizacaoResposta {
    id: number
    statusAnterior: StatusRelato
    statusNovo: StatusRelato
    comentario: string | null
    gestorId: number
    gestorNome: string
    criadoEm: string
}

// Corpos das requisições
export interface RelatoRequisicao {
    tipo: TipoRelato
    gravidade: Gravidade
    texto: string
    latitude: number
    longitude: number
    endereco?: string
    descricaoId?: number
}

export interface EdicaoRelatoRequisicao {
    tipo: TipoRelato
    gravidade: Gravidade
    texto: string
    endereco: string | null
}

export interface StatusRequisicao {
    status: StatusRelato
    protocoloOrgao?: string
    motivoDescarte?: string
    comentario?: string
}
