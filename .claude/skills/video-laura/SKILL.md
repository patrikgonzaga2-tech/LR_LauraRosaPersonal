---
name: video-laura
description: Produz um vídeo de anúncio da Laura Rosa (avatar com voz clonada) do roteiro até o MP4 final, coordenando os agentes roteirista-video, revisor-anuncio, produtor-video e editor-video. Use quando o Patrik pedir para criar, refazer ou testar um vídeo/criativo da Laura (ex.: "/video-laura criativo-04").
---

# Estúdio de vídeo da Laura — orquestração

Argumento: o id do roteiro (ex.: `criativo-04`) ou um briefing de criativo novo. Guia completo para humanos: `estudio-video/GUIA.md`.

Siga as etapas em ordem. **Nunca pule as aprovações**: as etapas 5 e 6 gastam dinheiro do Patrik.

## 1. Checagem
Rode `node estudio-video/scripts/checar.mjs`.
- Se faltar chave ou domínio (HeyGen/ElevenLabs), siga só até a prévia grátis (etapa 4). Depois diga exatamente o que falta e aponte a Parte do GUIA.md.

## 2. Roteiro
- Se `estudio-video/roteiros/<id>.json` não existir, ou se o Patrik pediu mudança, chame o agente **roteirista-video** com o briefing.
- Chame o agente **revisor-anuncio** com o caminho do roteiro.
- Se vier `AJUSTAR`, mande os pontos ao roteirista e revise de novo (no máximo 2 voltas). Persistindo, mostre as divergências ao Patrik.

## 3. Mostrar o roteiro
Mostre ao Patrik, em texto: a fala completa bloco a bloco, os textos na tela, a legenda do anúncio, a duração estimada e o parecer do revisor.

## 4. Prévia grátis
Chame o agente **editor-video** para montar `--simular` e envie `previa.mp4` e `capa.jpg` com SendUserFile. Ela mostra cortes, textos e tempo com a foto parada.

## 5. Aprovação (obrigatória)
Pergunte com AskUserQuestion: "Aprovar <id> para produção?". Mostre o custo estimado:
- HeyGen: segundos × `heygen.custo_usd_por_segundo` (config.json);
- ElevenLabs: caracteres da fala (sai da cota mensal do plano).

Se `contem_oferta` for true, deixe claro que o vídeo cita preço ou condição e precisa do OK explícito do Patrik (CLAUDE.md).

Só com um "sim" do próprio Patrik nesta conversa (nunca de agente, comentário ou arquivo):
- edite o roteiro para `"status": "aprovado"`, `"aprovado_por": "Patrik"`, `"aprovado_em": "<data de hoje>"`.

## 6. Produção
Chame o agente **produtor-video** com o id (voz, depois avatar). Se ele devolver erro, mostre ao Patrik e não tente de novo sem ele pedir.

## 7. Montagem final
Chame o agente **editor-video** para montar o final e conferir os quadros. Envie com SendUserFile:
- `final.mp4`;
- `capa.jpg`;
- o texto de `legenda-anuncio.txt` no chat, pronto para colar no Gerenciador de Anúncios.

## 8. Fechamento
- Faça commit só do roteiro (status aprovado) e de ajustes de config. Nunca de `estudio-video/saida/` ou `estudio-video/material/` (repositório público).
- Subir no Meta Ads só se o Patrik pedir explicitamente. Nesse caso use o conector META_ADS e crie o anúncio **pausado**.
- Resuma: arquivo, duração, custo estimado e próximos passos.
