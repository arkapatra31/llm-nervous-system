import { motion } from 'framer-motion'
import { useQuery } from '../context/QueryContext'
import { STAGES } from '../lib/stages'
import './Hero.css'

const EXAMPLES = [
  'Explain how attention works.',
  'Write a haiku about the sea.',
  'Why is the sky blue?',
]

export function Hero() {
  const { query, setQuery, tokens } = useQuery()

  return (
    <section id="top" className="hero">
      <motion.div
        className="hero-inner"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-chip mono">
          <span className="hero-chip-dot" /> interactive · 8 stages
        </div>

        <h1>
          What happens <span className="grad-text">inside an LLM</span>
          <br />
          when you hit enter?
        </h1>

        <p className="hero-lede">
          Type a query below and follow it through the entire inference pipeline — from raw
          text to a streamed response. Every stage shows what happened to{' '}
          <em>your</em> input. Tokenization and sampling math are computed for real, in your
          browser.
        </p>

        <label className="hero-input-label mono" htmlFor="query-input">
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

        <div className="hero-meta">
          <span className="hero-tokencount">
            <strong className="mono">{tokens.length}</strong> tokens
          </span>
          <div className="hero-examples">
            <span className="hero-examples-label">try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="hero-example" onClick={() => setQuery(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <a href={`#${STAGES[0].id}`} className="hero-start">
          follow it through the pipeline
          <span className="hero-start-arrow" aria-hidden="true">↓</span>
        </a>
      </motion.div>
    </section>
  )
}
