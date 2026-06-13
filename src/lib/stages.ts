// Canonical 8-stage pipeline — the single source of truth.
// Nav, section anchors, and copy all derive from this list (per CLAUDE.md).

export interface StageMeta {
  id: string
  num: number
  title: string
  /** one-line intuition shown in nav + section header */
  intuition: string
  /** whether the visualization is computed for real or illustrative */
  fidelity: 'real' | 'illustrative'
}

export const STAGES: StageMeta[] = [
  {
    id: 'input',
    num: 1,
    title: 'Input & preprocessing',
    intuition: 'Your raw text is wrapped in the structure the model expects.',
    fidelity: 'real',
  },
  {
    id: 'tokenization',
    num: 2,
    title: 'Tokenization',
    intuition: 'Text is split into sub-word tokens, each with an integer ID.',
    fidelity: 'real',
  },
  {
    id: 'embedding',
    num: 3,
    title: 'Embedding',
    intuition: 'Each token ID becomes a vector, plus its position in the sequence.',
    fidelity: 'illustrative',
  },
  {
    id: 'transformer',
    num: 4,
    title: 'Transformer stack',
    intuition: 'Layers of self-attention let every token read every other token.',
    fidelity: 'illustrative',
  },
  {
    id: 'logits',
    num: 5,
    title: 'Output projection & logits',
    intuition: 'The final vector is projected to one score per vocabulary token.',
    fidelity: 'illustrative',
  },
  {
    id: 'sampling',
    num: 6,
    title: 'Sampling & decoding',
    intuition: 'Scores become probabilities; one next token is chosen.',
    fidelity: 'real',
  },
  {
    id: 'autoregressive',
    num: 7,
    title: 'Autoregressive loop',
    intuition: 'Append the token and repeat — the answer grows one token at a time.',
    fidelity: 'illustrative',
  },
  {
    id: 'streaming',
    num: 8,
    title: 'Post-processing & streaming',
    intuition: 'Tokens are turned back into text and streamed to your screen.',
    fidelity: 'real',
  },
]
