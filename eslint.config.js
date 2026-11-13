// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")
// Desliga as regras de estilo que brigam com o Prettier: o Prettier formata, o ESLint acha erros
const prettierConfig = require("eslint-config-prettier/flat")

module.exports = defineConfig([
    expoConfig,
    prettierConfig,
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            // Nenhum `any` no código (a única exceção é o arquivo do multipart, comentada)
            "@typescript-eslint/no-explicit-any": "error",
        },
    },
    { ignores: ["dist/*", ".expo/*", "node_modules/*"] },
])
