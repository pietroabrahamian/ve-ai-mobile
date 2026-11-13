import { View } from "react-native"

import { PerfilConteudo } from "@/components/PerfilConteudo"
import { Tela } from "@/components/Tela"

export default function Perfil() {
    return (
        <Tela>
            <PerfilConteudo />
            <View style={{ height: 100 }} />
        </Tela>
    )
}
