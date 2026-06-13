import { useMemo, useState } from 'react'
import { Stage } from '../Stage'
import { Expandable } from '../ui/Expandable'
import { Tex } from '../ui/Tex'
import { ProbabilityBars } from '../viz/ProbabilityBars'
import { decode } from '../../lib/sampling'
import { nextTokenLogits } from '../../lib/illustrative'
import { useQuery } from '../../context/QueryContext'
import { STAGES } from '../../lib/stages'
import './stages.css'

export function Stage6Sampling() {
  const { tokens } = useQuery()
  const meta = STAGES[5]
  const [temperature, setTemperature] = useState(0.8)
  const [topK, setTopK] = useState(0)
  const [topP, setTopP] = useState(1)

  const raw = useMemo(() => nextTokenLogits(tokens), [tokens])
  const candidates = useMemo(
    () => decode(raw, { temperature, topK, topP }),
    [raw, temperature, topK, topP]
  )
  const kept = candidates.filter((c) => c.kept).length

  return (
    <Stage
      meta={meta}
      visualization={
        <div>
          <ProbabilityBars candidates={candidates} rows={12} />

          <div className="sampling-controls">
            <Control
              label="temperature"
              value={temperature.toFixed(2)}
              hint="flatten / sharpen"
            >
              <input
                type="range"
                min={0.1}
                max={1.5}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </Control>
            <Control label="top-k" value={topK === 0 ? 'off' : String(topK)} hint="keep k best">
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
              />
            </Control>
            <Control label="top-p" value={topP.toFixed(2)} hint="nucleus mass">
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
              />
            </Control>
          </div>
          <div className="sampling-status mono">
            {kept} of {candidates.length} candidates survive · the next token is drawn from the
            highlighted set
          </div>
        </div>
      }
      explanation={
        <>
          <p>
            Logits become probabilities through the <span className="term">softmax</span> function,
            scaled by <span className="term">temperature</span> <Tex tex="T" />:
          </p>
          <Tex
            block
            tex="P(t_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}"
          />
          <p>
            Low <Tex tex="T" /> sharpens the distribution toward the single most likely token
            (at the limit, <span className="term">greedy</span> decoding); high <Tex tex="T" />{' '}
            flattens it, giving rarer tokens a real chance. Try the slider — the bars above are the
            genuine softmax of the logits.
          </p>
          <p>
            <span className="term">Top-k</span> keeps only the <Tex tex="k" /> highest-probability
            tokens; <span className="term">top-p</span> (nucleus) keeps the smallest set whose
            probabilities sum to at least <Tex tex="p" />. Survivors are renormalized and one token
            is sampled from them. Dimmed bars below the cutoff have been filtered out.
          </p>
          <Expandable>
            <p>
              These truncation methods exist to cut the long tail of low-probability garbage while
              preserving variety where the model is genuinely uncertain. Top-p adapts to the
              distribution's shape — it keeps few tokens when the model is confident and many when
              it isn't — which is why it's usually preferred over a fixed top-k. They compose:
              top-k then top-p then temperature is a common pipeline.
            </p>
            <p className="note">
              The softmax, temperature, top-k, and top-p math here is real and runs live. The
              underlying logits are illustrative (seeded by your tokens), since we don't ship a
              model — but every transformation applied to them is the actual algorithm.
            </p>
          </Expandable>
        </>
      }
    />
  )
}

function Control({
  label,
  value,
  hint,
  children,
}: {
  label: string
  value: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label mono">{label}</span>
        <span className="control-value mono">{value}</span>
      </div>
      {children}
      <span className="control-hint">{hint}</span>
    </div>
  )
}
