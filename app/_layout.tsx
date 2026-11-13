import { QueryClientProvider, focusManager } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { AppState, View } from "react-native"

import { queryClient } from "@/api/queryClient"
import { ToastHost } from "@/components/Toast"
import { AuthProvider } from "@/contexts/AuthContext"
import { PreferenciasProvider } from "@/contexts/PreferenciasContext"
import { arquivosDeFonte, cores } from "@/theme"

// Segura o splash até as fontes carregarem (o texto não "pisca" com a fonte do sistema)
SplashScreen.preventAutoHideAsync()

// Ao voltar para o primeiro plano, o TanStack Query busca de novo o que estiver na tela
// (assim as notificações são consultadas ao reabrir o app, como pede o guia 11)
AppState.addEventListener("change", (estado) => focusManager.setFocused(estado === "active"))

export default function LayoutRaiz() {
    const [carregadas, erro] = useFonts(arquivosDeFonte)
    const pronto = carregadas || erro !== null

    useEffect(() => {
        if (pronto) SplashScreen.hideAsync()
    }, [pronto])

    if (!pronto) return null

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <PreferenciasProvider>
                    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
                        <StatusBar style="light" />
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: cores.fundo },
                            }}
                        />
                        <ToastHost />
                    </View>
                </PreferenciasProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}
