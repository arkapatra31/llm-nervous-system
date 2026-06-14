import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '../context/QueryContext'
import { STAGES } from '../lib/stages'
import { pulse } from '../lib/signal'
import './Hero.css'

const EXAMPLES = ['Explain how attention works.', 'Write a haiku about the sea.', 'Why is the sky blue?']

export function Hero() {
  const { query, setQuery, tokens } = useQuery()
  const first = useRef(true)

  // pulse the 3D core whenever the query changes
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    pulse(0.9)
  }, [query])

  const reveal = {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <motion.p
          className="eyebrow hero-eyebrow"
          {...reveal}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          the inference pipeline, visualized
        </motion.p>

        <motion.h1
          {...reveal}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          What happens <span className="grad-text">inside an&nbsp;LLM</span> the moment you press enter
        </motion.h1>

        <motion.p
          className="hero-lede"
          {...reveal}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Type a query and trace it through all eight stages of inference — from raw text to a
          streamed answer. Every stage reacts to <em>your</em> words. Tokenization and sampling math
          run for real, in your browser.
        </motion.p>

        <motion.div
          className="hero-field"
          {...reveal}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <label className="eyebrow hero-field-label" htmlFor="query-input">
            your query
          </label>
          <textarea
            id="query-input"
            className="hero-input mono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={2}
            spellCheck={false}
            placeholder="Ask the model anything…"
          />
          <div className="hero-field-meta">
            <span className="hero-tokens mono">
              <b>{tokens.length}</b> tokens
            </span>
            <div className="hero-examples">
              {EXAMPLES.map((ex) => (
                <button key={ex} className="hero-example mono" onClick={() => setQuery(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.a
          href={`#${STAGES[0].id}`}
          className="hero-cta"
          {...reveal}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>enter the pipeline</span>
          <span className="hero-cta-arrow">↓</span>
        </motion.a>
      </div>

      <div className="hero-scrollhint mono" aria-hidden="true">
        <span>scroll</span>
        <span className="hero-scrollline" />
      </div>
    </section>
  )
}
