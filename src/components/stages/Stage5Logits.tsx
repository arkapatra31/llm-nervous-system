import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { Tex } from '../ui/Tex'
import { displayToken } from '../../lib/tokenizer'
import { nextTokenLogits } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

export function Stage5Logits() {
  const { tokens } = useQuery()
  const meta = STAGES[4]
  const logits = nextTokenLogits(tokens).slice(0, 10)
  const maxAbs = Math.max(...logits.map((l) => Math.abs(l.logit)), 1)

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <div className="logit-caption mono">
            raw logits for the next token — one score per vocabulary entry (top 10 shown)
          </div>
          <div className="logit-list">
            {logits.map((l) => (
              <div key={l.token} className="logit-row">
                <span className="logit-tok mono">"{displayToken(l.token)}"</span>
                <div className="logit-track">
                  <div
                    className="logit-bar"
                    style={{ width: `${(Math.abs(l.logit) / maxAbs) * 100}%` }}
                  />
                </div>
                <span className="logit-val mono">{l.logit.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="logit-note mono">
            these are scores, not probabilities yet — they can be any real number
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            After the final transformer layer, the last position holds a single vector that has
            absorbed the whole context. To turn that into a prediction, the model multiplies it by
            the <span className="term">unembedding matrix</span> (the output projection) — producing
            one raw score, a <span className="term">logit</span>, for <em>every</em> token in the
            vocabulary:
          </p>
          <Tex block tex="\text{logits} = h_{\text{last}} \, W_U \in \mathbb{R}^{|V|}" />
          <p>
            So the output isn't a word — it's a vector with ~100,000 entries, one per possible next
            token. A higher logit means the model finds that token a better continuation. Logits are
            unbounded real numbers; they only become comparable probabilities in the next stage.
          </p>
          <Expandable>
            <p>
              <Tex tex="W_U" /> maps from the model's hidden dimension to vocabulary size, so it's
              one of the largest matrices in the network. Many models <span className="term">tie</span>{' '}
              it to the input embedding matrix (reusing the same weights, transposed), which saves
              parameters and tends to help quality. Only the logit at the final sequence position
              matters for choosing the next token — though during training every position predicts
              its own next token in parallel.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
