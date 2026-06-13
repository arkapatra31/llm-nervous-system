# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

An educational website that visualizes **what happens under the hood when an LLM receives a query and produces a response**. The site walks a user's input through every stage of the inference pipeline with interactive, step-by-step visualizations. Goal: make the internals legible to a curious non-expert without dumbing down the mechanics.

The pipeline we explain and visualize (this is the canonical stage list — keep UI, copy, and routes aligned to it):

1. **Input & preprocessing** — raw text, normalization, special tokens, chat template / role formatting.
2. **Tokenization** — BPE/subword splitting, token IDs, vocabulary lookup. Show the actual token boundaries for the user's typed text.
3. **Embedding** — token IDs → vectors; positional encoding (absolute vs. RoPE).
4. **Transformer stack** — per-layer: self-attention (Q/K/V, attention scores, multi-head), residual connections, layer norm, feed-forward / MLP. Show attention as a heatmap over tokens.
5. **Output projection & logits** — final hidden state → vocabulary logits.
6. **Sampling / decoding** — softmax → probabilities; temperature, top-k, top-p, greedy. Show the candidate distribution for the next token.
7. **Autoregressive loop** — append sampled token, repeat; KV cache; stopping conditions (EOS, max tokens).
8. **Post-processing & streaming** — detokenization, streaming tokens back to the client.

Each stage = one section/route with: a plain-language explanation, an interactive widget, and a "what just happened to *your* input" panel driven by the user's own query.

## Tech stack

- Framework: Vite + React 18 (static SPA; deploys to GitHub Pages)
- Language: TypeScript (strict)
- Styling: plain CSS with design tokens in `src/index.css` + colocated per-component `.css`. No CSS framework — keep it that way unless flagged.
- Visualization: hand-built data-driven components (`src/components/viz/`: `TokenStrip`, `AttentionHeatmap`, `ProbabilityBars`, `VectorRow`) using SVG/DOM + CSS. Framer Motion for stage reveals/transitions. No D3 — the viz needs were simple enough not to warrant it; flag before adding any viz library.
- Math: KaTeX (via the `Tex` component in `src/components/ui/Tex.tsx`). Note: named `Tex`, not `Math`, to avoid shadowing the global `Math`.
- Tokenizer in-browser: `gpt-tokenizer` (pure-JS `cl100k_base` BPE — GPT-3.5/4). Real, no model download, no WASM. Wrapper in `src/lib/tokenizer.ts` (encodes with `allowedSpecial: 'all'` so special tokens never throw).

Architecture: a single shared `QueryProvider` (`src/context/QueryContext.tsx`) holds the query and its real tokens; every stage reads from `useQuery()`. The canonical stage list lives in `src/lib/stages.ts`. Each stage in `src/components/stages/` renders `<Stage meta viz explanation />` — visualization first, explanation second.

## Commands

- Dev server: `npm run dev`
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: _none yet — no test runner configured._

Always run lint + typecheck before considering a task done.

## Architecture conventions

- **One stage, one self-contained module.** Each pipeline stage lives in its own component/route with its explanation copy colocated. Stages must be navigable independently and in sequence.
- **Real over fake where feasible.** Tokenization and sampling math should be computed for real in-browser. Transformer internals (attention weights) can be illustrative/simulated when running a full model client-side isn't practical — but clearly label anything simulated vs. real.
- **Single source of truth for the user's query.** The typed query flows through a shared store/context so every stage can show what happened to *that specific input*. Don't duplicate query state per component.
- **Visualizations are data-driven and reusable.** Heatmap, probability-bar, and token-strip components take data as props; no hardcoded example baked into the chart component.
- **Accuracy is a hard requirement.** This site teaches. Do not simplify in ways that become wrong. If a simplification is pedagogically necessary, annotate it in the UI as a simplification.

## Content/copy rules

- Two registers per stage: a one-line intuition and an expandable rigorous explanation. Don't blur them.
- Define jargon on first use (tokenizer, logit, softmax, KV cache, RoPE, etc.).
- Math: render with proper notation (KaTeX/MathJax) rather than ASCII approximations.

## Do / Don't

- DO keep the canonical 8-stage list above in sync across routes, nav, and copy.
- DO label simulated vs. real computation explicitly in the UI.
- DON'T introduce a new viz library without flagging it — consolidate on the chosen one.
- DON'T sacrifice technical correctness for a cleaner animation.
- DON'T hardcode example queries into reusable components.

## Decisions (were open questions)

- **Tokenizer/model family:** GPT-style BPE, `cl100k_base` (GPT-3.5/4), via `gpt-tokenizer`. Token boundaries and IDs shown are real. Positional encoding is explained conceptually (absolute vs. RoPE) rather than computed.
- **Real model inference client-side:** No. Shipping a model isn't practical for static Pages. So:
  - **Real:** tokenization/detokenization (`cl100k_base`), and all sampling/decoding math (softmax, temperature, top-k, top-p).
  - **Illustrative (labeled in UI with an amber badge + a `.note`):** embeddings, attention weights, and next-token logits — deterministic stand-ins seeded by the user's real token IDs, in `src/lib/illustrative.ts`. Attention uses the correct causal mask and per-head variation, so behaviour is faithful even though values aren't a trained model's.
- Per-stage fidelity is declared in `src/lib/stages.ts` (`fidelity: 'real' | 'illustrative'`) and surfaced as the badge. Keep that flag honest if a stage's data source changes.