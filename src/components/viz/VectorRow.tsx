import './viz.css'

// Reusable vector visualization: each dimension is a cell whose colour encodes
// sign (violet +, cyan −) and whose intensity encodes magnitude.
export function VectorRow({ values, label }: { values: number[]; label?: string }) {
  return (
    <div className="vecrow">
      {label && <span className="vecrow-label mono">{label}</span>}
      <div className="vecrow-cells">
        {values.map((v, i) => (
          <span
            key={i}
            className="vecrow-cell mono"
            style={{
              ['--pos' as string]: v >= 0 ? 1 : 0,
              ['--mag' as string]: Math.min(1, Math.abs(v)),
            }}
            title={v.toFixed(3)}
          >
            {v >= 0 ? '+' : ''}
            {v.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  )
}
