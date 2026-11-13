import { StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"

import { borda, cores } from "@/theme"

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
})
