// RECUPERAR VENDAS — dinheiro que já esteve na mesa:
//  1. Pix/boleto gerado e não pago (todas as origens) → chamar no WhatsApp em até 1 h
//  2. Cartão recusado → oferecer Pix
//  3. Clicou comprar no quiz e não comprou → remarketing / entender o medo
import { QUIZ_NOVO } from '../_config'
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { compras, decUtm, pendentes, perfil, recusados as listaRecusados, sessaoTeste, sessoes, vendasRaw, type Pendente, type Sessao } from '../_lib/dados'
import { brl, brl0, horaBR, int, pct, plural, primeiroNome, telMask, telWa } from '../_lib/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_lib/periodo'
import { Caixa, Grade, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Recuperar vendas — Painel Corpo Feliz', robots: { index: false, follow: false } }

const MEDO: Record<string, string> = { fracasso: 'Não conseguir de novo', tempo: 'Não ter tempo', dinheiro: 'Gastar e não ter resultado', fome: 'Passar fome', rebote: 'Efeito rebote' }
const msg = (nome: string, produto: string, tipo: Pendente['tipo'] | 'recusado') =>
  tipo === 'recusado'
    ? `Oi, ${nome}! Tudo bem? Aqui é da equipe da Laura Rosa. Vi que o cartão não passou na sua compra do ${produto}. Quer que eu te mande o link com Pix para você garantir agora?`
    : tipo === 'atrasada'
      ? `Oi, ${nome}! Tudo bem? Aqui é da equipe da Laura Rosa. A renovação da sua ${produto} não foi concluída. Quer ajuda para atualizar o pagamento e não perder o acesso?`
      : `Oi, ${nome}! Tudo bem? Aqui é da equipe da Laura Rosa. Vi que você começou o pagamento do ${produto} e ainda não concluiu. Posso te ajudar a finalizar? Se quiser, te mando o Pix de novo.`
const TIPO_ROT: Record<Pendente['tipo'], string> = { pix: 'Pix/boleto gerado', atrasada: 'assinatura atrasada', criado: 'pedido criado' }

function Wa({ tel, texto }: { tel?: string | null; texto: string }) {
  const n = telWa(tel)
  if (!n) return <span style={{ color: 'var(--mute)' }}>sem telefone</span>
  return <a href={`https://wa.me/${n}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: '#fff', background: 'var(--g)', padding: '5px 10px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 12.5 }}>WhatsApp</a>
}

export default async function Recuperar({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await bloqueio('recuperar')
  if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const agora = new Date().toISOString()
  const sinceQuiz = per.since < QUIZ_NOVO ? new Date(QUIZ_NOVO).toISOString() : per.since

  const [raw, ses0, cs] = await Promise.all([vendasRaw(per.since, agora), sessoes(sinceQuiz, per.until), compras(sinceQuiz, agora)])
  const pend = pendentes(raw).filter((p) => p.quando < per.until)

  // Cartão recusado: uma linha por pessoa, só quem não comprou depois da recusa.
  const recusados = listaRecusados(raw).filter((v) => v.quando < per.until)

  // Quiz: clicou comprar e não comprou.
  const pagos = new Set(cs.map((c) => c.xcod).filter(Boolean) as string[])
  const pendXcod = new Set(pend.map((p) => p.xcod).filter(Boolean) as string[])
  const clic = ses0.filter((s) => s.checkout_clicked && !sessaoTeste(s))
  const sit = (s: Sessao) => (s.xcod && pagos.has(s.xcod) ? 'comprou' : s.xcod && pendXcod.has(s.xcod) ? 'pix' : 'saiu')
  const naoComprou = clic.filter((s) => sit(s) !== 'comprou')
  const comprouL = clic.filter((s) => sit(s) === 'comprou')

  // "Por que não compram": compara respostas de quem não comprou × quem comprou.
  const cruz = (k: string, rot: (v: string) => string) => {
    const m = new Map<string, { nao: number; sim: number }>()
    for (const s of clic) {
      const v = (s.answers || {})[k]
      const key = rot(String(Array.isArray(v) ? v[0] : v ?? ''))
      if (!key) continue
      const x = m.get(key) ?? { nao: 0, sim: 0 }
      if (sit(s) === 'comprou') x.sim++; else x.nao++
      m.set(key, x)
    }
    return [...m.entries()].sort((a, b) => b[1].nao - a[1].nao).slice(0, 6)
  }
  const medos = cruz('medo', (v) => MEDO[v] || v)
  const perfis = (() => {
    const m = new Map<string, { nao: number; sim: number }>()
    for (const s of clic) { const p = perfil(s.answers); const x = m.get(p) ?? { nao: 0, sim: 0 }; if (sit(s) === 'comprou') x.sim++; else x.nao++; m.set(p, x) }
    return [...m.entries()].sort((a, b) => b[1].nao - a[1].nao)
  })()

  const valorPend = pend.reduce((a, p) => a + p.valor, 0)
  const valorRec = recusados.reduce((a, v) => a + v.valor, 0)

  return (
    <PainelShell active="recuperar">
      <Titulo titulo="Recuperar vendas" sub="Quem quase comprou. Pix e cartão recusado se recuperam no WhatsApp (o quanto antes); quem saiu do checkout sem gerar pagamento vai para o remarketing." />
      <FiltroPeriodo per={per} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['3d', '3 dias'], ['7d', '7 dias'], ['30d', '30 dias']]} />

      <Grade min={170}>
        <Tile label="Pagamento parado" value={int(pend.length)} sub={`${plural(pend.length, 'pessoa', 'pessoas')} · ${brl0(valorPend)} na mesa`} cor={pend.length ? '#c0392b' : 'var(--g)'} />
        <Tile label="Cartão recusado" value={int(recusados.length)} sub={`${brl0(valorRec)} · oferecer Pix`} cor={recusados.length ? '#b9770e' : 'var(--g)'} />
        <Tile label="Clicaram comprar no quiz" value={int(clic.length)} sub={`${int(comprouL.length)} compraram (${pct(comprouL.length, clic.length, 0)})`} />
        <Tile label="Saíram do checkout" value={int(naoComprou.filter((s) => sit(s) === 'saiu').length)} sub="sem gerar pagamento → remarketing" />
      </Grade>

      <Secao titulo="1. Pagamento parado" sub="Uma linha por pessoa (bumps e Pix gerado de novo somam). Chamar em até 1 hora. A mensagem não oferece desconto (preço e oferta só com o ok do Patrik).">
        <Tabela min={760}>
          <thead><tr><th style={thL}>Quando</th><th style={thL}>Pessoa</th><th style={thL}>Produto</th><th style={th}>Valor</th><th style={thL}>Situação</th><th style={thL}>Meio</th><th style={thL}>Ação</th></tr></thead>
          <tbody>
            {pend.map((p) => (
              <tr key={p.tx}><td style={tdL}>{horaBR(p.quando)}</td><td style={tdL}><strong>{primeiroNome(p.nome)}</strong> <span style={{ color: 'var(--mute)' }}>{telMask(p.tel)}</span></td><td style={{ ...tdL, maxWidth: 260 }}>{p.produto}{p.itens > 1 ? <span style={{ color: 'var(--mute)' }}> +{p.itens - 1}</span> : null}</td><td style={td}>{brl(p.valor)}</td><td style={tdL}>{TIPO_ROT[p.tipo]}</td><td style={tdL}>{(p.metodo || '—').toLowerCase()} · {p.gateway || '—'}</td><td style={tdL}><Wa tel={p.tel} texto={msg(primeiroNome(p.nome), p.produto, p.tipo)} /></td></tr>
            ))}
            {!pend.length && <tr><td colSpan={7} style={{ ...tdL, color: 'var(--mute)', padding: 16 }}>Nenhum Pix ou boleto parado no período. 🎉</td></tr>}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="2. Cartão recusado" sub="O cartão não passou e a pessoa não comprou depois. Oferecer Pix.">
        <Tabela min={680}>
          <thead><tr><th style={thL}>Quando</th><th style={thL}>Pessoa</th><th style={thL}>Produto</th><th style={th}>Valor</th><th style={thL}>Ação</th></tr></thead>
          <tbody>
            {recusados.map((v) => (
              <tr key={v.tx}><td style={tdL}>{horaBR(v.quando)}</td><td style={tdL}><strong>{primeiroNome(v.nome)}</strong> <span style={{ color: 'var(--mute)' }}>{telMask(v.tel)}</span></td><td style={{ ...tdL, maxWidth: 260 }}>{v.produto}{v.itens > 1 ? <span style={{ color: 'var(--mute)' }}> ({v.itens} tentativas)</span> : null}</td><td style={td}>{brl(v.valor)}</td><td style={tdL}><Wa tel={v.tel} texto={msg(primeiroNome(v.nome), v.produto, 'recusado')} /></td></tr>
            ))}
            {!recusados.length && <tr><td colSpan={5} style={{ ...tdL, color: 'var(--mute)', padding: 16 }}>Nenhum cartão recusado sem compra depois.</td></tr>}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="3. Clicaram comprar no quiz e não compraram" sub="Sem telefone (não chegaram a gerar pagamento): o caminho é remarketing para quem iniciou o checkout. A tabela mostra o perfil e o medo de cada uma.">
        <Tabela min={760}>
          <thead><tr><th style={thL}>Quando</th><th style={thL}>Situação</th><th style={thL}>Perfil</th><th style={thL}>Maior medo</th><th style={thL}>Anúncio</th><th style={thL}>Checkout</th></tr></thead>
          <tbody>
            {naoComprou.slice(0, 60).map((s) => (
              <tr key={s.id}><td style={tdL}>{horaBR(s.checkout_at || s.created_at)}</td><td style={{ ...tdL, fontWeight: 700, color: sit(s) === 'pix' ? '#c0392b' : 'var(--sub)' }}>{sit(s) === 'pix' ? 'Pix sem pagar' : 'saiu do checkout'}</td><td style={tdL}>{perfil(s.answers)}</td><td style={tdL}>{MEDO[String((s.answers || {}).medo ?? '')] || '—'}</td><td style={{ ...tdL, maxWidth: 240 }}>{decUtm(s.utm_content) || 'direto'}</td><td style={tdL}>{s.checkout_ab || '—'}</td></tr>
            ))}
            {!naoComprou.length && <tr><td colSpan={6} style={{ ...tdL, color: 'var(--mute)', padding: 16 }}>Todo mundo que clicou comprou.</td></tr>}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Por que não compram?" sub="Entre quem clicou comprar: o que difere quem não comprou de quem comprou. O medo mais comum entre quem não comprou é o assunto do próximo criativo de remarketing.">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px,100%),1fr))' }}>
          {([['Maior medo (T17)', medos], ['Perfil de recomeço', perfis]] as const).map(([tit, rows]) => (
            <Tabela key={tit} min={300}>
              <thead><tr><th style={thL}>{tit}</th><th style={th}>Não compraram</th><th style={th}>Compraram</th></tr></thead>
              <tbody>{rows.map(([k, x]) => <tr key={k}><td style={tdL}>{k}</td><td style={td}>{int(x.nao)}</td><td style={{ ...td, color: 'var(--g)', fontWeight: 700 }}>{int(x.sim)}</td></tr>)}
                {!rows.length && <tr><td colSpan={3} style={{ ...tdL, color: 'var(--mute)' }}>Sem dados.</td></tr>}</tbody>
            </Tabela>
          ))}
        </div>
        {comprouL.length < 5 && <div className="mt-3"><Caixa tom="alerta">Ainda é cedo: menos de 5 compras no período, então as diferenças podem ser acaso.</Caixa></div>}
      </Secao>
    </PainelShell>
  )
}
