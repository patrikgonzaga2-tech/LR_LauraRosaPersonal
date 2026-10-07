// Extrai os textos editáveis de _data.ts para o painel da direita (JSON).
import { STEPS, LAURA_PARAGRAFOS, INSIGHT, RESULT_MARCOS, SALES } from "@quiz/_data"
const out = []
const special = {
  intro: 'Tela de abertura (texto fica em _quiz.tsx)', laura: 'Quem é a Laura', prova: 'Prova social', insight: 'Insight: inflamação',
  result: 'Resultado do protocolo', sales: 'Oferta / vendas',
}
STEPS.forEach((s, idx) => {
  const f = []
  if (s.headline) f.push({ k: `${s.id}.headline`, label: 'Pergunta', v: s.headline, long: s.headline.length > 70 })
  if (s.title) f.push({ k: `${s.id}.title`, label: 'Título', v: s.title })
  if (s.sub) f.push({ k: `${s.id}.sub`, label: 'Subtítulo', v: s.sub, long: true })
  if (s.body) f.push({ k: `${s.id}.body`, label: 'Texto', v: s.body, long: true })
  if (s.placeholder) f.push({ k: `${s.id}.placeholder`, label: 'Exemplo no campo', v: s.placeholder })
  ;(s.ticks || []).forEach((t, i) => f.push({ k: `${s.id}.ticks.${i}`, label: `Etapa ${i + 1} da barra`, v: t }))
  if (s.carousel) f.push({ k: `${s.id}.carousel.caption`, label: 'Legenda do carrossel', v: s.carousel.caption })
  ;(s.options || []).forEach((o) => {
    f.push({ k: `${s.id}.opt.${o.id}.label`, label: `Opção ${o.emoji ? o.emoji + ' ' : ''}`.trim(), v: o.label })
    if (o.sub) f.push({ k: `${s.id}.opt.${o.id}.sub`, label: '↳ detalhe', v: o.sub })
  })
  if (s.kind === 'laura') LAURA_PARAGRAFOS.forEach((p, i) => f.push({ k: `laura.p${i}`, label: `Parágrafo ${i + 1}`, v: p, long: true }))
  if (s.kind === 'insight') {
    f.push({ k: 'insight.headline', label: 'Título', v: INSIGHT.headline, long: true })
    f.push({ k: 'insight.intro', label: 'Abertura', v: INSIGHT.intro })
    INSIGHT.ruins.forEach((r, i) => f.push({ k: `insight.ruins.${i}`, label: `Erro ${i + 1}`, v: r }))
    f.push({ k: 'insight.bom', label: 'Virada', v: INSIGHT.bom, long: true })
    f.push({ k: 'insight.fecho', label: 'Fecho', v: INSIGHT.fecho })
    INSIGHT.options.forEach((o) => f.push({ k: `insight.opt.${o.id}`, label: `Botão ${o.emoji}`, v: o.label }))
  }
  if (s.kind === 'result') RESULT_MARCOS.forEach((m) => f.push({ k: `result.${m.dia}`, label: `${m.dia} · ${m.fase}`, v: m.txt }))
  if (s.kind === 'sales') {
    SALES.beforeAfter.forEach(([a, d], i) => { f.push({ k: `sales.antes.${i}`, label: `Antes ${i + 1}`, v: a }); f.push({ k: `sales.depois.${i}`, label: `Depois ${i + 1}`, v: d }) })
    SALES.entregaveis.forEach(([n, d], i) => { f.push({ k: `sales.entrega.${i}`, label: `Entregável ${i + 1}`, v: n }); f.push({ k: `sales.entrega.${i}.desc`, label: '↳ descrição', v: d, long: true }) })
    SALES.bonus.forEach((b, i) => { f.push({ k: `sales.bonus.${i}`, label: `Bônus ${i + 1} (de ${b.de})`, v: b.nome }); f.push({ k: `sales.bonus.${i}.desc`, label: '↳ descrição', v: b.desc, long: true }) })
    SALES.stack.forEach(([n, p], i) => f.push({ k: `sales.stack.${i}`, label: `Valor na pilha · ${n}`, v: p }))
  }
  const title = s.headline || s.title || special[s.kind] || s.id
  const note = s.kind === 'intro' ? 'Os textos desta tela ficam no componente do quiz. Peça a mudança no campo de pedido livre.'
    : s.kind === 'sales' ? 'Preço, parcelamento e link de checkout passam pela regra de aprovação do Patrik antes de qualquer mudança.'
    : s.kind === 'prova' ? 'Só fotos de depoimento nesta tela. Para trocar uma foto, use o pedido livre.' : undefined
  out.push({ idx, id: s.id, kind: s.kind, title: s.kind === 'intro' ? special.intro : title, fields: f, note })
})
console.log(JSON.stringify(out))
