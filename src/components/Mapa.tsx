import Constants from "expo-constants"
import { Linking, Platform, StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"

import { borda, cores } from "@/theme"

import { Botao } from "./Botao"
import { Texto } from "./Texto"

// No Android o MapView usa o Google Maps e fecha o app se o APK não tiver a chave da API.
// A chave entra no build pela variável GOOGLE_MAPS_API_KEY (app.config.ts). Sem ela, mostramos
// o endereço e um botão que abre o ponto no app de mapas do celular, em vez de travar.
const temMapaNativo = Platform.OS !== "android" || !!Constants.expoConfig?.android?.config?.googleMaps?.apiKey

function abrirNoMapa(latitude: number, longitude: number, titulo?: string) {
    const rotulo = encodeURIComponent(titulo ?? "Local do relato")
    Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}(${rotulo})`).catch(() =>
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`),
    )
}

// Mapa com o ponto do relato (aula 6: MapView + Marker)
export function Mapa({
    latitude,
    longitude,
    titulo,
}: {
    latitude: number
    longitude: number
    titulo?: string
}) {
    if (!temMapaNativo) {
        return (
            <View style={[estilos.caixa, estilos.semMapa]}>
                <Texto variante="pequeno">{titulo ?? "Local do relato"}</Texto>
                <Botao
                    texto="Abrir no mapa"
                    icone="map-outline"
                    variante="fantasma"
                    pequeno
                    rotulo={`Abrir o local no app de mapas${titulo ? `: ${titulo}` : ""}`}
                    onPress={() => abrirNoMapa(latitude, longitude, titulo)}
                />
            </View>
        )
    }

    return (
        <View
            style={estilos.caixa}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Mapa com o local${titulo ? `: ${titulo}` : ""}`}
        >
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{ latitude, longitude, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                importantForAccessibility="no-hide-descendants"
            >
                <Marker coordinate={{ latitude, longitude }} title={titulo} pinColor={cores.amarelo} />
            </MapView>
        </View>
    )
}

const estilos = StyleSheet.create({
    caixa: {
        height: 160,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: borda,
        borderColor: cores.borda,
        backgroundColor: "#14254F",
    },
    semMapa: {
        height: undefined,
        padding: 16,
        gap: 12,
    },
})
