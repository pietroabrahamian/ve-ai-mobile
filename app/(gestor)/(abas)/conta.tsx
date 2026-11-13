import { View } from "react-native"

import { PerfilConteudo } from "@/components/PerfilConteudo"
import { Tela } from "@/components/Tela"

// Perfil do gestor (o arquivo se chama "conta" para não ter a mesma rota do perfil do cidadão)
export default function ContaGestor() {
    return (
        <Tela>
            <PerfilConteudo />
            <View style={{ height: 100 }} />
        </Tela>
    )
}
