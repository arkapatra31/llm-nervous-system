# inside an LLM

An interactive walkthrough of **what happens under the hood when a large language model
receives a query and produces a response.** Type a query and follow it through all eight
stages of the inference pipeline — every stage shows what happened to *your* input.

**Live:** https://arkapatra31.github.io/llm-nervous-system/

## The eight stages

Each stage is its own section: a visualization first, then a separate explanation with a
one-line intuition and an expandable rigorous version (with proper math via KaTeX).

1. **Input & preprocessing** — your text is normalized and wrapped in a chat template with special tokens.
2. **Tokenization** — real `cl100k_base` BPE splits your text into sub-word tokens with integer IDs.
3. **Embedding** — each token ID becomes a vector; positional information is added (absolute vs. RoPE).
4. **Transformer stack** — a causal, multi-head self-attention heatmap over your tokens.
5. **Output projection & logits** — the final hidden state becomes one score per vocabulary token.
6. **Sampling & decoding** — live softmax with **temperature, top-k, and top-p** sliders.
7. **Autoregressive loop** — append the sampled token and repeat; KV cache; stopping conditions.
8. **Post-processing & streaming** — detokenization and token-by-token streaming back to you.

## What's real vs. illustrative

Honesty is a design requirement — every stage carries a badge.

- **Real (computed in your browser):** tokenization/detokenization (`cl100k_base`), and all
  sampling math — softmax, temperature, top-k, top-p.
- **Illustrative (clearly labeled):** embeddings, attention weights, and next-token logits.
  Shipping a full model client-side isn't practical, so these are deterministic stand-ins
  *seeded by your real token IDs*. The attention demo still uses the correct causal mask and
  per-head variation, so its behaviour is faithful.

## Tech

- **Vite + React 18 + TypeScript** (static SPA)
- **gpt-tokenizer** for real in-browser BPE tokenization (no model download)
- **KaTeX** for math notation, **Framer Motion** for transitions
- Hand-built, data-driven visualization components — no charting library, no backend

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # tsc -b && vite build → dist/
npm run preview    # preview the production build
```

## Deploy (GitHub Pages)

Automated via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

1. Repo **Settings → Pages → Build and deployment** → set **Source** to **GitHub Actions**.
2. Push to `main`. The workflow builds and publishes `dist/` to Pages.

The Vite `base` is `/llm-nervous-system/` for production builds (see [vite.config.ts](vite.config.ts));
update it there if you rename the repo.
