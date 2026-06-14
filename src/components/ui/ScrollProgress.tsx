import { motion, useScroll, useSpring } from 'framer-motion'
import './ScrollProgress.css'

// A thin gradient bar pinned to the top, scaling with page scroll.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
