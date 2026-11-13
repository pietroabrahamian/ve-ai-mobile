// Cores do protótipo aprovado (tokens do :root em VeAI/prototipo/index.html).
// Azul-marinho com amarelo: contraste alto para quem tem baixa visão.
export const cores = {
    fundo: "#0A1430",
    fundo2: "#0D1A3D",
    card: "#112250",
    borda: "#2B427E",
    borda2: "#3A5596",
    campo: "#0C1A3E",
    abas: "#0B1736",
    sheet: "#0F1F4A",
    divisor: "#1E3165",
    amarelo: "#FFC81E",
    amarelo2: "#F5B700",
    sobreAmarelo: "#0A1430",
    texto: "#FFFFFF",
    textoSecundario: "#AFC0E6",
    textoTerciario: "#7F93C2",
    perigo: "#FF6B5E",
    sucesso: "#4ADE80",
    azul: "#7DB3FF",
    roxo: "#BDA6FF",
    cinza: "#8E9AB8",
    toast: "#F4F7FF",
    sobreposicao: "rgba(3,8,22,0.66)",
}

// O React Native 0.88 desenha gradiente direto no estilo (backgroundImage), sem biblioteca
export const gradientes = {
    amarelo: "linear-gradient(160deg, #FFD23F, #F7B800)",
    card: "linear-gradient(160deg, #13275A, #0E1D45)",
}

export const coresStatus = {
    ABERTO: { cor: cores.azul, fundo: "rgba(125,179,255,0.13)" },
    EM_TRIAGEM: { cor: cores.amarelo, fundo: "rgba(255,200,30,0.13)" },
    ENCAMINHADO: { cor: cores.roxo, fundo: "rgba(189,166,255,0.14)" },
    RESOLVIDO: { cor: cores.sucesso, fundo: "rgba(74,222,128,0.13)" },
    DESCARTADO: { cor: cores.cinza, fundo: "rgba(142,154,184,0.15)" },
}

export const coresGravidade = {
    ALTA: { cor: cores.perigo, fundo: "rgba(255,107,94,0.16)" },
    MEDIA: { cor: cores.amarelo, fundo: "rgba(255,200,30,0.14)" },
    BAIXA: { cor: cores.azul, fundo: "rgba(125,179,255,0.14)" },
}
