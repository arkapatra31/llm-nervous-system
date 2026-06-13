// Real tokenization using gpt-tokenizer (GPT cl100k_base BPE — the encoding
// used by GPT-3.5/4). Token boundaries and IDs are genuine, not faked.
import { encode, decode } from 'gpt-tokenizer'

export interface Token {
  /** position in the sequence, 0-indexed */
  index: number
  /** the integer vocabulary ID */
  id: number
  /** the exact text this token covers (may include a leading space) */
  text: string
}

export const ENCODING_NAME = 'cl100k_base'

export function tokenize(text: string): Token[] {
  if (!text) return []
  // allowedSpecial: 'all' so strings containing markers like <|im_start|>
  // encode to their real special-token IDs instead of throwing.
  const ids = encode(text, { allowedSpecial: 'all' })
  return ids.map((id, index) => ({
    index,
    id,
    // decode each id on its own to recover the exact sub-word piece
    text: decode([id]),
  }))
}

/** Render a token's whitespace visibly so boundaries are unambiguous. */
export function displayToken(text: string): string {
  return text.replace(/ /g, '␣').replace(/\n/g, '⏎')
}
