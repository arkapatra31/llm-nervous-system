import { ENCODING_NAME } from '../lib/tokenizer'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-title">
          <span className="mono footer-mark">{'</>'}</span> inside an LLM
        </p>
        <p className="footer-note">
          An interactive walkthrough of the LLM inference pipeline. Tokenization uses the
          real <code>{ENCODING_NAME}</code> BPE encoding (GPT-3.5/4) in your browser;
          sampling applies real softmax / top-k / top-p math. Embeddings, attention weights,
          and next-token logits are <span className="footer-amber">illustrative</span> —
          shipping a full model client-side isn't practical, so those values are deterministic
          stand-ins seeded by your real tokens.
        </p>
        <a
          className="footer-link"
          href="https://github.com/arkapatra31/llm-nervous-system"
        >
          view source on github →
        </a>
      </div>
    </footer>
  )
}
