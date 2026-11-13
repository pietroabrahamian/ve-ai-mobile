// UUID v4 para o cabeçalho Idempotency-Key do relato (guia 10.2).
// Math.random basta aqui: a chave só evita duplicar o mesmo envio, não é um segredo.
export function gerarUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
    })
}
