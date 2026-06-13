import { useState } from 'react'
import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { TokenStrip } from '../viz/TokenStrip'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import { ENCODING_NAME } from '../../lib/tokenizer'
import './stages.css'

export function Stage2Tokenization() {
  const { tokens } = useQuery()
  const [active, setActive] = useState<number | null>(null)
  const meta = STAGES[1]

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <TokenStrip tokens={tokens} activeIndex={active} onHover={setActive} />
          <div className="token-stats">
            <Stat label="tokens" value={tokens.length} />
            <Stat label="characters" value={[...tokensText(tokens)].length} />
            <Stat
              label="chars / token"
              value={tokens.length ? (tokensText(tokens).length / tokens.length).toFixed(1) : '0'}
            />
            <Stat label="encoding" value={ENCODING_NAME} mono />
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            The model has a fixed <span className="term">vocabulary</span> of ~100,000{' '}
            <span className="term">tokens</span> — common words, word-fragments, punctuation, even
            byte sequences. <span className="term">Tokenization</span> greedily splits your text
            into these pieces and replaces each with its integer{' '}
            <span className="term">token ID</span> (the small number on each chip). This is real:
            the chips above are produced by the actual <code>{ENCODING_NAME}</code> encoder running
            in your browser.
          </p>
          <p>
            Notice that whitespace usually attaches to the <em>following</em> word (the leading{' '}
            <code>␣</code>), and that uncommon words break into multiple sub-word tokens while
            common ones stay whole. This is why token count rarely equals word count.
          </p>
          <Expandable>
            <p>
              The algorithm is <span className="term">byte-pair encoding (BPE)</span>. Starting from
              raw bytes, it repeatedly merges the most frequent adjacent pair according to a merge
              table learned at training time, until no more merges apply. Because it bottoms out at
              bytes, BPE can represent <em>any</em> string — emoji, code, languages unseen in
              training — with no "unknown token." The trade-off: rare words cost more tokens, and
              token boundaries don't respect linguistic morphemes.
            </p>
          </Expandable>
        </>
      }
    />
  )
}

function tokensText(tokens: { text: string }[]) {
  return tokens.map((t) => t.text).join('')
}

function Stat({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="stat">
      <div className="stat-value" style={mono ? { fontFamily: 'var(--font-mono)', fontSize: '1rem' } : undefined}>
        {value}
      </div>
      <div className="stat-label mono">{label}</div>
    </div>
  )
}
