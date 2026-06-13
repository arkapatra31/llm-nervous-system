import { useEffect, useState } from 'react'
import { STAGES } from '../lib/stages'
import './Nav.css'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('top')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['top', ...STAGES.map((s) => s.id)]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <a href="#top" className="nav-brand">
        <span className="nav-brand-mark mono">{'</>'}</span>
        inside an LLM
      </a>

      <nav className="nav-stages" aria-label="pipeline stages">
        {STAGES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`nav-stage ${active === s.id ? 'nav-stage--active' : ''}`}
            title={s.title}
          >
            <span className="nav-stage-num mono">{String(s.num).padStart(2, '0')}</span>
            <span className="nav-stage-title">{s.title}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
