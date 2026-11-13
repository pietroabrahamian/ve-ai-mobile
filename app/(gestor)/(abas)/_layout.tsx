import { Abas } from "@/components/Abas"

export default function AbasGestor() {
    return (
        <Abas
            abas={[
                { nome: "fila", titulo: "Fila", icone: "list-outline" },
                { nome: "avisos", titulo: "Avisos", icone: "notifications-outline" },
                { nome: "conta", titulo: "Perfil", icone: "person-outline" },
            ]}
        />
    )
}
