import { useEffect, useRef, useState } from 'react'
import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { displayToken } from '../../lib/tokenizer'
import { generateContinuation } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

const GEN_LEN = 7

export function Stage7Autoregressive() {
  const { tokens } = useQuery()
  const meta = STAGES[6]
  const generated = generateContinuation(tokens, GEN_LEN)

  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const run = () => {
    clear()
    setStep(0)
    setRunning(true)
    for (let s = 1; s <= GEN_LEN; s++) {
      timers.current.push(setTimeout(() => setStep(s), s * 650))
    }
    timers.current.push(
      setTimeout(() => setRunning(false), GEN_LEN * 650 + 200)
    )
  }

  useEffect(() => () => clear(), [])

  const promptPreview = tokens.slice(-4)

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <div className="auto-controls">
            <button className="auto-run mono" onClick={run} disabled={running}>
              {running ? 'generating…' : step === 0 ? '▶ run the loop' : '↻ run again'}
            </button>
            <span className={`auto-loop mono ${running ? 'auto-loop--on' : ''}`}>
              <span className="auto-loop-icon">↻</span> predict → sample → append
            </span>
          </div>

          <div className="auto-stream">
            {tokens.length > 4 && <span className="auto-ellipsis mono">…</span>}
            {promptPreview.map((t) => (
              <span key={`p-${t.index}`} className="auto-tok auto-tok--prompt mono">
                {displayToken(t.text)}
              </span>
            ))}
            {generated.slice(0, step).map((g, i) => (
              <span
                key={`g-${i}`}
                className={`auto-tok auto-tok--gen mono ${i === step - 1 ? 'auto-tok--new' : ''}`}
              >
                {displayToken(g)}
              </span>
            ))}
            {running && step < GEN_LEN && <span className="auto-cursor" />}
          </div>

          <div className="auto-caption mono">
            {step === 0
              ? 'the prompt is the context; press run to generate the reply token by token'
              : step >= GEN_LEN
              ? 'reached the stopping condition (illustrative)'
              : `step ${step}: appended "${displayToken(generated[step - 1])}", feeding it back in`}
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            The model only ever predicts <em>one</em> token. To produce a whole reply it runs{' '}
            <span className="term">autoregressively</span>: sample a token, <em>append</em> it to
            the sequence, then run the forward pass again to predict the next — over and over. Each
            new token is conditioned on your prompt plus everything generated so far, which is why
            text streams out left to right.
          </p>
          <p>
            The loop ends when the model emits a special <span className="term">end-of-sequence
            (EOS)</span> token, or when it hits a maximum-length limit.
          </p>
          <Expandable>
            <p>
              Naively, step <em>n</em> would re-process all <em>n</em> tokens — quadratic work. The{' '}
              <span className="term">KV cache</span> fixes this: the key and value vectors for every
              past token are computed once and stored, so each new step only computes attention for
              the single new token against the cache. This is the difference between the slower{' '}
              <span className="term">prefill</span> (processing your whole prompt at once) and fast
              per-token <span className="term">decode</span>. The cache is also what consumes memory
              as context grows.
            </p>
            <p className="note">
              Illustrative: the generated tokens above are a deterministic stand-in seeded by your
              prompt, shown to demonstrate the loop. The mechanics — append, feed back, stop on EOS
              — are exactly how real generation works.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
