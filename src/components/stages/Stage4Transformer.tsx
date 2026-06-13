import { useState } from 'react'
import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { Tex } from '../ui/Tex'
import { AttentionHeatmap } from '../viz/AttentionHeatmap'
import { attentionMatrix } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

const HEADS = 4

export function Stage4Transformer() {
  const { tokens } = useQuery()
  const [head, setHead] = useState(0)
  const meta = STAGES[3]
  const matrix = attentionMatrix(tokens, head)

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <div className="head-tabs">
            <span className="head-tabs-label mono">attention head</span>
            {Array.from({ length: HEADS }, (_, h) => (
              <button
                key={h}
                className={`head-tab mono ${head === h ? 'head-tab--active' : ''}`}
                onClick={() => setHead(h)}
              >
                {h + 1}
              </button>
            ))}
          </div>
          <AttentionHeatmap tokens={tokens} matrix={matrix} />
        </div>
      }
      explanation={
        <>
          <p>
            This is the engine. The token vectors pass through a stack of identical{' '}
            <span className="term">transformer layers</span> (dozens of them). The key operation is{' '}
            <span className="term">self-attention</span>: each token produces a{' '}
            <span className="term">query</span>, <span className="term">key</span>, and{' '}
            <span className="term">value</span> vector, and attends to other tokens by comparing its
            query against their keys. The heatmap shows the resulting weights — row <em>i</em> is how
            much token <em>i</em> draws from each earlier token <em>j</em>.
          </p>
          <Tex
            block
            tex="\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V"
          />
          <p>
            The strict lower-triangular shape is the <span className="term">causal mask</span>: a
            token may attend to itself and everything before it, never the future — that's what lets
            the model generate left-to-right. Switch heads above and the pattern changes: different{' '}
            <span className="term">attention heads</span> learn to track different relationships
            (nearby words, subjects and verbs, quotation matching, …).
          </p>
          <Expandable>
            <p>
              Each layer is more than attention. The flow per layer is: layer-norm → multi-head
              attention → add the input back (a <span className="term">residual connection</span>) →
              layer-norm → a position-wise <span className="term">feed-forward network</span> (MLP,
              usually 4× wider) → residual again. Residuals give gradients a clean highway through
              the depth; layer-norm keeps activations well-scaled. <span className="term">Multi-head</span>{' '}
              means <Tex tex="h" /> attentions run in parallel on slices of the vector and are
              concatenated, so the model attends to several things at once.
            </p>
            <p className="note">
              Illustrative: these weights are deterministic stand-ins seeded by your real token IDs,
              with a recency bias and the correct causal mask. A real model's weights would reflect
              learned linguistic structure — but the shape, masking, and per-head variation shown
              here are faithful to how attention actually behaves.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
