// Roda no Node na hora do build, não no celular. Os tipos do Node já vêm com o Expo.
/// <reference types="node" />
import { execSync } from "node:child_process"
import type { ConfigContext, ExpoConfig } from "expo/config"

// Hash curto do commit, mostrado na tela "Sobre o App" (requisito da rubrica).
// No EAS Build não há pasta .git, então o hash vem da variável COMMIT_HASH.
function lerCommitHash(): string {
    if (process.env.COMMIT_HASH) return process.env.COMMIT_HASH
    try {
        return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim()
    } catch {
        return "sem commit"
    }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Vê AI",
    slug: "veai-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "veai",
    // Um único tema escuro, de alto contraste, pensado para baixa visão
    userInterfaceStyle: "dark",
    backgroundColor: "#0A1430",
    ios: {
        supportsTablet: false,
        infoPlist: {
            NSCameraUsageDescription: "O Vê AI usa a câmera para descrever o ambiente à sua frente.",
            NSLocationWhenInUseUsageDescription:
                "A localização só é enviada quando você decide relatar uma barreira.",
        },
    },
    android: {
        package: "br.com.fiap.veai",
        adaptiveIcon: {
            backgroundColor: "#0A1430",
            foregroundImage: "./assets/images/android-icon-foreground.png",
            backgroundImage: "./assets/images/android-icon-background.png",
            monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        permissions: ["CAMERA", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION", "VIBRATE"],
        predictiveBackGestureEnabled: false,
    },
    plugins: [
        "expo-router",
        "expo-font",
        "expo-secure-store",
        [
            "expo-splash-screen",
            { backgroundColor: "#0A1430", image: "./assets/images/splash-icon.png", imageWidth: 180 },
        ],
        ["expo-camera", { cameraPermission: "O Vê AI usa a câmera para descrever o ambiente à sua frente." }],
        [
            "expo-location",
            {
                locationWhenInUsePermission:
                    "A localização só é enviada quando você decide relatar uma barreira.",
            },
        ],
    ],
    experiments: { reactCompiler: true },
    extra: {
        commitHash: lerCommitHash(),
    },
})
