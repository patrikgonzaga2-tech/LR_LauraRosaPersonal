// Peças visuais compartilhadas do painel (server components, sem JS no cliente).
import type { ReactNode, CSSProperties } from 'react'

export const COR = { ok: 'var(--g)', wait: '#b9770e', no: '#c0392b', n: 'var(--mute)' } as const

export function Titulo({ titulo, sub, children }: { titulo: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15 }}>{titulo}</h1>
        {sub && <p style={{ fontSize: 13.5, color: 'var(--sub)', marginTop: 4, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {children}
    </div>
  )
}

export function Tile({ label, value, sub, cor, destaque }: { label: string; value: ReactNode; sub?: ReactNode; cor?: string; destaque?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: destaque ? 'var(--gd)' : '#fff', color: destaque ? '#fff' : undefined, border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 4px 16px rgba(0,0,0,.04)', minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: destaque ? 'rgba(255,255,255,.65)' : 'var(--mute)' }}>{label}</div>
      <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color: destaque ? '#fff' : cor || 'var(--ink)', lineHeight: 1.15, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: destaque ? 'rgba(255,255,255,.75)' : 'var(--sub)', marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  )
}

export function Grade({ children, min = 170 }: { children: ReactNode; min?: number }) {
  return <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>
}

export function Secao({ titulo, sub, children, id }: { titulo: string; sub?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="mt-7" id={id}>
      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{titulo}</h2>
      {sub && <p style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 3, lineHeight: 1.5 }}>{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Caixa({ children, tom = 'info' }: { children: ReactNode; tom?: 'info' | 'alerta' | 'ok' | 'erro' }) {
  const bg = { info: 'rgba(245,113,0,.07)', alerta: 'rgba(185,119,14,.10)', ok: 'rgba(28,135,60,.08)', erro: 'rgba(192,57,43,.08)' }[tom]
  const bd = { info: 'rgba(245,113,0,.2)', alerta: 'rgba(185,119,14,.3)', ok: 'rgba(28,135,60,.25)', erro: 'rgba(192,57,43,.25)' }[tom]
  return <div className="rounded-xl p-3" style={{ fontSize: 13, background: bg, border: `1px solid ${bd}`, color: 'var(--ink)', lineHeight: 1.55 }}>{children}</div>
}

export function Pill({ tipo, children, title }: { tipo: keyof typeof COR; children: ReactNode; title?: string }) {
  return <span title={title} style={{ display: 'inline-block', fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 99, color: '#fff', background: COR[tipo], whiteSpace: 'nowrap' }}>{children}</span>
}

export function Barra({ valor, marca, cor = 'var(--g)', altura = 12 }: { valor: number; marca?: number; cor?: string; altura?: number }) {
  const v = Math.max(0, Math.min(1, valor))
  return (
    <div style={{ position: 'relative', height: altura, borderRadius: 99, background: 'rgba(0,0,0,.08)', overflow: 'visible' }}>
      <div style={{ width: `${v * 100}%`, height: '100%', borderRadius: 99, background: cor }} />
      {marca != null && <div title="onde deveria estar hoje" style={{ position: 'absolute', top: -4, bottom: -4, left: `${Math.max(0, Math.min(1, marca)) * 100}%`, width: 2, background: 'var(--ink)' }} />}
    </div>
  )
}

export const th: CSSProperties = { padding: '9px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--mute)', textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,.08)' }
export const thL: CSSProperties = { ...th, textAlign: 'left' }
export const td: CSSProperties = { padding: '9px 10px', fontSize: 13.5, color: 'var(--ink)', textAlign: 'right', whiteSpace: 'nowrap', borderTop: '1px solid rgba(0,0,0,.05)' }
export const tdL: CSSProperties = { ...td, textAlign: 'left', whiteSpace: 'normal' }

export function Tabela({ children, min = 560 }: { children: ReactNode; min?: number }) {
  return (
    <div className="rounded-2xl overflow-x-auto" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: min }}>{children}</table>
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px dashed rgba(0,0,0,.15)', fontSize: 13.5, color: 'var(--sub)' }}>{children}</div>
}

export function Abas({ itens, ativo }: { itens: [string, string, string][]; ativo: string }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {itens.map(([k, rot, href]) => (
        <a key={k} href={href} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(0,0,0,.12)', background: ativo === k ? 'var(--ink)' : '#fff', color: ativo === k ? '#fff' : 'var(--ink)' }}>{rot}</a>
      ))}
    </div>
  )
}
