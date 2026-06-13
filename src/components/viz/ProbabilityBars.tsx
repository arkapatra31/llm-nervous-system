import { motion } from 'framer-motion'
import { displayToken } from '../../lib/tokenizer'
import type { Candidate } from '../../lib/sampling'
import './viz.css'

// Reusable probability distribution bars. Candidates passed in as a prop.
export function ProbabilityBars({
  candidates,
  rows = 10,
}: {
  candidates: Candidate[]
  rows?: number
}) {
  const shown = candidates.slice(0, rows)
  const max = Math.max(...shown.map((c) => c.prob), 0.0001)

  return (
    <div className="probbars">
      {shown.map((c, i) => (
        <div key={c.token} className={`probbar-row ${c.kept ? '' : 'probbar-row--dropped'}`}>
          <span className="probbar-tok mono">"{displayToken(c.token)}"</span>
          <div className="probbar-track">
            <motion.div
              className={`probbar-fill ${i === 0 && c.kept ? 'probbar-fill--top' : ''}`}
              animate={{ width: `${(c.prob / max) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <span className="probbar-pct mono">
            {c.kept ? `${(c.prob * 100).toFixed(1)}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
