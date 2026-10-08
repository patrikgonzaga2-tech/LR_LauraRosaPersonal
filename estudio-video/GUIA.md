# Estúdio de Vídeo da Laura — guia do zero ao primeiro vídeo

Transforma um roteiro em um vídeo 9:16 pronto para anúncio: a **foto da Laura** vira um avatar que fala com a **voz dela** (clonada), com cortes, texto na tela, legenda e volume certo para Reels.

```
roteiro ─► revisão ─► prévia grátis ─► SUA APROVAÇÃO ─► voz (ElevenLabs) ─► avatar (HeyGen) ─► montagem ─► MP4
```

Siga as partes em ordem. Cada uma diz **onde clicar**, **o que escrever** e **como saber que deu certo**.

| Parte | O quê | Quem faz | Tempo |
|---|---|---|---|
| 0 | Entender o custo | Patrik | 5 min |
| 1 | Criar as contas e pagar | Patrik | 15 min |
| 2 | Pegar as chaves de API | Patrik | 10 min |
| 3 | Configurar o ambiente aqui no Claude | Patrik | 15 min |
| 4 | Autorização, fotos e áudio da Laura | Laura + Patrik | 1 dia |
| 5 | Criar a voz da Laura | Patrik | 10 min |
| 6 | Testar a conexão | Claude | 2 min |
| 7 | Primeiro vídeo | Claude + sua aprovação | 20 min |
| 8 | Próximos vídeos e Meta Ads | Claude + Patrik | — |
| 9 | Problemas comuns | — | — |

---

## Parte 0 — Quanto custa

Preços em dólar, cobrados no cartão internacional (+ IOF). Câmbio usado: **R$ 5,10**. Os preços vieram de fontes de terceiros em out/2026. **Confira na tela de pagamento** antes de assinar.

### O que você assina

| Item | Para quê | Plano | US$ | R$ aprox. |
|---|---|---|---|---|
| ElevenLabs | Clonar a voz e gerar a fala | **Starter**, mensal (30 mil créditos ≈ 30 mil caracteres por mês; inclui clonagem instantânea e API) | 6/mês | ~31/mês |
| HeyGen **API** | Animar a foto falando (Avatar IV) | **Carteira pré-paga** da API (mínimo US$ 5; o saldo vale 12 meses) | 20 (recarga inicial sugerida) | ~102 |
| HeyGen site (Creator/Pro) | Editor web | **Não precisa.** A API é cobrada à parte, e o plano do site não paga a API | 0 | 0 |
| Claude | Este estúdio | Seu plano atual | 0 extra | 0 |

**Primeiro mês: cerca de US$ 26, ou seja, R$ 133 + IOF (≈ R$ 138).**

### Quanto custa cada vídeo

| | Conta | Custo |
|---|---|---|
| Avatar HeyGen (Avatar IV) | ≈ US$ 0,05 por segundo (algumas fontes dizem US$ 0,04) | Vídeo de 40 s ≈ US$ 2 ≈ **R$ 10** |
| Voz ElevenLabs | ≈ 700 caracteres por vídeo | Sai da cota do plano (dá para cerca de 40 vídeos por mês no Starter) |
| Montagem (ffmpeg) | Roda aqui | Grátis |
| Prévia (`--simular`) | Foto parada, sem IA | Grátis |

Os 5 criativos prontos somam cerca de 170 s, ou **≈ US$ 8,50 (R$ 45)**. Com uma refação de cada, cerca de R$ 90. A recarga de US$ 20 cobre isso com folga.

### Opcional, para mais qualidade depois
- **ElevenLabs Creator (US$ 22/mês ≈ R$ 112)**: libera a *Professional Voice Clone*, bem mais parecida com a voz real. Pede cerca de 30 min de áudio da Laura, e ela mesma precisa fazer a verificação no site.
- **Gasto com anúncios no Meta**: é à parte e não está nesta conta.

---

## Parte 1 — Criar as contas e pagar

### 1.1 ElevenLabs (voz)
1. Abra https://elevenlabs.io/app/sign-up
2. Clique em **Sign up with Google** e use a conta do negócio. Pode ser a mesma do Patrik, mas a voz fica nessa conta.
3. Se aparecer um questionário de boas-vindas, pule ou responda "Content creation / Advertising".
4. Abra https://elevenlabs.io/app/subscription (ou: foto de perfil, embaixo à esquerda → **Subscription**).
5. No plano **Starter**, clique em **Subscribe/Upgrade**, informe o cartão e confirme.
6. ✅ Deu certo se, ao voltar para a Subscription, aparecer "Starter" como plano atual.

### 1.2 HeyGen (avatar) — carteira da API
1. Abra https://app.heygen.com/signup e entre com o Google (mesma conta do negócio).
2. Pule o tour inicial e **não** assine plano do site.
3. Abra https://app.heygen.com/settings?nav=API (ou: foto de perfil → **Settings** → aba **API**).
4. Procure a área de **API billing / Add funds / Top up** (o nome pode variar) e adicione **US$ 20**.
   - Tabela de preços da API: https://www.heygen.com/api-pricing
5. ✅ Deu certo se a tela da API mostrar saldo de US$ 20.

---

## Parte 2 — Pegar as chaves de API

> A chave é uma senha. **Nunca cole no chat** nem em arquivo do repositório (ele é **público**). Ela só vai na configuração do ambiente (Parte 3).

### 2.1 Chave da ElevenLabs
1. Abra https://elevenlabs.io/app/settings/api-keys
2. Clique em **Create API Key** (ou **+ Create**).
3. Nome: `estudio-video-laura`.
4. Se aparecerem permissões:
   - **Text to Speech**: *Access*
   - **Voices**: *Read* e *Write*
   - **User**: *Read*
   - O resto, sem acesso.
5. Clique em **Create** e **copie a chave na hora**. Ela só aparece uma vez. Guarde num lugar seguro, como o gerenciador de senhas do Google.

### 2.2 Chave da HeyGen
1. Abra https://app.heygen.com/settings?nav=API
2. Em **API Token**, clique em **Generate** (ou **Copy**, se já existir).
3. Copie e guarde no mesmo lugar seguro.

---

## Parte 3 — Configurar o ambiente aqui no Claude

O "projeto" é este repositório (`LR_LauraRosaPersonal`, pasta `estudio-video/`) rodando num **ambiente de nuvem** do Claude Code. Vamos criar um ambiente só para vídeo, com as chaves e os sites liberados.

Documentação oficial (se algum nome de botão estiver diferente): https://code.claude.com/docs/en/cloud-environments

### 3.1 Abrir as configurações de ambiente
1. Abra https://claude.ai/code
2. Na barra de título de uma sessão (ou na tela inicial), clique no **menu do ambiente de nuvem**, o nome do ambiente com um ícone de nuvem.
3. Clique em **Add environment** (ou **New environment**). Se preferir aproveitar o ambiente atual, clique em **Edit**.

### 3.2 Preencher
- **Name**: `Estúdio Vídeo Laura`
- **Network access**: escolha **Limited** (ou **Custom**, conforme o app). Em **Allowed domains**, adicione um por linha:
  ```
  api.heygen.com
  upload.heygen.com
  *.heygen.ai
  api.elevenlabs.io
  www.figma.com
  ```
  - Mantenha marcada a opção **Allow package managers** (ou "incluir a lista padrão").
  - Se `*.heygen.ai` não for aceito, use `files.heygen.ai`, `resource.heygen.ai` e `resource2.heygen.ai`. Se o primeiro download falhar, o script mostra o domínio exato que falta.
- **Credenciais**: use **uma** das duas formas.
  - **(A) Network secrets / API credentials**, se a tela oferecer. É a mais segura, porque o Claude nunca vê a chave.
    - Host `api.heygen.com`, header `X-Api-Key`, valor = chave da HeyGen.
    - Host `api.elevenlabs.io`, header `xi-api-key`, valor = chave da ElevenLabs.
  - **(B) Environment variables**, em formato `.env`:
    ```
    HEYGEN_API_KEY=cole_aqui_a_chave_da_heygen
    ELEVENLABS_API_KEY=cole_aqui_a_chave_da_elevenlabs
    ```
- **Setup script**: cole exatamente:
  ```bash
  command -v ffmpeg >/dev/null || (apt-get update && apt-get install -y ffmpeg)
  ```
- Clique em **Save**.

### 3.3 Abrir uma sessão nova nesse ambiente
1. Em https://claude.ai/code, clique em **New session**.
2. **Repository**: `patrikgonzaga2-tech/LR_LauraRosaPersonal`.
3. **Branch**: `claude/relaxed-cray-r4bnc9`. É onde o estúdio está até ser mesclado na `main`. Depois de mesclado, use `main`.
4. **Environment**: `Estúdio Vídeo Laura`.
5. ✅ Deu certo se a sessão abrir e a pasta `estudio-video/` existir. A Parte 6 confirma o resto.

---

## Parte 4 — Autorização, fotos e áudio da Laura

### 4.1 Autorização por escrito (antes de tudo)
A IA vai falar com a imagem e a voz da Laura. Peça que ela assine (pode ser por assinatura digital, como gov.br ou DocuSign). Modelo simples; vale passar por um advogado:

> Eu, **Laüra Rosa**, CPF ___, autorizo **[empresa/CNPJ]** a usar minha imagem e a criar e usar uma réplica sintética da minha voz e da minha imagem, geradas por inteligência artificial (ElevenLabs e HeyGen), exclusivamente em anúncios e conteúdos do programa Efeito Lipo 21, pelo prazo de ___ meses. Cada vídeo será aprovado por mim antes da publicação. Posso revogar esta autorização a qualquer momento, por escrito, e as réplicas serão apagadas das plataformas em até 15 dias.
> Local, data e assinatura.

Guarde o PDF assinado **fora** do repositório (Google Drive, por exemplo).

### 4.2 Fotos (uma por cenário)
Como fotografar (celular serve, câmera traseira):
- Vertical (em pé), rosto de frente e olhando para a lente, a cerca de 1,5 m de distância, da cintura para cima.
- Luz natural vindo de frente (de frente para a janela). Sem contraluz.
- **Boca fechada ou sorriso leve.** Gargalhada atrapalha a animação da boca.
- Cabelo e mãos longe do rosto. Sem óculos escuros.
- Fundo conforme o roteiro:

| Arquivo sugerido | Para | Cenário e roupa |
|---|---|---|
| `laura-cozinha.jpg` | criativo-01 | Cozinha real, legging e camiseta |
| `laura-sofa.jpg` | criativo-02 | Sofá, blusa básica, cabelo solto |
| `laura-sala-tapete.jpg` | criativo-03 | Sala com tapete de treino aparecendo, roupa de treino |
| `laura-poltrona.jpg` | criativo-04 | Poltrona ou mesa com xícara, roupa do dia a dia |
| `laura-fundo-claro.jpg` | criativo-05 | Parede clara, roupa laranja ou verde |

> Até as fotos novas chegarem, todos os roteiros usam a foto do site `Laura-Arrumada-hero.jpg`. Ela serve para o teste.

**Como subir as fotos** (vão para uma pasta pública do repositório, então só fotos que poderiam aparecer num anúncio):
1. Renomeie os arquivos como na tabela (sem espaço, sem acento).
2. Abra https://github.com/patrikgonzaga2-tech/LR_LauraRosaPersonal/tree/claude/relaxed-cray-r4bnc9/estudio-video/fotos
3. Clique em **Add file** → **Upload files**.
4. Arraste as fotos.
5. Embaixo, deixe **Commit directly to the `claude/relaxed-cray-r4bnc9` branch** e clique em **Commit changes**.
6. Na sessão do Claude, escreva: `Puxe as fotos novas do GitHub e atualize o campo "foto" de cada roteiro conforme a tabela da Parte 4 do GUIA.`

### 4.3 Áudio para a voz (não vai para o GitHub)
- 1 a 2 minutos de fala corrida. Mais de 3 minutos não ajuda.
- Quarto silencioso, porta e janela fechadas, sem música e sem ventilador. Ambiente com cortina, cama ou roupas absorve eco.
- Celular a cerca de 20 cm da boca, no app **Gravador** (iPhone: Gravador; Android: Gravador de voz).
- Fale no tom dos stories: animada e acolhedora. Uma boa ideia é ler em voz alta os roteiros 01, 02 e 04 (campo `fala` em `estudio-video/roteiros/`). Assim a voz já aprende esse vocabulário.
- A Laura manda o arquivo **como documento** (não como áudio de WhatsApp, que comprime). Você vai usá-lo na Parte 5.

---

## Parte 5 — Criar a voz da Laura (no site da ElevenLabs)

1. Abra https://elevenlabs.io/app/voice-lab (ou: menu lateral → **Voices**).
2. Clique em **+ Create or Clone a Voice** (ou **Add a new voice**) → **Instant Voice Clone**.
3. **Name**: `Laura Rosa`.
4. Arraste o áudio da Parte 4.3. Se houver a opção **Remove background noise**, marque.
5. Marque a declaração de que tem os direitos e o consentimento (é a autorização da Parte 4.1) e clique em **Add Voice / Create**.
6. Teste: na lista **My Voices**, clique na voz, escreva `Oi, eu sou a Laura e esse é o Desafio Efeito Lipo vinte e um.` e ouça. Se soar robótico, refaça com um áudio mais limpo.
7. Pegue o **Voice ID**: na voz, clique em **⋯** → **Copy voice ID** (ou o botão **ID**). É um código como `21m00Tcm4TlvDq8ikWAM`. Ele **não** é senha.
8. Na sessão do Claude, escreva: `O voice ID da Laura na ElevenLabs é COLE_AQUI. Grave no config.json do estúdio.`

> Alternativa sem o site: coloque os áudios em `estudio-video/material/audio/` (pasta fora do git) e peça `Rode o clonar-voz.mjs`.

---

## Parte 6 — Testar a conexão

Na sessão do Claude, escreva:

```
Rode node estudio-video/scripts/checar.mjs e me explique o resultado.
```

✅ Deu certo se aparecer **"Tudo pronto para produzir."**, com:
- `✓ ElevenLabs conectada — plano starter…`
- `✓ Voz da Laura configurada (…)`
- `✓ HeyGen conectada — saldo US$ 20…`

Se aparecer ✗, veja a Parte 9.

---

## Parte 7 — O primeiro vídeo (criativo-04 "Um passo de cada vez")

Escreva na sessão:

```
/video-laura criativo-04
```

(Se o `/` não sugerir o comando, escreva: `Siga a skill video-laura para produzir o criativo-04 do estudio-video.`)

O que vai acontecer:

| Etapa | Quem faz | O que você vê | Custo |
|---|---|---|---|
| 1. Checagem | Claude | Resultado do `checar.mjs` | 0 |
| 2. Revisão | Agente `revisor-anuncio` | Parecer: APROVADO PARA O PATRIK ou AJUSTAR | 0 |
| 3. Roteiro | Claude | A fala inteira, os textos na tela e a legenda | 0 |
| 4. Prévia | Agente `editor-video` | `previa.mp4` (foto parada, mostra cortes e textos) | 0 |
| 5. **Aprovação** | **Você** | Pergunta "Aprovar criativo-04?" com o custo | 0 |
| 6. Voz + avatar | Agente `produtor-video` | Andamento da HeyGen (alguns minutos) | ≈ US$ 2 |
| 7. Montagem | Agente `editor-video` | `final.mp4`, `capa.jpg` e a legenda pronta | 0 |

Na etapa 5, **só responda "sim" se o texto estiver como você quer.** Mudar o texto depois exige gerar voz e avatar de novo, e paga de novo.

Quer mudar algo na prévia? Escreva, por exemplo: `No criativo-04, troca o gancho por "Eu já tentei de tudo de uma vez." e encurta o bloco 2.` O roteirista ajusta, o revisor confere e você vê uma nova prévia (grátis).

---

## Parte 8 — Depois do primeiro vídeo

- **Outros criativos**: `/video-laura criativo-01` (e assim por diante). O criativo-05 cita preço e pede sua aprovação explícita (regra do CLAUDE.md).
- **Criativo novo**: `/video-laura novo: 30 segundos sobre treinar à noite depois que as crianças dormem, foto laura-sofa.jpg`
- **Música**: coloque um MP3 licenciado em `estudio-video/material/musica/` e peça `Remonte o criativo-04 com a música NOME.mp3`.
- **Subir no Meta Ads**: `Suba o final.mp4 do criativo-04 no Meta Ads como anúncio PAUSADO no conjunto X, com a legenda do roteiro e destino o quiz.` Nada é ativado sem você.
- **Cuidados com o Meta**:
  - O Meta pode marcar conteúdo realista feito com IA. Confira as regras de divulgação de IA do Meta na hora de subir.
  - A página do quiz ainda fala em "perder até 8kg" (tela de resultado e introdução) e mostra antes e depois. Isso aumenta o risco de reprovação, e quem vem de um anúncio suave pode estranhar.

---

## Parte 9 — Problemas comuns

| Mensagem | Causa | O que fazer |
|---|---|---|
| `sem conexão (fetch failed)` / `ENOTFOUND` | Domínio não liberado | Parte 3.2, Allowed domains. Depois abra uma **sessão nova** |
| `HTTP 401 (chave ausente ou inválida)` | Chave errada ou não salva | Gere outra chave (Parte 2) e atualize o ambiente (Parte 3.2) |
| `HTTP 402/429 (sem créditos…)` | Saldo HeyGen ou cota ElevenLabs acabou | Recarregue a carteira (1.2) ou espere a renovação mensal |
| `está com status "rascunho"` | Roteiro não aprovado | Normal: aprove na etapa 5 do `/video-laura` |
| `Libere o domínio "X"` | O vídeo pronto vem de outro domínio | Adicione exatamente esse domínio em Allowed domains e rode só o `gerar-avatar.mjs` de novo |
| `formato "objeto" recusado` | A HeyGen mudou o formato da API | O script tenta o outro formato sozinho. Se os dois falharem, peça ao Claude para olhar a documentação v3 |
| Boca estranha no avatar | Foto com boca aberta ou de lado | Foto nova seguindo a Parte 4.2 |
| Voz com sotaque estranho | Áudio de clonagem ruim | Regrave (Parte 4.3) ou teste `"model_id": "eleven_v3"` no config.json |

> **Data importante**: a HeyGen desliga as rotas antigas (v1/v2) em **31/10/2026**. O estúdio já usa só a **v3**.

---

## Referência rápida

- **Agentes** (`.claude/agents/`): `roteirista-video`, `revisor-anuncio`, `produtor-video`, `editor-video`.
- **Comando** (`.claude/skills/video-laura/`): `/video-laura <id>`.
- **Scripts** (`estudio-video/scripts/`), rodar sempre a partir da raiz do repositório:
  - `checar.mjs`: confere tudo (grátis).
  - `montar.mjs <id> --simular`: prévia grátis.
  - `gerar-voz.mjs <id>`: voz (cota ElevenLabs).
  - `gerar-avatar.mjs <id>`: avatar (carteira HeyGen).
  - `montar.mjs <id>`: vídeo final.
  - `clonar-voz.mjs`: alternativa à Parte 5.
- **Configuração**: `estudio-video/config.json`. Tem voice ID, modelo de voz, resolução, zoom, posição do texto e custo por segundo; nada secreto.
- **Saídas**: `estudio-video/saida/<id>/`, fora do git.
