import * as Location from "expo-location"
import { useCallback, useState } from "react"

export interface Posicao {
    latitude: number
    longitude: number
    precisao: number | null
    endereco: string | null
}

// Se o GPS de alta precisão demorar mais que isso, usamos a última posição conhecida (guia 10.3)
const LIMITE_GPS_MS = 5_000

function comLimite<T>(promessa: Promise<T>, ms: number) {
    return Promise.race([promessa, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))])
}

async function enderecoDe(latitude: number, longitude: number) {
    try {
        const [lugar] = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (!lugar) return null
        const rua = [lugar.street, lugar.streetNumber].filter(Boolean).join(", ")
        const texto = [rua || lugar.name, lugar.district || lugar.subregion].filter(Boolean).join(" · ")
        return texto ? texto.slice(0, 200) : null // a API aceita até 200 caracteres
    } catch {
        return null
    }
}

// GPS do relato (aula 6): pede a permissão, tenta alta precisão e cai para a última posição
export function useLocalizacao() {
    const [posicao, setPosicao] = useState<Posicao | null>(null)
    const [buscando, setBuscando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const buscar = useCallback(async () => {
        setBuscando(true)
        setErro(null)
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                setErro("Sem permissão de localização. Ative nas configurações para relatar uma barreira.")
                return null
            }
            const atual = await comLimite(
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                LIMITE_GPS_MS,
            )
            const leitura = atual ?? (await Location.getLastKnownPositionAsync())
            if (!leitura) {
                setErro("Não consegui achar sua localização. Tente de novo em um lugar aberto.")
                return null
            }
            const { latitude, longitude, accuracy } = leitura.coords
            const nova: Posicao = {
                latitude,
                longitude,
                precisao: accuracy ?? null,
                endereco: await enderecoDe(latitude, longitude),
            }
            setPosicao(nova)
            return nova
        } catch {
            setErro("Não consegui achar sua localização. Tente de novo.")
            return null
        } finally {
            setBuscando(false)
        }
    }, [])

    return { posicao, buscando, erro, buscar }
}

// Pede a permissão antes da caminhada, e não no meio dela (guia 10.3)
export async function pedirPermissaoLocalizacao() {
    try {
        const atual = await Location.getForegroundPermissionsAsync()
        if (atual.status === "granted" || !atual.canAskAgain) return
        await Location.requestForegroundPermissionsAsync()
    } catch {
        // sem GPS no aparelho: o relato avisa na hora
    }
}
