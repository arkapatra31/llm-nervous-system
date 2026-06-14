import { useEffect, useRef } from 'react'
import './Cursor.css'

// A custom two-part cursor: a precise dot + a trailing ring that grows over
// interactive elements. Hidden on touch / coarse-pointer devices.
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ring = { x: pos.x, y: pos.y }
    let raf = 0
    let hovering = false

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      }
      const t = e.target as HTMLElement
      const interactive = !!t.closest('a, button, input, textarea, [data-cursor]')
      if (interactive !== hovering) {
        hovering = interactive
        ringRef.current?.classList.toggle('cursor-ring--hover', hovering)
      }
    }
    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.18
      ring.y += (pos.y - ring.y) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
