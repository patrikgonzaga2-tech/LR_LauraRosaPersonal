# Guia de conexões: Instagram, referências e vídeos

O que falta ligar para a aba **Referência** e a aba **Roteiros da Laura** do painel funcionarem por completo: ver o alcance real do Instagram, editar os reels que a Laura já postou e os vídeos do Drive, trazer o vídeo dos anúncios concorrentes e gerar vídeo com avatar.

Siga as partes em ordem. Cada uma diz **onde clicar**, **o que escrever** e **como saber que deu certo**.

| Parte | O quê | Libera | Quem faz | Tempo |
|---|---|---|---|---|
| 0 | Entender o que já funciona | — | Patrik | 2 min |
| 1 | Insights do Instagram (Metricool) | Alcance, visualizações, salvamentos e seguidores | Patrik | 15 min |
| 2 | Liberar a rede | Cortar os reels da Laura, usar os vídeos do Drive, ver o vídeo dos concorrentes | Patrik | 10 min |
| 3 | Avatar e voz (HeyGen + ElevenLabs) | Vídeo com a Laura falando sem ela gravar | Patrik | 40 min |
| 4 | Testar | — | Claude | 5 min |

---

## Parte 0: o que já funciona hoje, sem fazer nada

| Já funciona | De onde vem |
|---|---|
| Posts da Laura com curtidas, comentários, legenda, duração e link | Conector do Meta (conta de anúncios 1094091162588572) |
| Anúncios concorrentes: página, título, há quantos dias no ar, quantas versões e link | Biblioteca de Anúncios (conector do Meta) |
| Fotos e vídeos curtos montados com as fotos da Laura, com botão **Baixar** | Feito aqui (Playwright + ffmpeg) |
| Roteiros com texto completo para a Laura gravar | Feito aqui, com os dados do quiz |

**O que não funciona sem as partes abaixo:**
- **Alcance:** curtida não mostra quantas pessoas viram o post nem se ele foi impulsionado.
- **Vídeos:** a rede deste ambiente bloqueia o Instagram, o Facebook e o Google Drive. Por isso não dá para baixar os reels nem os vídeos do Drive.
- **Avatar e voz:** a HeyGen e a ElevenLabs também estão bloqueadas.

---

## Parte 1: Insights do Instagram (Metricool)

### Por que Metricool, e não a mLabs
- **A mLabs não se conecta ao Claude.** Ela não tem conector nem API pública. O relatório dela só sai em PDF, e isso só no plano Completo. Se a Laura usa a mLabs para agendar posts, ela pode continuar usando. O Metricool entra só para o Claude **ler** os números.
- **O Metricool tem conector oficial para o Claude** e funciona no **plano grátis**. O plano grátis cobre 1 marca, 1 perfil de Instagram e cerca de 30 dias de histórico. Confira esses limites na tela de cadastro.

### 1.1 Criar a conta (grátis)
1. Abra https://metricool.com e clique em **Começar grátis** (ou **Sign up**).
2. Entre com a conta Google **patrikgonzaga2@gmail.com**.
3. Quando pedir o nome da marca, escreva `Laura Rosa`.

### 1.2 Conectar o Instagram da Laura
1. Dentro da marca, clique em **Conectar** no quadro do **Instagram**.
2. Entre com o **Facebook** que administra a página ligada ao @laurarosapersonal.
   - O Instagram precisa ser **conta profissional** ligada a uma página do Facebook. Ele já é, porque já aparece na conta de anúncios.
3. Marque **todas** as permissões que aparecerem, principalmente as de **insights** e de **leitura de publicações**.
4. ✅ **Deu certo se** a aba de Instagram do Metricool mostrar **alcance** e **visualizações** dos reels. Os números podem levar algumas horas para aparecer.

### 1.3 Ligar o Metricool no Claude
1. Abra https://claude.ai/customize/connectors
2. Procure **Metricool** e clique em **Conectar**. Faça login com a mesma conta do Metricool.
   - Se ele não aparecer na lista, clique em **Adicionar conector personalizado** e cole: `https://ai.metricool.com/mcp`
3. ✅ **Deu certo se** o Metricool aparecer como **Conectado**.

### 1.4 Ligar o Metricool na rotina das 7h
A rotina que responde ao botão **BUSCAR REFERÊNCIAS** só usa os conectores que estão marcados nela.
1. Em https://claude.ai/code abra **Rotinas** (Routines).
2. Abra **"Painel de anúncios — análise diária e pedidos"** e clique em **Editar**.
3. Em **Conectores**, adicione **Metricool** e clique em **Salvar**. O nome dos botões pode variar um pouco.
4. ✅ **Deu certo se** o Metricool aparecer na lista de conectores da rotina, junto com META-ADS, Supabase, Google-Drive, Gmail e UMCLIQUE.

> Conectores só valem em **sessão nova**. Depois de conectar, a próxima busca já usa o Metricool.

---

## Parte 2: Liberar a rede

Sem isso, o Claude **vê** os links, mas não consegue **baixar** os vídeos.

### 2.1 Abrir as configurações do ambiente
1. Abra https://claude.ai/code
2. Na barra de título de uma sessão, clique no **menu do ambiente de nuvem** (o nome do ambiente, com um ícone de nuvem) e depois em **Edit**.
   - Edite o ambiente que esta sessão usa. A rotina das 7h roda nesse mesmo ambiente, então uma edição vale para as duas.
3. Documentação oficial, caso algum botão tenha outro nome: https://code.claude.com/docs/en/cloud-environments#network-access

### 2.2 Adicionar os sites
Em **Network access**, escolha **Limited** (ou **Custom**, conforme o app). Em **Allowed domains**, adicione um por linha:

```
*.cdninstagram.com
*.fbcdn.net
www.facebook.com
facebook.com
www.instagram.com
drive.usercontent.google.com
drive.google.com
```

- Deixe marcada a opção **Allow package managers** (ou "incluir a lista padrão").
- Clique em **Save**.

| Site | Para quê |
|---|---|
| `*.cdninstagram.com` e `www.instagram.com` | Baixar os reels que a Laura já postou, para cortar em versões de anúncio |
| `*.fbcdn.net`, `www.facebook.com` e `facebook.com` | Abrir o anúncio do concorrente na Biblioteca e trazer o vídeo para a aba Referência. É **só para referência**: o vídeo de concorrente nunca é reaproveitado |
| `drive.usercontent.google.com` e `drive.google.com` | Baixar os vídeos que a Laura manda para o Drive (veja 2.3) |

### 2.3 Vídeos do Drive (opcional, mas necessário para editar o que a Laura gravar)
O conector do Drive **lê a lista** de arquivos, mas não baixa vídeo grande (os da pasta LAURA IA CLAUDE têm de 9 a 335 MB). Para o Claude baixar, a pasta precisa estar compartilhada **por link, só para ver**:
1. No Drive, clique com o botão direito na pasta **LAURA IA CLAUDE** e escolha **Compartilhar**.
2. Em **Acesso geral**, escolha **Qualquer pessoa com o link** e deixe como **Leitor**. **Nunca** escolha Editor.
3. Clique em **Concluído**.

> **Atenção:** quem tiver o link consegue ver os vídeos. O link é longo e impossível de adivinhar, mas não o mande para ninguém. Se preferir não compartilhar, a alternativa é a Laura mandar os vídeos já cortados (até 20 MB cada) e você subir pelo painel.
>
> **Lembrete antigo:** a pasta **LAURA FOTOS** está como "qualquer pessoa com o link pode **editar**". Troque para **Leitor** ou **Restrito**.

### 2.4 Abrir uma sessão nova
A rede só muda em **sessão nova**.
✅ **Deu certo se** a Parte 4 mostrar "Instagram ok" e "Facebook ok".

---

## Parte 3: Avatar e voz da Laura (HeyGen + ElevenLabs)

Já existe um guia completo para isso: [`estudio-video/GUIA.md`](../estudio-video/GUIA.md).
- **Parte 0:** custo. O primeiro mês sai por cerca de **R$ 138**, e cada vídeo de 40 s custa uns **R$ 10**.
- **Partes 1 e 2:** criar as contas e pegar as chaves.
- **Parte 3:** colocar as chaves e liberar `api.heygen.com`, `upload.heygen.com`, `*.heygen.ai` e `api.elevenlabs.io` na rede. É a mesma tela da Parte 2 deste guia, então dá para fazer tudo de uma vez.

> Hoje esses dois sites estão **bloqueados** na rede deste ambiente. Só colocar as chaves não basta: é preciso liberar os sites também.

---

## Parte 4: Testar

Abra uma **sessão nova** com este repositório e escreva:

```
Teste as conexões da aba Referência (docs/GUIA_CONEXOES.md, Parte 4)
```

O Claude confere:

| Teste | Deu certo se |
|---|---|
| Metricool | Lista o alcance dos últimos posts da Laura |
| Instagram | Baixa 1 reel da Laura (o de 29/09) e mostra a duração |
| Facebook | Abre 1 anúncio da Biblioteca e tira um print |
| Drive | Baixa o menor vídeo da pasta LAURA IA CLAUDE (9 MB) |
| HeyGen / ElevenLabs | `node estudio-video/scripts/checar.mjs` responde ok |

Depois disso, o botão **BUSCAR REFERÊNCIAS** do painel passa a:
- ordenar os posts por **alcance e salvamentos** (Metricool), não só por curtidas;
- **cortar os reels** da Laura em versões de anúncio de 10 a 15 s, com **Baixar**;
- mostrar o **vídeo** dos anúncios concorrentes que estão há mais tempo no ar;
- editar os vídeos que a Laura gravar a partir da aba **Roteiros da Laura**.

---

## Problemas comuns

| Mensagem | O que é | O que fazer |
|---|---|---|
| `403` / `connect_rejected` / `000` | Site não liberado | Parte 2.2. Depois, abra uma **sessão nova** |
| Metricool "não conectado" na rotina | O conector não foi marcado na rotina | Parte 1.4 |
| Drive `404` ou página de login | A pasta não está compartilhada por link | Parte 2.3 |
| Instagram sem alcance no Metricool | A conta conectada não é profissional ou faltou permissão | Refaça a Parte 1.2 marcando todas as permissões |
