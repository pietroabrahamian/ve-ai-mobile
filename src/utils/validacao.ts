// Regras do cadastro e do login (guia 4.1 e 4.2)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ErrosFormulario = Record<string, string | undefined>

export function validarLogin(email: string, senha: string): ErrosFormulario {
    const e = email.trim()
    return {
        email: !e ? "Informe seu e-mail." : !EMAIL.test(e) ? "E-mail inválido." : undefined,
        senha: !senha ? "Informe sua senha." : undefined,
    }
}

export function validarCadastro(
    nome: string,
    email: string,
    senha: string,
    confirmacao: string,
): ErrosFormulario {
    const n = nome.trim()
    const e = email.trim()
    let erroEmail: string | undefined
    if (!e) erroEmail = "Informe seu e-mail."
    else if (!EMAIL.test(e)) erroEmail = "Informe um e-mail válido."
    else if (e.length > 160) erroEmail = "Use no máximo 160 caracteres."

    let erroSenha: string | undefined
    if (senha.length < 8) erroSenha = "A senha precisa ter pelo menos 8 caracteres."
    else if (senha.length > 72) erroSenha = "A senha pode ter no máximo 72 caracteres."

    return {
        nome: !n ? "Informe seu nome." : n.length > 120 ? "Use no máximo 120 caracteres." : undefined,
        email: erroEmail,
        senha: erroSenha,
        confirmacao: !confirmacao || confirmacao !== senha ? "As senhas não são iguais." : undefined,
    }
}

export function contarErros(erros: ErrosFormulario) {
    return Object.values(erros).filter(Boolean).length
}
