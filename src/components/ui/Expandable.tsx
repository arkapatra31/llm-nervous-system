import { useState, type ReactNode } from 'react'

// The "rigorous" register: collapsed by default, expandable. Keeps the one-line
// intuition and the deep explanation visually distinct (per CLAUDE.md copy rules).
export function Expandable({
  label = 'The rigorous version',
  children,
}: {
  label?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`expandable ${open ? 'expandable--open' : ''}`}>
      <button
        className="expandable-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="expandable-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {label}
      </button>
      {open && <div className="expandable-body">{children}</div>}
    </div>
  )
}
