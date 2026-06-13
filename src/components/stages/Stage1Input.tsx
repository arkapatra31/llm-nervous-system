import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

const SPECIAL = /(<\|im_start\|>|<\|im_end\|>)/g

function FormattedText({ text }: { text: string }) {
  const parts = text.split(SPECIAL)
  return (
    <pre className="input-formatted mono">
      {parts.map((p, i) =>
        SPECIAL.test(p) ? (
          <span key={i} className="input-special">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </pre>
  )
}

export function Stage1Input() {
  const { query, formatted } = useQuery()
  const meta = STAGES[0]

  return (
    <Stage
      meta={meta}
      visualization={
        <div className="input-viz">
          <div className="input-block">
            <div className="input-block-label mono">what you typed</div>
            <pre className="input-raw mono">{query || '(empty)'}</pre>
          </div>
          <div className="input-arrow" aria-hidden="true">↓ wrap in chat template</div>
          <div className="input-block">
            <div className="input-block-label mono">what the model actually receives</div>
            <FormattedText text={formatted} />
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            Before anything else, your text is <span className="term">normalized</span> (consistent
            Unicode, whitespace) and wrapped in a <span className="term">chat template</span> — a
            fixed format that marks who is speaking. The highlighted pieces above are{' '}
            <span className="term">special tokens</span>: reserved markers like{' '}
            <code>&lt;|im_start|&gt;</code> and <code>&lt;|im_end|&gt;</code> that delimit each
            message and its role (<code>user</code>, <code>assistant</code>, <code>system</code>).
          </p>
          <p>
            That trailing <code>&lt;|im_start|&gt;assistant</code> is the cue that tells the model:
            "now produce the assistant's reply." Everything downstream operates on this formatted
            string, not your raw text.
          </p>
          <Expandable>
            <p>
              The exact template varies by model family (ChatML, Llama's <code>[INST]</code>{' '}
              blocks, etc.). The template shown here is ChatML-style for illustration. Special
              tokens occupy reserved IDs in the vocabulary, so they can never collide with text a
              user types — the tokenizer treats them atomically.
            </p>
            <p className="note">
              Simplification: a real system prompt and prior conversation turns would also be
              concatenated here. We show only the current user turn to keep the focus on your input.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
