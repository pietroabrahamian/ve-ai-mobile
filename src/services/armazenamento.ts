import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"

import type { Papel, UsuarioResposta } from "@/types/api"

// Sessão (token JWT e data de expiração) fica no SecureStore, que é criptografado (aula 1).
// A aula proíbe guardar o token no AsyncStorage.
const CHAVE_SESSAO = "veai.sessao"

// Preferências que só existem no aparelho (guia 4.4): modo de descrição, intervalo e avisos
const CHAVE_PREFERENCIAS = "veai.preferencias"

export interface SessaoSalva {
    token: string
    expiraEm: string
    papel: Papel
    usuario: UsuarioResposta
}

export async function salvarSessao(sessao: SessaoSalva) {
    await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(sessao))
}

export async function lerSessao(): Promise<SessaoSalva | null> {
    try {
        const texto = await SecureStore.getItemAsync(CHAVE_SESSAO)
        return texto ? (JSON.parse(texto) as SessaoSalva) : null
    } catch {
        return null
    }
}

export async function apagarSessao() {
    await SecureStore.deleteItemAsync(CHAVE_SESSAO)
}

export type ModoPreferido = "AUTOMATICO" | "MANUAL"

export interface PreferenciasLocais {
    modo: ModoPreferido
    intervaloSegundos: number
    sons: boolean
    vibracao: boolean
}

// O modo padrão é o automático, com uma foto a cada 15 s (decisão de produto)
export const PREFERENCIAS_PADRAO: PreferenciasLocais = {
    modo: "AUTOMATICO",
    intervaloSegundos: 15,
    sons: true,
    vibracao: true,
}

export async function lerPreferencias(): Promise<PreferenciasLocais> {
    try {
        const texto = await AsyncStorage.getItem(CHAVE_PREFERENCIAS)
        return texto
            ? { ...PREFERENCIAS_PADRAO, ...(JSON.parse(texto) as Partial<PreferenciasLocais>) }
            : PREFERENCIAS_PADRAO
    } catch {
        return PREFERENCIAS_PADRAO
    }
}

export async function salvarPreferenciasLocais(preferencias: PreferenciasLocais) {
    await AsyncStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias))
}
