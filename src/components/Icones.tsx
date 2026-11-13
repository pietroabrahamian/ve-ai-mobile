import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import Svg, { Circle, Path, Rect } from "react-native-svg"

import { cores } from "@/theme"
import type { TipoRelato } from "@/types/api"

// Ícone de cada tipo de barreira (equivalentes dos ícones do protótipo)
const ICONE_TIPO: Record<TipoRelato, keyof typeof MaterialCommunityIcons.glyphMap> = {
    CALCADA_DANIFICADA: "road-variant",
    OBSTRUCAO_PERMANENTE: "traffic-cone",
    PISO_TATIL: "dots-grid",
    RAMPA: "slope-uphill",
    SEMAFORO_SEM_SOM: "traffic-light-outline",
    OBRA_SEM_SINALIZACAO: "hammer-wrench",
    OUTRO: "dots-horizontal",
}

export function IconeTipo({
    tipo,
    tamanho = 28,
    cor = cores.amarelo,
}: {
    tipo: TipoRelato
    tamanho?: number
    cor?: string
}) {
    return <MaterialCommunityIcons name={ICONE_TIPO[tipo]} size={tamanho} color={cor} />
}

// "Aa" do modo Ler Texto
export function IconeTexto({ cor = cores.amarelo, tamanho = 22 }: { cor?: string; tamanho?: number }) {
    return <Ionicons name="text-outline" size={tamanho} color={cor} />
}

// Ícones desenhados dos cards da Início (os mesmos SVGs do protótipo)
export function IconeDescrever() {
    return (
        <Svg width={76} height={65} viewBox="0 0 82 70">
            <Path
                d="M22 8l-4-6M33 4l1-4M44 8l5-5"
                stroke={cores.fundo}
                strokeWidth={4}
                strokeLinecap="round"
            />
            <Path
                d="M8 22h14l6-8h22l6 8h14a6 6 0 0 1 6 6v32a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z"
                fill={cores.fundo}
            />
            <Circle cx={41} cy={44} r={14} fill="none" stroke={cores.amarelo} strokeWidth={6} />
            <Rect x={62} y={30} width={7} height={5} rx={2} fill={cores.amarelo} />
        </Svg>
    )
}

export function IconeRelatar() {
    return (
        <Svg width={74} height={65} viewBox="0 0 80 70">
            <Path d="M34 4a7 7 0 0 1 12 0l32 56a7 7 0 0 1-6 10H8a7 7 0 0 1-6-10z" fill={cores.amarelo} />
            <Rect x={36} y={20} width={8} height={26} rx={4} fill={cores.fundo} />
            <Circle cx={40} cy={56} r={5} fill={cores.fundo} />
        </Svg>
    )
}

// Barras de "onda sonora" dos lados do botão de captura
export function Ondas({ alturas }: { alturas: number[] }) {
    return (
        <Svg
            width={alturas.length * 15}
            height={72}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            {alturas.map((h, i) => (
                <Rect key={i} x={i * 15} y={(72 - h) / 2} width={6} height={h} rx={3} fill="#3B5596" />
            ))}
        </Svg>
    )
}
