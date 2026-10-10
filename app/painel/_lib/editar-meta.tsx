'use client'
// Formulário do Cockpit para editar a meta do mês e os custos fixos.
// Salva em /api/painel/meta (tabela painel_config) e recarrega a página.
import { useState } from 'react'
import { GRUPOS, TIPOS, type MetaCfg, type TipoCusto } from '../_config'

const inp: React.CSSProperties = { padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,.15)', fontSize: 14, background: '#fff', color: 'var(--ink)', minWidth: 0 }
const rot: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mute)', display: 'block', marginBottom: 4 }
const brl = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')

export default function EditarMeta({ inicial, editadoEm }: { inicial: MetaCfg; editadoEm: string | null }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState(inicial.texto)
  const [lucro, setLucro] = useState(String(inicial.lucro))
  const [inicio, setInicio] = useState(inicial.inicio)
  const [dias, setDias] = useState(String(inicial.dias))
  const [custos, setCustos] = useState(inicial.custos.map((c) => ({ nome: c.nome, valor: String(c.valor).replace('.', ','), tipo: c.tipo as TipoCusto, grupo: c.grupo })))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Aceita 3500, 3.500, 3.500,50 e 3500.5.
  const num = (v: string) => { const t = String(v).trim(); return (t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t)) || 0 }
  const total = custos.filter((c) => c.tipo === 'fixo').reduce((a, c) => a + num(c.valor), 0)
  const pcts = custos.filter((c) => c.tipo !== 'fixo' && num(c.valor) > 0).map((c) => `${c.valor}% ${TIPOS.find(([t]) => t === c.tipo)?.[1].replace('% ', '') || ''}`)
  const muda = (i: number, campo: 'nome' | 'valor' | 'tipo' | 'grupo', v: string) => setCustos(custos.map((c, j) => (j === i ? { ...c, [campo]: v } : c)))

  // "Começar este mês": início no dia 1 do mês atual e dias do mês.
  function mesAtual() {
    const h = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const [y, m] = h.split('-').map(Number)
    setInicio(`${h.slice(0, 7)}-01`)
    setDias(String(new Date(Date.UTC(y, m, 0)).getUTCDate()))
  }

  async function salvar() {
    setErro(''); setSalvando(true)
    try {
      const r = await fetch('/api/painel/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, lucro: num(lucro), inicio, dias: Number(dias), custos: custos.map((c) => ({ nome: c.nome, valor: num(c.valor), tipo: c.tipo, grupo: c.grupo })) }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) { setErro(j.erro || 'Não consegui salvar.'); return }
      location.reload()
    } catch {
      setErro('Sem conexão. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto)
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setAberto(true)} style={{ padding: '8px 14px', borderRadius: 99, fontSize: 13.5, fontWeight: 800, border: '1px solid var(--o)', background: '#fff', color: 'var(--od)', cursor: 'pointer' }}>
          ✏️ Editar meta e custos
        </button>
        <span style={{ fontSize: 12, color: 'var(--mute)' }}>{editadoEm ? `Última edição: ${new Date(editadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'Usando os valores padrão'}</span>
      </div>
    )

  return (
    <div className="mt-3 rounded-2xl p-4" style={{ background: '#fff', border: '1px solid var(--o)' }}>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Editar meta e custos do mês</div>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px,100%),1fr))' }}>
        <label style={{ gridColumn: '1 / -1' }}><span style={rot}>Meta (texto)</span><input style={{ ...inp, width: '100%' }} value={texto} maxLength={140} onChange={(e) => setTexto(e.target.value)} /></label>
        <label><span style={rot}>Lucro do mês (R$)</span><input style={{ ...inp, width: '100%' }} inputMode="decimal" value={lucro} onChange={(e) => setLucro(e.target.value)} /></label>
        <label><span style={rot}>Começa em</span><input style={{ ...inp, width: '100%' }} type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
        <label><span style={rot}>Dias</span><input style={{ ...inp, width: '100%' }} inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value)} /></label>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="button" onClick={mesAtual} style={{ ...inp, cursor: 'pointer', fontWeight: 700 }}>Usar o mês atual</button></div>
      </div>

      <div style={{ ...rot, marginTop: 16 }}>Custos do mês (como na planilha Gestão financeira)</div>
      <div className="grid gap-2">
        {GRUPOS.map((g) => {
          const idx = custos.map((c, i) => [c, i] as const).filter(([c]) => c.grupo === g)
          return (
            <div key={g} className="rounded-xl p-3" style={{ background: 'var(--pale)' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 6 }}>{g}</div>
              <div className="grid gap-2">
                {idx.map(([c, i]) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <input style={{ ...inp, flex: '2 1 160px' }} placeholder="Nome (ex.: VTurb)" value={c.nome} maxLength={60} onChange={(e) => muda(i, 'nome', e.target.value)} />
                    <input style={{ ...inp, flex: '0 1 100px', width: 100 }} placeholder={c.tipo === 'fixo' ? 'R$' : '%'} aria-label={`Valor de ${c.nome || 'custo'}`} inputMode="decimal" value={c.valor} onChange={(e) => muda(i, 'valor', e.target.value)} />
                    <select style={{ ...inp, flex: '1 1 150px' }} aria-label="Tipo" value={c.tipo} onChange={(e) => muda(i, 'tipo', e.target.value)}>{TIPOS.map(([t, l]) => <option key={t} value={t}>{l}</option>)}</select>
                    <select style={{ ...inp, flex: '1 1 150px' }} aria-label="Grupo" value={c.grupo} onChange={(e) => muda(i, 'grupo', e.target.value)}>{GRUPOS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
                    <button type="button" aria-label={`Remover ${c.nome || 'custo'}`} onClick={() => setCustos(custos.filter((_, j) => j !== i))} style={{ ...inp, cursor: 'pointer', color: '#c0392b', fontWeight: 800 }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setCustos([...custos, { nome: '', valor: '', tipo: 'fixo', grupo: g }])} style={{ ...inp, cursor: 'pointer', fontWeight: 700, justifySelf: 'start' }}>+ Adicionar em {g}</button>
              </div>
            </div>
          )
        })}
        <div style={{ fontSize: 13.5 }}>Fixos: <strong>{brl(total)}</strong> no mês{pcts.length ? <> · mais {pcts.join(' · ')}</> : null}</div>
      </div>

      {erro && <p style={{ fontSize: 13, color: '#c0392b', marginTop: 10 }}>{erro}</p>}
      <div className="flex flex-wrap gap-2 mt-4">
        <button type="button" disabled={salvando} onClick={salvar} style={{ padding: '10px 18px', borderRadius: 99, fontSize: 14, fontWeight: 800, border: 'none', background: salvando ? 'rgba(0,0,0,.2)' : 'var(--o)', color: '#000', cursor: salvando ? 'default' : 'pointer' }}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        <button type="button" onClick={() => { setAberto(false); setErro('') }} style={{ padding: '10px 18px', borderRadius: 99, fontSize: 14, fontWeight: 700, border: '1px solid rgba(0,0,0,.15)', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 8 }}>Vale para todo mundo que abre o painel. Custos em R$ entram inteiros no lucro do mês e rateados por dia nos cards diários; os em % são calculados sobre o que entrou (faturamento, investimento no Meta ou vendas da Aline).</p>
    </div>
  )
}
