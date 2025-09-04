import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const decodeHtml = (str) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

const buildApiUrl = (amount, difficulty) => {
  const params = new URLSearchParams({ amount: String(amount), type: 'multiple' })
  if (difficulty && difficulty !== 'any') params.set('difficulty', difficulty)
  return `https://opentdb.com/api.php?${params.toString()}`
}

export default function Quiz() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('qa_difficulty') || 'any')
  const [amount, setAmount] = useState(() => Number(localStorage.getItem('qa_amount')) || 10)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [answers, setAnswers] = useState([]) // { question, options, correctIndex, selectedIndex, isCorrect }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(30)
  const [timerActive, setTimerActive] = useState(true)

  const progressPct = useMemo(() => {
    if (!questions.length) return 0
    return Math.round(((currentIndex) / questions.length) * 100)
  }, [currentIndex, questions.length])

  useEffect(() => {
    localStorage.setItem('qa_difficulty', difficulty)
    localStorage.setItem('qa_amount', String(amount))
  }, [difficulty, amount])

  useEffect(() => {
    let cancelled = false
    const fetchQuestions = async () => {
      // Check if we have stored questions from previous quiz (only for restart)
      const storedResults = localStorage.getItem('qa_results')
      const isRestart = new URLSearchParams(window.location.search).get('restart') === 'true'
      
      if (storedResults && !isRestart) {
        try {
          const parsed = JSON.parse(storedResults)
          if (parsed.answers && parsed.answers.length > 0) {
            // Reconstruct questions from stored answers
            const reconstructedQuestions = parsed.answers.map(answer => ({
              question: answer.question,
              options: answer.options,
              correctIndex: answer.correctIndex
            }))
            setQuestions(reconstructedQuestions)
            setCurrentIndex(0)
            setSelectedIndex(null)
            setAnswers([])
            setTimer(30)
            setTimerActive(true)
            setLoading(false)
            return
          }
        } catch (e) {
          // If parsing fails, continue with API fetch
        }
      }

      setLoading(true)
      setError('')
      try {
        const url = buildApiUrl(amount, difficulty)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (cancelled) return
        if (!data.results || data.results.length < 5) throw new Error('Not enough questions from API')
        const normalized = data.results.slice(0, Math.min(10, data.results.length)).map((q) => {
          const options = [...q.incorrect_answers, q.correct_answer]
            .map(decodeHtml)
            .sort(() => Math.random() - 0.5)
          const correctIndex = options.indexOf(decodeHtml(q.correct_answer))
          return {
            question: decodeHtml(q.question),
            options,
            correctIndex,
          }
        })
        setQuestions(normalized)
        setCurrentIndex(0)
        setSelectedIndex(null)
        setAnswers([])
        setTimer(30)
        setTimerActive(true)
      } catch (e) {
        setError(e.name === 'AbortError' ? 'Request timed out' : e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
    return () => { cancelled = true }
  }, [amount, difficulty])

  useEffect(() => {
    if (!questions.length || !timerActive) return
    if (timer <= 0) {
      setTimerActive(false)
      handleLockAnswer(null) // auto-lock as skipped
      return
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer, questions.length, timerActive])

  const current = questions[currentIndex]

  const handleLockAnswer = (forcedIndex) => {
    if (!current) return
    const chosen = forcedIndex ?? selectedIndex
    const isCorrect = chosen !== null && chosen === current.correctIndex
    const entry = {
      question: current.question,
      options: current.options,
      correctIndex: current.correctIndex,
      selectedIndex: chosen,
      isCorrect,
    }
    const nextAnswers = [...answers, entry]
    setAnswers(nextAnswers)
    setSelectedIndex(null)
    setTimerActive(false)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
      setTimer(30)
      setTimerActive(true)
    } else {
      const score = nextAnswers.filter(a => a.isCorrect).length
      localStorage.setItem('qa_results', JSON.stringify({ answers: nextAnswers, score, total: questions.length }))
      navigate('/results')
    }
  }

  const handleSkip = () => handleLockAnswer(null)

  if (loading) return <div className="center">Loading questions…</div>
  if (error) return (
    <div className="stack">
      <div className="card">{error}</div>
      <div className="row">
        <button className="grow" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  )
  if (!current) return <div className="center">No questions. Try again later.</div>

  return (
    <div className="stack">
      <div className="row">
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty" className="grow">
          <option value="any">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Amount" className="grow">
          {[5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} questions</option>)}
        </select>
      </div>
      <div className="spaced">
        <div className="muted">Question {currentIndex + 1} of {questions.length}</div>
        <div className="muted">Time: {timer}s</div>
      </div>
      <div className="progress"><span style={{ width: `${progressPct}%` }} /></div>
      <div className="card stack">
        <div className="question">{current.question}</div>
        <div className="options">
          {current.options.map((opt, i) => (
            <button
              key={i}
              className={`option ${selectedIndex === i ? 'selected' : ''}`}
              aria-pressed={selectedIndex === i}
              onClick={() => setSelectedIndex(i)}
            >{opt}</button>
          ))}
        </div>
        <div className="actions">
          <button onClick={() => window.location.reload()} className="grow">Restart</button>
          <button onClick={() => { if (currentIndex>0) { setCurrentIndex(currentIndex-1); setTimer(30); setTimerActive(true) } }} disabled={currentIndex===0} className="grow">Previous</button>
          <button onClick={handleSkip} className="grow">Skip</button>
          <button disabled={selectedIndex === null} onClick={() => handleLockAnswer()} className="grow">{currentIndex + 1 === questions.length ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </div>
  )
}


