import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { StyleSheet, View } from "react-native"

import { cores, fontes } from "@/theme"

import type { NomeIcone } from "./Botao"

export type ConfigAba = { nome: string; titulo: string; icone: NomeIcone; iconeAtivo?: NomeIcone }

// Barra de abas do protótipo (.tabbar): fundo escuro, cantos arredondados, aba ativa em amarelo com traço
export function Abas({ abas }: { abas: ConfigAba[] }) {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: cores.amarelo,
                tabBarInactiveTintColor: cores.textoSecundario,
                tabBarLabelStyle: { fontFamily: fontes.negrito, fontSize: 14 },
                tabBarStyle: estilos.barra,
                tabBarItemStyle: { minHeight: 64 },
                sceneStyle: { backgroundColor: cores.fundo },
            }}
        >
            {abas.map((aba) => (
                <Tabs.Screen
                    key={aba.nome}
                    name={aba.nome}
                    options={{
                        title: aba.titulo,
                        tabBarAccessibilityLabel: aba.titulo,
                        tabBarIcon: ({ focused }) => (
                            <View style={{ alignItems: "center" }}>
                                <Ionicons
                                    name={focused ? (aba.iconeAtivo ?? aba.icone) : aba.icone}
                                    size={30}
                                    color={focused ? cores.amarelo : cores.textoSecundario}
                                />
                                {focused && <View style={estilos.traco} />}
                            </View>
                        ),
                    }}
                />
            ))}
        </Tabs>
    )
}

const estilos = StyleSheet.create({
    barra: {
        backgroundColor: cores.abas,
        borderTopWidth: 1.5,
        borderTopColor: cores.borda,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: 92,
        paddingTop: 10,
        position: "absolute",
    },
    traco: {
        position: "absolute",
        bottom: -36,
        width: 46,
        height: 4,
        borderRadius: 4,
        backgroundColor: cores.amarelo,
    },
})
