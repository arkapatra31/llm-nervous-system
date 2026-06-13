// Real decoding math: softmax with temperature, top-k and top-p (nucleus)
// filtering. Operates on whatever logits it is given. In this site the logits
// for the *next* token are illustrative (we don't ship a model), but every
// transformation below is the genuine algorithm.

export interface Candidate {
  token: string
  logit: number
  /** probability after the current temperature / top-k / top-p settings */
  prob: number
  /** true if this candidate survived top-k / top-p filtering */
  kept: boolean
}

export interface DecodeParams {
  temperature: number
  topK: number // 0 = disabled
  topP: number // 1 = disabled
}

/** Numerically stable softmax with temperature scaling. */
export function softmax(logits: number[], temperature: number): number[] {
  const t = Math.max(1e-6, temperature)
  const scaled = logits.map((l) => l / t)
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/**
 * Apply temperature, then top-k, then top-p to a list of (token, logit) pairs.
 * Returns candidates sorted by probability, with `kept` marking survivors and
 * `prob` renormalized over the surviving set (as real decoders do).
 */
export function decode(
  raw: { token: string; logit: number }[],
  params: DecodeParams
): Candidate[] {
  const { temperature, topK, topP } = params
  const probs = softmax(
    raw.map((r) => r.logit),
    temperature
  )

  // sort by probability, descending
  const ranked = raw
    .map((r, i) => ({ ...r, prob: probs[i] }))
    .sort((a, b) => b.prob - a.prob)

  // top-k: keep only the k highest
  const afterK = ranked.map((c, i) => ({
    ...c,
    kept: topK > 0 ? i < topK : true,
  }))

  // top-p (nucleus): keep the smallest set whose cumulative prob >= p
  let cumulative = 0
  let nucleusClosed = false
  const afterP = afterK.map((c) => {
    if (!c.kept) return c
    if (nucleusClosed) return { ...c, kept: false }
    cumulative += c.prob
    if (cumulative >= topP) nucleusClosed = true
    return c
  })

  // renormalize probability over survivors
  const keptSum = afterP.filter((c) => c.kept).reduce((s, c) => s + c.prob, 0) || 1
  return afterP.map((c) => ({
    ...c,
    prob: c.kept ? c.prob / keptSum : 0,
  }))
}
