import { View } from "react-native"

import { ListaNotificacoes } from "@/components/ListaNotificacoes"
import { Tela } from "@/components/Tela"

export default function Avisos() {
    return (
        <Tela>
            <View style={{ paddingTop: 20, paddingBottom: 100 }}>
                <ListaNotificacoes />
            </View>
        </Tela>
    )
}
