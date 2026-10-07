// Substitui o next/image na cópia de revisão: um <img> simples com caminho relativo.
export default function Image({ src, alt, fill, sizes, priority, style, ...rest }) {
  const s = fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...(style || {}) } : style
  return <img src={String(src).replace(/^\//, '')} alt={alt} style={s} loading={priority ? 'eager' : 'lazy'} {...rest} />
}
