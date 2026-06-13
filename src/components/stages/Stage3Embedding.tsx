import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { Tex } from '../ui/Tex'
import { VectorRow } from '../viz/VectorRow'
import { displayToken } from '../../lib/tokenizer'
import { embeddingFor } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

const DIMS_SHOWN = 12
const MAX_TOKENS = 6

export function Stage3Embedding() {
  const { tokens } = useQuery()
  const meta = STAGES[2]
  const shown = tokens.slice(0, MAX_TOKENS)

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          {shown.length === 0 ? (
            <div className="token-empty">Type something above to see its embeddings.</div>
          ) : (
            <div className="embed-rows">
              {shown.map((t) => (
                <VectorRow
                  key={t.index}
                  label={displayToken(t.text)}
                  values={embeddingFor(t, DIMS_SHOWN)}
                />
              ))}
            </div>
          )}
          <div className="embed-legend mono">
            <span><span className="embed-swatch embed-swatch--pos" /> positive</span>
            <span><span className="embed-swatch embed-swatch--neg" /> negative</span>
            <span>intensity = magnitude · showing {DIMS_SHOWN} of thousands of dims</span>
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            A token ID is just an index — it carries no meaning on its own. The model keeps a giant
            lookup table, the <span className="term">embedding matrix</span>, with one learned
            vector per vocabulary entry. Tokenization's IDs select rows from it, turning each token
            into a dense vector of (typically) thousands of numbers. Directions in this space encode
            meaning: tokens used in similar ways end up with similar vectors.
          </p>
          <p>
            But attention is order-blind on its own — it would see the same bag of vectors no matter
            how you shuffled them. So <span className="term">positional information</span> is added,
            telling the model where each token sits in the sequence:
          </p>
          <Tex
            block
            tex="x_i = \mathrm{Embed}(\text{token}_i) + \mathrm{Pos}(i)"
          />
          <Expandable>
            <p>
              Early models used fixed sinusoidal position encodings or a learned position table
              (<span className="term">absolute</span> positions). Most current models use{' '}
              <span className="term">RoPE</span> (rotary position embedding), which instead{' '}
              <em>rotates</em> the query and key vectors by an angle proportional to position inside
              the attention computation. RoPE encodes <em>relative</em> distance and extrapolates to
              longer sequences far better than a fixed table.
            </p>
            <p className="note">
              Illustrative: the vectors above are deterministic stand-ins seeded by each real token
              ID — not a trained model's actual embeddings. They're here to show the shape of the
              data, not specific learned values.
            </p>
          </Expandable>
        </>
      }
    />
  )
}
