import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Loader.css'

// A brief branded intro: counts to 100 while the scene warms up, then lifts away.
export function Loader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let v = 0
    const id = setInterval(() => {
      v = Math.min(100, v + Math.round(6 + Math.random() * 14))
      setPct(v)
      if (v >= 100) {
        clearInterval(id)
        setTimeout(() => setDone(true), 420)
      }
    }, 130)
    return () => clearInterval(id)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loader-inner">
            <div className="loader-mark mono">
              <span className="grad-text">{'</>'}</span> inside an llm
            </div>
            <div className="loader-bar">
              <motion.div
                className="loader-fill"
                animate={{ width: `${pct}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <div className="loader-pct mono">{String(pct).padStart(3, '0')}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
