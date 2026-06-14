// Tiny pub/sub so the hero (or any component) can pulse the 3D scene
// when the query changes — without prop-drilling into the WebGL tree.
type Listener = (intensity: number) => void
const listeners = new Set<Listener>()

export function pulse(intensity = 1) {
  listeners.forEach((fn) => fn(intensity))
}

export function onPulse(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
