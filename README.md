# Vê AI · App mobile

> **Enxergue além.** Assistente em português para pessoas **cegas ou com baixa visão**: descreve o ambiente por áudio e transforma as barreiras de acessibilidade do caminho em relatos para a rede de apoio.

Entrega de **Mobile Application Development** da **Global Solution 2026/2 da FIAP** (tema **CitizenTech**), turma 2TDS.

|                                        |                                                                |
| -------------------------------------- | -------------------------------------------------------------- |
| Vídeo de demonstração (até 5 min)      | _adicionar o link do YouTube_                                  |
| Publicação (Firebase App Distribution) | _adicionar o link do release_                                  |
| API (Java, Azure, HTTPS)               | https://561413-veai-java-api.azurewebsites.net                 |
| Swagger da API                         | https://561413-veai-java-api.azurewebsites.net/swagger-ui.html |
| Repositório da API Java                | https://github.com/lgaxd/ve-ai-api-java                        |

## Integrantes

| Nome                             | RM     | Parte na GS              |
| -------------------------------- | ------ | ------------------------ |
| Pietro Ferreira Gomes Abrahamian | 561469 | Mobile                   |
| Lucas Grillo Alcântara           | 561413 | API Java, banco e DevOps |
| Lucca Ramos Mussumecci           | 562027 | API .NET e QA            |
| Pedro Peres Benitez              | 561792 | IA                       |

## O problema e a solução

Uma pessoa com deficiência visual que anda sozinha pela cidade enfrenta dois problemas: **não sabe o que está à sua frente** (um poste no meio da calçada, uma obra sem sinalização) e **as barreiras que encontra não chegam a quem pode resolvê-las**.

O Vê AI ataca os dois:

1. **Descrição do ambiente (modo automático, o padrão).** Com o celular preso no peito, o app tira uma foto a cada 15 s (ajustável para 10, 15, 20 ou 30 s), envia para a API e **fala em voz alta** uma frase que começa pelos perigos, com direção e distância. Quando a cena não muda, a frase é uma confirmação curta ("o poste continua à sua frente"). O **modo manual** (a pessoa toca para tirar cada foto) fica em Perfil → Modo de descrição. Há também **Ler texto** (placas, cardápios, remédios) e a **pergunta livre** sobre a última foto.
2. **Relatos para a rede de apoio.** Quando a IA reconhece uma barreira permanente, o app pergunta se a pessoa quer avisar a rede de apoio. O relato vai com o GPS para o **gestor** da região (técnico de ONG ou CRAS), que faz a triagem e encaminha ao órgão público. Relatos iguais a até 30 m viram **+1 apoio**, e o cidadão é notificado a cada mudança de status.

**ODS:** 3 (saúde e bem-estar), 9 (inovação e infraestrutura), 10 (redução das desigualdades) e 11 (cidades sustentáveis e inclusivas).

## Telas

| Área           | Telas                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação   | Login, Cadastro                                                                                                                                                                                       |
| Cidadão (abas) | Início, Histórico, Relatos, Perfil                                                                                                                                                                    |
| Cidadão        | Descrever (automático e manual), Resultado/detalhe da descrição, Novo relato (também edição), Relato enviado (3 resultados: criado, apoio registrado, já registrado), Detalhe do relato, Notificações |
| Gestor (abas)  | Fila de relatos, Avisos, Perfil                                                                                                                                                                       |
| Gestor         | Análise do relato (mapa, norma NBR 9050, prioridade, histórico e mudança de status)                                                                                                                   |
| Todos          | Sobre o App (versão, **hash do commit**, status da API e da IA)                                                                                                                                       |

## CRUD com a API

Todos os dados ficam na API (nada fica só no aparelho, a não ser as preferências de uso local):

| Recurso                     | Create                                  | Read                                              | Update                                                           | Delete                    |
| --------------------------- | --------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- | ------------------------- |
| Relatos                     | `POST /relatos` (com `Idempotency-Key`) | `GET /relatos/meus`, `GET /relatos/{id}`          | `PUT /relatos/{id}`                                              | `DELETE /relatos/{id}`    |
| Descrições                  | `POST /descricoes` (foto)               | `GET /descricoes`, `GET /descricoes/{id}`         | `PATCH /descricoes/{id}/avaliacao`                               | `DELETE /descricoes/{id}` |
| Status do relato (gestor)   |                                         | `GET /gestor/relatos`, `/{id}`, `/{id}/historico` | `PATCH /gestor/relatos/{id}/status`                              |                           |
| Preferências e notificações |                                         | `GET /usuarios/me`, `GET /notificacoes`           | `PUT /usuarios/me/preferencias`, `PATCH /notificacoes/{id}/lida` |                           |

Toda chamada tem indicador de carregamento, estado de erro com "Tentar de novo" e a mensagem da API mostrada **e falada** (a API devolve mensagens em português, escritas para serem lidas em voz alta). Erros de formulário (400) marcam o campo certo.

## Autenticação

- Cadastro e login reais pela API Java (`/auth/registrar` e `/auth/login`). A disciplina permite Firebase Authentication **ou** a API; usamos a API, com JWT.
- O token e a data de expiração ficam no **`expo-secure-store`**, criptografado (aula 1). Nunca no AsyncStorage.
- A API não tem refresh token: o app usa o `expiraEm` do login. Ao abrir com o token vencido, vai direto ao login; nos 15 minutos finais mostra um aviso calmo na Início; qualquer 401 encerra a sessão.
- Logout com confirmação: apaga o token, limpa o cache do TanStack Query e a última foto.
- Rotas protegidas por papel: `(cidadao)` só para CIDADAO e `(gestor)` só para GESTOR. O botão voltar não reabre a área logada depois do logout.
- `AuthContext` enxuto: só guarda o estado e expõe `entrar`/`sair`. HTTP em `src/api`, armazenamento em `src/services/armazenamento.ts`, expiração no hook `useSessao`.

## Contas de teste

Senha de todas: `Veai@2026`

| Papel   | E-mail                       | Regiões        |
| ------- | ---------------------------- | -------------- |
| Cidadã  | `ana.souza@veai.dev`         |                |
| Gestora | `marina.alves@ong-veai.dev`  | Pinheiros e Sé |
| Gestor  | `rafael.costa@cras-veai.dev` | Vila Mariana   |

O cadastro do app cria contas de cidadão. Gestores existem só pelo seed da API.

## Como rodar

Pré-requisitos: Node 20 ou mais novo e o app **Expo Go** (SDK 58) no celular, ou um emulador Android.

```bash
npm install
cp .env.example .env
npx expo start
```

No `.env`, `EXPO_PUBLIC_API_URL` aponta para a API. Na versão publicada é sempre **HTTPS** (a URL da Azure acima). HTTP só para a API local durante o desenvolvimento (`http://10.0.2.2:8080` no emulador).

| Script              | O que faz                          |
| ------------------- | ---------------------------------- |
| `npm start`         | abre o Metro (Expo)                |
| `npm run lint`      | ESLint em todo o projeto           |
| `npm run format`    | formata com o Prettier             |
| `npm run typecheck` | checagem de tipos (`tsc --noEmit`) |

## Build e publicação (aula 7)

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform android --profile preview
firebase appdistribution:distribute veai.apk --app <FIREBASE_APP_ID> --groups testadores --release-notes "Vê AI <hash do commit>"
```

- `eas.json` tem os perfis `preview` (`.apk`, para o Firebase App Distribution) e `production` (`.aab`). A URL HTTPS da API vai no `env` de cada perfil.
- A tela **Sobre o App** mostra o hash do commit: localmente vem de `git rev-parse --short HEAD`; no EAS Build, da variável `EAS_BUILD_GIT_COMMIT_HASH`. Assim a versão publicada corresponde ao commit do código entregue.

## Arquitetura de pastas

```
app/                      rotas (Expo Router): cada arquivo é uma tela
  _layout.tsx             fontes, providers (TanStack Query, sessão, preferências) e avisos
  index.tsx               porta de entrada: login ou área do papel
  (auth)/                 login e cadastro (quem já está logado não entra)
  (cidadao)/              rotas protegidas do cidadão
    (abas)/               Início, Histórico, Relatos, Perfil
    descrever.tsx, descricao/[id].tsx, relato/…, notificacoes.tsx
  (gestor)/               rotas protegidas do gestor
    (abas)/               Fila, Avisos, Perfil
    analise/[id].tsx
  sobre.tsx               Sobre o App (hash do commit)
src/
  api/                    cliente Axios com interceptors, erros (ErroApi) e uma função por endpoint
  types/                  tipos do contrato da API
  contexts/               AuthContext (só estado) e PreferenciasContext
  hooks/                  useSessao, useLoopAutomatico, useLocalizacao
    queries/              hooks do TanStack Query (useQuery/useMutation) por recurso
  services/               fala e vibração, câmera, armazenamento
  components/             componentes visuais, sem chamada de API
  theme/                  cores, fontes, raios e alvos de toque
  utils/                  datas (UTC → São Paulo), textos falados, validação, UUID
assets/images/            ícone, ícone adaptativo e splash (gerados do logo)
```

Regras: componentes não chamam a API; telas usam hooks e serviços; nomes em português, iguais aos do domínio (relato, descrição, gravidade…); nenhum `any` (regra do ESLint).

## Bibliotecas e por que cada uma

| Biblioteca                                                                                                                     | Por quê                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `expo`, `react-native`, `react`                                                                                                | Base do app (Expo SDK 58).                                                                                                               |
| `expo-router`                                                                                                                  | Navegação por arquivos, com grupos de rota protegidos por papel.                                                                         |
| `axios`                                                                                                                        | Cliente HTTP com interceptors: põe o `Authorization: Bearer` e trata o 401 em um lugar só.                                               |
| `@tanstack/react-query`                                                                                                        | Cache, loaders, erros e paginação infinita das telas (aula 8).                                                                           |
| `expo-secure-store`                                                                                                            | Guarda o JWT criptografado (aula 1).                                                                                                     |
| `@react-native-async-storage/async-storage`                                                                                    | Só as preferências locais (modo, intervalo, sons, vibração).                                                                             |
| `expo-location`                                                                                                                | GPS do relato, com geocodificação reversa do endereço (aula 6).                                                                          |
| `react-native-maps`                                                                                                            | Mapa com o ponto do relato no detalhe e na análise do gestor (aula 6).                                                                   |
| `expo-camera`                                                                                                                  | Foto do ambiente, no modo automático e no manual. ¹                                                                                      |
| `expo-image-manipulator`                                                                                                       | Reduz a foto para 1024 px em JPEG 0,7 antes de enviar (100 a 250 KB). ¹                                                                  |
| `expo-file-system`                                                                                                             | Anexa a foto ao envio (o `fetch` do Expo SDK 58 exige um `File`) e apaga a foto temporária anterior, para nenhuma foto ficar guardada. ¹ |
| `expo-speech`                                                                                                                  | Fala as descrições em pt-BR com a velocidade escolhida no perfil. Usa o motor de voz do próprio aparelho. ¹                              |
| `expo-haptics`                                                                                                                 | Vibração de aviso (novidade, pergunta, erro) e vibração forte para perigo a cerca de 1 metro. ¹                                          |
| `expo-keep-awake`                                                                                                              | Mantém a tela ligada enquanto o modo automático roda. ¹                                                                                  |
| `expo-font`, `@expo-google-fonts/lexend`, `@expo-google-fonts/atkinson-hyperlegible`                                           | Fontes do app. **Atkinson Hyperlegible** foi criada pelo **Braille Institute** para facilitar a leitura de quem tem baixa visão.         |
| `react-native-svg`                                                                                                             | Logo, faixas decorativas e ícones desenhados da tela Início.                                                                             |
| `@expo/vector-icons`                                                                                                           | Ícones (Ionicons e MaterialCommunityIcons).                                                                                              |
| `expo-constants`                                                                                                               | Lê a versão e o hash do commit para a tela Sobre.                                                                                        |
| `expo-splash-screen`, `expo-status-bar`, `expo-linking`, `react-native-screens`, `react-native-safe-area-context`, `react-dom` | Dependências do Expo e do Expo Router.                                                                                                   |
| `eslint`, `eslint-config-expo`, `prettier`, `eslint-config-prettier`                                                           | Qualidade: o ESLint acha erros e o Prettier padroniza a formatação.                                                                      |

¹ Vão além das aulas por serem **necessárias para o público com deficiência visual**: sem câmera, fala, vibração e tela ligada, o app não cumpre o que promete. Todas são módulos oficiais do Expo e rodam no Expo Go.

Sem biblioteca extra para gradiente, sombra ou painel: o React Native 0.88 desenha gradiente e sombra pelo estilo (`backgroundImage`, `boxShadow`) e o painel inferior usa o `Modal` nativo.

## Acessibilidade

- Pensado para uso com **TalkBack/VoiceOver**: todos os controles têm `accessibilityRole` e `accessibilityLabel`; os cards são lidos como um botão só; os seletores anunciam a opção marcada; os interruptores falam "ligado/desligado"; o status é falado como o guia da API pede ("aguardando análise").
- **Contraste alto** (azul-marinho `#0A1430` e amarelo `#FFC81E`) e **alvos de toque de 64 dp** nas ações principais (o guia do Android pede 48).
- **Perigos primeiro** em toda descrição. O app **nunca diz que o caminho está livre** quando a API falha: sem resposta, avisa a dificuldade de conexão (só na 3ª falha seguida, para não virar ruído).
- A fala usa uma fila única: novidade interrompe a fala anterior; confirmação é descartada se ainda houver fala tocando. Com o leitor de tela ligado, as mensagens curtas vão para ele, para não falar por cima.
- O texto respeita o tamanho de fonte escolhido no sistema.
- Ditado sem biblioteca extra: os campos de texto usam o microfone do próprio teclado.

## Privacidade

- Nenhuma foto vai para a galeria nem fica guardada: o app mantém só a última em memória (para a pergunta livre) e apaga o arquivo anterior a cada nova captura. A API guarda só o texto.
- O GPS só é enviado no relato, depois que a pessoa confirma.

## Uso de IA (declaração)

- **Claude (Anthropic), pelo Claude Code:** apoio na escrita e na revisão do código do app, na depuração (por exemplo, o envio de fotos com o `fetch` do Expo SDK 58), na geração do ícone a partir do logo e na redação deste README. Todo o código foi revisado, executado e testado no emulador e no celular pelo integrante responsável.
- **OpenAI GPT (na API do Vê AI):** é a IA do produto, que descreve as fotos. Fica no backend, não no app.
- _Completar com outras ferramentas que o grupo tenha usado._
