import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { StageMeta } from '../lib/stages'
import './Stage.css'

// Layout for one pipeline stage: header → visualization → explanation.
// Visualization and explanation are passed as separate nodes (per the brief:
// "visualization first, then in another component the explanation").
export function Stage({
  meta,
  visualization,
  explanation,
}: {
  meta: StageMeta
  visualization: ReactNode
  explanation: ReactNode
}) {
  return (
    <section id={meta.id} className="stage">
      <motion.div
        className="stage-head"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="stage-num mono">
          {String(meta.num).padStart(2, '0')} <span>/ 08</span>
        </div>
        <div className="stage-titles">
          <div className="stage-title-row">
            <h2>{meta.title}</h2>
            <FidelityBadge fidelity={meta.fidelity} />
          </div>
          <p className="stage-intuition">{meta.intuition}</p>
        </div>
      </motion.div>

      <motion.div
        className="stage-viz card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="stage-viz-tag mono">visualization · your input</div>
        {visualization}
      </motion.div>

      <motion.div
        className="stage-explain"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {explanation}
      </motion.div>
    </section>
  )
}

function FidelityBadge({ fidelity }: { fidelity: StageMeta['fidelity'] }) {
  const real = fidelity === 'real'
  return (
    <span className={`fidelity ${real ? 'fidelity--real' : 'fidelity--sim'}`}>
      <span className="fidelity-dot" />
      {real ? 'real computation' : 'illustrative'}
    </span>
  )
}
