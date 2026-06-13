import { useState } from 'react'
import { displayToken, type Token } from '../../lib/tokenizer'
import './viz.css'

// Reusable causal attention heatmap. Row i = how much token i attends to each
// token j. Data (tokens + matrix) is passed in — nothing hardcoded.
export function AttentionHeatmap({
  tokens,
  matrix,
  max = 12,
}: {
  tokens: Token[]
  matrix: number[][]
  max?: number
}) {
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null)

  if (tokens.length === 0) return <div className="token-empty">No tokens yet.</div>

  // keep the grid readable for long inputs
  const n = Math.min(tokens.length, max)
  const labels = tokens.slice(0, n)
  const truncated = tokens.length > n

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-corner-note mono">attends to →</div>
      <div
        className="heatmap-grid"
        style={{ gridTemplateColumns: `auto repeat(${n}, 1fr)` }}
      >
        <div className="heatmap-cell heatmap-axis" />
        {labels.map((t) => (
          <div key={`c-${t.index}`} className="heatmap-cell heatmap-col-label mono">
            {displayToken(t.text)}
          </div>
        ))}

        {labels.map((rowTok, i) => (
          <div key={`r-${rowTok.index}`} className="heatmap-row">
            <div className="heatmap-cell heatmap-row-label mono">
              {displayToken(rowTok.text)}
            </div>
            {labels.map((_colTok, j) => {
              const w = matrix[i]?.[j] ?? 0
              const masked = j > i
              return (
                <div
                  key={`x-${i}-${j}`}
                  className={`heatmap-cell heatmap-weight ${masked ? 'heatmap-masked' : ''}`}
                  style={{ ['--a' as string]: masked ? 0 : w }}
                  title={
                    masked
                      ? 'masked (future token)'
                      : `${(w * 100).toFixed(1)}% attention`
                  }
                  onMouseEnter={() => setHover({ i, j })}
                  onMouseLeave={() => setHover(null)}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-foot">
        <span className="mono">
          {hover
            ? `"${displayToken(labels[hover.i].text)}" → "${displayToken(
                labels[hover.j].text
              )}": ${
                hover.j > hover.i ? 'masked' : ((matrix[hover.i]?.[hover.j] ?? 0) * 100).toFixed(1) + '%'
              }`
            : 'darker = stronger attention · upper triangle is masked (causal)'}
        </span>
        {truncated && (
          <span className="heatmap-trunc mono">showing first {n} of {tokens.length} tokens</span>
        )}
      </div>
    </div>
  )
}
