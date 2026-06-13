// Deterministic, illustrative data derived from the user's real tokens.
// These stand in for values a real model would compute (embeddings, attention
// weights, next-token logits). They are seeded by the actual token IDs so the
// visuals are stable for a given query and genuinely react to the user's input.
// Everything here is clearly labeled "illustrative" in the UI.

import type { Token } from './tokenizer'

/** Small fast PRNG (mulberry32) for reproducible pseudo-randomness. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** An embedding vector for a token, in [-1, 1], seeded by its ID. */
export function embeddingFor(token: Token, dims: number): number[] {
  const rand = mulberry32(token.id * 2654435761)
  return Array.from({ length: dims }, () => rand() * 2 - 1)
}

/**
 * Causal self-attention weights: a [n x n] matrix where row i is how much
 * token i attends to each token j. Masked so a token only attends to itself
 * and earlier tokens (j <= i) — the accurate pattern for a decoder-only LM.
 * Each row is a softmax, so it sums to 1.
 */
export function attentionMatrix(tokens: Token[], head = 0): number[][] {
  const n = tokens.length
  const matrix: number[][] = []
  for (let i = 0; i < n; i++) {
    const rand = mulberry32((tokens[i].id + 1) * (head + 7) * 40503)
    const scores: number[] = []
    for (let j = 0; j <= i; j++) {
      // base affinity + recency bias + a token-pair term
      const recency = 1 - (i - j) / (n + 1)
      const pair = mulberry32((tokens[i].id ^ tokens[j].id) + head * 131)()
      scores[j] = rand() * 0.7 + recency * 0.8 + pair * 0.5
    }
    // softmax over allowed positions
    const max = Math.max(...scores)
    const exps = scores.map((s) => Math.exp(s - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    const row = new Array(n).fill(0)
    for (let j = 0; j <= i; j++) row[j] = exps[j] / sum
    matrix.push(row)
  }
  return matrix
}

// A pool of plausible continuation tokens with baseline logits. The actual set
// shown is perturbed by the query's final token, so it shifts with the input.
const CONTINUATION_POOL: { token: string; base: number }[] = [
  { token: ' the', base: 5.6 },
  { token: ' a', base: 5.1 },
  { token: ' to', base: 4.7 },
  { token: ' is', base: 4.4 },
  { token: ' and', base: 4.2 },
  { token: ' of', base: 4.0 },
  { token: ' in', base: 3.7 },
  { token: ' that', base: 3.4 },
  { token: ' it', base: 3.0 },
  { token: ' model', base: 2.7 },
  { token: ' your', base: 2.3 },
  { token: ' which', base: 1.9 },
  { token: ' because', base: 1.5 },
  { token: ' token', base: 1.1 },
  { token: ' — ', base: 0.6 },
  { token: ' meaning', base: 0.2 },
]

/**
 * Illustrative next-token logits, perturbed by the last token of the prompt so
 * the distribution responds to the user's query. Real softmax/top-k/top-p math
 * is applied to these downstream.
 */
export function nextTokenLogits(tokens: Token[]): { token: string; logit: number }[] {
  const seed = tokens.length ? tokens[tokens.length - 1].id : 1
  const rand = mulberry32(seed * 22695477)
  return CONTINUATION_POOL.map((c) => ({
    token: c.token,
    logit: c.base + (rand() - 0.5) * 2.6,
  })).sort((a, b) => b.logit - a.logit)
}

// A short, deterministic illustrative continuation, used by the autoregressive
// and streaming stages to demonstrate the loop. Seeded by the prompt's tokens.
export function generateContinuation(tokens: Token[], n: number): string[] {
  const seed = tokens.length ? tokens[tokens.length - 1].id + tokens.length : 7
  const rand = mulberry32(seed * 2246822519)
  const out: string[] = []
  let prev = -1
  for (let s = 0; s < n; s++) {
    let pick = Math.floor(rand() * CONTINUATION_POOL.length)
    if (pick === prev) pick = (pick + 1) % CONTINUATION_POOL.length
    prev = pick
    out.push(CONTINUATION_POOL[pick].token)
  }
  return out
}
