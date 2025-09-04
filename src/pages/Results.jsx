import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Results() {
  const navigate = useNavigate()
  const [data, setData] = useState({ answers: [], score: 0, total: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('qa_results')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      setData(parsed)
    } catch {
      // ignore
    }
  }, [])

  const restart = () => {
    localStorage.removeItem('qa_results')
    navigate('/quiz')
  }

  return (
    <div className="stack">
      <div className="card stack">
        <div className="center"><h1 style={{fontSize: '2.5em'}}>You scored {data.score}/{data.total}</h1></div>
        <div className="stack">
          {data.answers.length === 0 && <div className="muted">No results yet. </div>}
          {data.answers.map((a, idx) => (
            <div key={idx} className="stack">
              <div><strong>Q{idx + 1}.</strong> {a.question}</div>
              <div className="options">
                {a.options.map((opt, i) => {
                  const classes = ['option']
                  if (i === a.correctIndex) classes.push('correct')
                  if (a.selectedIndex === i && !a.isCorrect) classes.push('incorrect')
                  return <div key={i} className={classes.join(' ')}>{opt}</div>
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="actions">
          <button onClick={restart} className="grow">Take New Quiz</button>
        </div>
      </div>
    </div>
  )
}


