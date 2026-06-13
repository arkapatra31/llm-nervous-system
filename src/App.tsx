import { QueryProvider } from './context/QueryContext'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { Stage1Input } from './components/stages/Stage1Input'
import { Stage2Tokenization } from './components/stages/Stage2Tokenization'
import { Stage3Embedding } from './components/stages/Stage3Embedding'
import { Stage4Transformer } from './components/stages/Stage4Transformer'
import { Stage5Logits } from './components/stages/Stage5Logits'
import { Stage6Sampling } from './components/stages/Stage6Sampling'
import { Stage7Autoregressive } from './components/stages/Stage7Autoregressive'
import { Stage8Streaming } from './components/stages/Stage8Streaming'

export default function App() {
  return (
    <QueryProvider>
      <div className="aurora" aria-hidden="true">
        <div className="aurora-3" />
      </div>
      <Nav />
      <main>
        <Hero />
        <Stage1Input />
        <Stage2Tokenization />
        <Stage3Embedding />
        <Stage4Transformer />
        <Stage5Logits />
        <Stage6Sampling />
        <Stage7Autoregressive />
        <Stage8Streaming />
      </main>
      <Footer />
    </QueryProvider>
  )
}
