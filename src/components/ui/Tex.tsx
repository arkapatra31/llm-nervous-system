import { useMemo } from 'react'
import katex from 'katex'

// Renders LaTeX with KaTeX (proper notation, not ASCII approximations).
// Named Tex (not Math) to avoid shadowing the global Math object.
export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
      }),
    [tex, block]
  )
  return (
    <span
      className={block ? 'math-block' : 'math-inline'}
      // KaTeX output is trusted (we author the TeX strings)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
