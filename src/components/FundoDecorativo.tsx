import { StyleSheet, View } from "react-native"
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg"

import { cores } from "@/theme"

// Faixas decorativas do fundo da Início e do Login (SVG do protótipo).
// Escondidas do leitor de tela e sem receber toques.
export function FundoDecorativo() {
    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
                <Defs>
                    <LinearGradient id="gy" x1="0" x2="1" y1="0" y2="0">
                        <Stop offset="0" stopColor={cores.amarelo} stopOpacity={0} />
                        <Stop offset="0.6" stopColor={cores.amarelo} />
                    </LinearGradient>
                    <LinearGradient id="gb" x1="0" x2="1" y1="0" y2="1">
                        <Stop offset="0" stopColor="#16306E" stopOpacity={0.55} />
                        <Stop offset="1" stopColor={cores.fundo} stopOpacity={0} />
                    </LinearGradient>
                </Defs>
                <Path d="M150 0 C 240 120 230 260 120 420 L 0 420 L 0 0 Z" fill="url(#gb)" />
                <Path
                    d="M268 250 C 310 212 352 192 390 184 L 390 204 C 355 214 322 234 292 266 Z"
                    fill="url(#gy)"
                />
                <Path d="M0 700 C 50 705 90 720 115 745 L 0 745 Z" fill={cores.amarelo} opacity={0.95} />
            </Svg>
        </View>
    )
}
