import { createRoot } from 'react-dom/client'
import QuizApp from '@quiz/_quiz'

// Cópia de revisão: não grava nada no banco nem no GTM/pixel de produção.
const realFetch = window.fetch.bind(window)
window.fetch = (u, o) => (String(u).includes('/api/') ? Promise.resolve(new Response('{}')) : realFetch(u, o))
window.dataLayer = []

// Botão de compra não abre o checkout de verdade (evita venda/atribuição falsa
// no funil do quiz). Ouve na fase de bolha, depois do onClick do React já ter
// montado o link final, e mostra o link que seria aberto.
window.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href]')
  if (!a || !/payfast\.greenn|pay\.hotmart/.test(a.href)) return
  e.preventDefault()
  let box = document.getElementById('rev-checkout')
  if (!box) {
    box = document.createElement('div'); box.id = 'rev-checkout'
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#1A1A1A;color:#fff;border-radius:14px;padding:12px 14px;font:13px/1.4 system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35)'
    document.body.appendChild(box)
  }
  box.textContent = ''
  const t = document.createElement('b'); t.textContent = 'Revisão: o checkout não abre aqui. Link que abriria:'
  const u = document.createElement('div'); u.textContent = a.href; u.style.cssText = 'word-break:break-all;opacity:.85;margin-top:4px'
  box.append(t, u)
  clearTimeout(box._t); box._t = setTimeout(() => box.remove(), 7000)
})

createRoot(document.getElementById('root')).render(<QuizApp />)
