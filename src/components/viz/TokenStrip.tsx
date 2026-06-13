import { displayToken, type Token } from '../../lib/tokenizer'
import './viz.css'

const HUES = [262, 188, 300, 162, 38] // violet, cyan, magenta, green, amber

// Reusable token visualization. Takes tokens as a prop — no example baked in.
export function TokenStrip({
  tokens,
  showIds = true,
  activeIndex,
  onHover,
}: {
  tokens: Token[]
  showIds?: boolean
  activeIndex?: number | null
  onHover?: (index: number | null) => void
}) {
  if (tokens.length === 0) {
    return <div className="token-empty">Type something above to see its tokens.</div>
  }
  return (
    <div className="token-strip" role="list">
      {tokens.map((t) => {
        const hue = HUES[t.index % HUES.length]
        const active = activeIndex === t.index
        return (
          <div
            key={t.index}
            role="listitem"
            className={`token-chip ${active ? 'token-chip--active' : ''}`}
            style={{
              ['--h' as string]: hue,
            }}
            onMouseEnter={() => onHover?.(t.index)}
            onMouseLeave={() => onHover?.(null)}
          >
            <span className="token-piece mono">{displayToken(t.text)}</span>
            {showIds && <span className="token-id mono">{t.id}</span>}
          </div>
        )
      })}
    </div>
  )
}
