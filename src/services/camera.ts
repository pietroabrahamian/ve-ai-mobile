import type { CameraView } from "expo-camera"
import { File } from "expo-file-system"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"

// Lado maior da foto enviada: 1024 px em JPEG 0,7 (guia 5.3). Fica com 100 a 250 KB
// e a resposta não muda, porque a API reduz para 1024 px de qualquer jeito.
const LADO_MAXIMO = 1024
const QUALIDADE = 0.7

// Privacidade (guia 7.4): nenhuma foto vai para a galeria. Guardamos só a última em memória
// (para a pergunta livre) e apagamos o arquivo temporário anterior a cada nova captura.
let ultimaFoto: string | null = null

function apagarArquivo(uri: string | null) {
    if (!uri) return
    try {
        const arquivo = new File(uri)
        if (arquivo.exists) arquivo.delete()
    } catch {
        // o sistema limpa o cache de qualquer jeito
    }
}

// Se a câmera ou a redução travarem, a etapa falha e o loop segue (conta como falha de conexão),
// em vez de ficar parado em "Analisando…" para sempre
const LIMITE_CAPTURA_MS = 15_000

function comLimite<T>(promessa: Promise<T>, etapa: string): Promise<T> {
    return Promise.race([
        promessa,
        new Promise<T>((_, rejeitar) =>
            setTimeout(() => rejeitar(new Error(`${etapa} demorou demais`)), LIMITE_CAPTURA_MS),
        ),
    ])
}

export async function capturarFoto(camera: CameraView): Promise<string> {
    const foto = await comLimite(
        camera.takePictureAsync({ quality: QUALIDADE, shutterSound: false }),
        "A foto",
    )
    const retrato = foto.height >= foto.width
    const contexto = ImageManipulator.manipulate(foto.uri)
    contexto.resize(retrato ? { height: LADO_MAXIMO } : { width: LADO_MAXIMO })
    const imagem = await comLimite(contexto.renderAsync(), "A redução da foto")
    const reduzida = await comLimite(
        imagem.saveAsync({ compress: QUALIDADE, format: SaveFormat.JPEG }),
        "Salvar a foto",
    )
    apagarArquivo(foto.uri) // a original, grande, não é mais necessária
    apagarArquivo(ultimaFoto)
    ultimaFoto = reduzida.uri
    return reduzida.uri
}

export function lerUltimaFoto() {
    return ultimaFoto
}

export function descartarFotos() {
    apagarArquivo(ultimaFoto)
    ultimaFoto = null
}
