import { Abas } from "@/components/Abas"

export default function AbasCidadao() {
    return (
        <Abas
            abas={[
                { nome: "inicio", titulo: "Início", icone: "home-outline", iconeAtivo: "home" },
                { nome: "historico", titulo: "Histórico", icone: "time-outline" },
                { nome: "relatos", titulo: "Relatos", icone: "clipboard-outline" },
                { nome: "perfil", titulo: "Perfil", icone: "person-outline" },
            ]}
        />
    )
}
