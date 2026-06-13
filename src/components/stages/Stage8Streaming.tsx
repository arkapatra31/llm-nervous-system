import { useEffect, useRef, useState } from 'react'
import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { displayToken } from '../../lib/tokenizer'
import { generateContinuation } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

const GEN_LEN = 9

export function Stage8Streaming() {
  const { tokens } = useQuery()
  const meta = STAGES[7]
  const generated = generateContinuation(tokens, GEN_LEN)

  const [step, setStep] = useState(GEN_LEN)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const stream = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setStep(0)
    for (let s = 1; s <= GEN_LEN; s++) {
      timers.current.push(setTimeout(() => setStep(s), s * 230))
    }
  }

  useEffect(() => {
    stream()
    return () => timers.current.forEach(clearTimeout)
  }, [tokens])

  const text = generated.slice(0, step).join('')

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <div className="stream-block">
            <div className="stream-block-label mono">tokens out</div>
            <div className="stream-tokens">
              {generated.map((g, i) => (
                <span
                  key={i}
                  className={`stream-tok mono ${i < step ? 'stream-tok--sent' : ''}`}
                >
                  {displayToken(g)}
                </span>
              ))}
            </div>
          </div>

          <div className="stream-arrow mono" aria-hidden="true">↓ detokenize</div>

          <div className="stream-block">
            <div className="stream-block-label mono">rendered for you</div>
            <div className="stream-text">
              {text}
              {step < GEN_LEN && <span className="stream-cursor" />}
            </div>
          </div>

          <button className="stream-replay mono" onClick={stream}>
            ↻ replay stream
          </button>
        </div>
      }
      explanation={
        <>
          <p>
            Each sampled token is the inverse of step 2: its ID is looked up and{' '}
            <span className="term">detokenized</span> back into the text fragment it represents,
            then concatenated onto the response. Rather than wait for the whole reply, servers{' '}
            <span className="term">stream</span> each token as it's produced — which is why you see
            answers appear progressively instead of all at once.
          </p>
          <p>
            Streaming is typically delivered over <span className="term">server-sent events
            (SSE)</span>: the connection stays open and the server pushes one chunk per token until
            it sends a final "done" marker.
          </p>
          <Expandable>
            <p>
              One subtlety: because tokens are <em>byte</em>-level BPE pieces, a single character
              (an emoji, a CJK glyph) can span multiple tokens. A correct detokenizer buffers raw
              bytes and only emits text once it forms valid UTF-8 — otherwise you'd get mojibake
              mid-stream. The client also reverses the chat template, stripping the special tokens
              so you only see the assistant's words.
            </p>
            <p className="note">
              Real: detokenization uses the same <code>cl100k_base</code> vocabulary as step 2. The
              specific tokens being streamed are the illustrative continuation from the previous
              stage.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
