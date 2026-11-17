// Roda no Node na hora do build, não no celular. Os tipos do Node já vêm com o Expo.
/// <reference types="node" />
import { execSync } from "node:child_process"
import type { ConfigContext, ExpoConfig } from "expo/config"
import { withGradleProperties } from "expo/config-plugins"

// O Expo SDK 58 liga o R8 (minificação) no build de release. Com ele, o WorkManager que o
// react-native-maps traz não consegue criar o banco interno e o APK fecha logo ao abrir.
// O Expo Go não usa R8, por isso o erro só aparecia no APK instalado.
function semMinificacao(config: ExpoConfig): ExpoConfig {
    return withGradleProperties(config, (mod) => {
        mod.modResults = mod.modResults.filter(
            (item) => !(item.type === "property" && item.key === "android.enableMinifyInReleaseBuilds"),
        )
        mod.modResults.push({ type: "property", key: "android.enableMinifyInReleaseBuilds", value: "false" })
        return mod
    })
}

// Hash curto do commit, mostrado na tela "Sobre o App" (requisito 7 da GS).
// No EAS Build não há pasta .git: lá o próprio EAS informa o commit em EAS_BUILD_GIT_COMMIT_HASH.
function lerCommitHash(): string {
    if (process.env.COMMIT_HASH) return process.env.COMMIT_HASH
    if (process.env.EAS_BUILD_GIT_COMMIT_HASH) return process.env.EAS_BUILD_GIT_COMMIT_HASH.slice(0, 7)
    try {
        return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim()
    } catch {
        return "sem commit"
    }
}

export default ({ config }: ConfigContext): ExpoConfig =>
    semMinificacao({
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
            // Chave do Google Maps para o MapView no Android (variável de ambiente do EAS, fora do git).
            // Sem ela o componente Mapa mostra o endereço e o botão "Abrir no mapa".
            ...(process.env.GOOGLE_MAPS_API_KEY
                ? { config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } } }
                : {}),
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
            [
                "expo-camera",
                { cameraPermission: "O Vê AI usa a câmera para descrever o ambiente à sua frente." },
            ],
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
            // Projeto no Expo (EAS Build), criado com "eas init"
            eas: { projectId: "17e08c17-02e8-467f-ba1d-c732331a642b" },
        },
    })
