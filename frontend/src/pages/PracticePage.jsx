import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { generatePractice, submitPractice } from '../services/api'
import { CheckCircle, XCircle } from 'lucide-react'

export default function PracticePage() {
  const [mode, setMode] = useState('initial') // initial | practicing | result
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [practiceId, setPracticeId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([]) // index of selected option

  const [resultData, setResultData] = useState(null) // score, percentage, results

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const data = await generatePractice()
      setPracticeId(data.practiceId)
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(null))
      setMode('practicing')
    } catch (err) {
      if (err.response?.status === 429 || err.response?.status === 503) {
        setError('The AI is currently busy. Please wait a moment and try again.')
      } else {
        setError('Failed to generate practice questions. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (answers.includes(null)) return

    setLoading(true)
    setError('')
    try {
      const data = await submitPractice(practiceId, answers)
      setResultData(data)
      setMode('result')
    } catch (err) {
      setError('Failed to submit practice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectOption(qIndex, oIndex) {
    const newAnswers = [...answers]
    newAnswers[qIndex] = oIndex
    setAnswers(newAnswers)
  }

  function handleReset() {
    setMode('initial')
    setPracticeId(null)
    setQuestions([])
    setAnswers([])
    setResultData(null)
    setError('')
  }

  const allAnswered = answers.every(a => a !== null)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Practice Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Test your knowledge with AI-generated MCQs based on your roadmap progress.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {mode === 'initial' && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-xl font-semibold text-ink mb-2">Ready to Practice?</h2>
          <p className="text-ink-muted mb-6">
            Generate a personalized 5-question multiple choice quiz based on what you've learned so far.
          </p>
          <Button onClick={handleGenerate} disabled={loading} className="px-8 py-3">
            {loading ? 'Generating questions...' : 'Generate Practice'}
          </Button>
        </Card>
      )}

      {mode === 'practicing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card border border-line rounded-xl px-4 py-3">
            <span className="font-semibold text-ink">Quiz in Progress</span>
            <span className="text-sm text-ink-muted">
              {answers.filter(a => a !== null).length} / {questions.length} Answered
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <Card key={q._id}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase text-accent tracking-wider">{q.topic}</span>
                  <h3 className="text-lg font-semibold text-ink mt-1">
                    {qIndex + 1}. {q.question}
                  </h3>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = answers[qIndex] === oIndex
                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelectOption(qIndex, oIndex)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent font-medium'
                            : 'border-line bg-bg hover:bg-surface text-ink'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading || !allAnswered} className="px-8 py-3">
              {loading ? 'Submitting...' : 'Submit Practice'}
            </Button>
          </div>
        </div>
      )}

      {mode === 'result' && resultData && (
        <div className="space-y-6">
          <Card className="text-center p-8">
            <h2 className="text-2xl font-bold text-ink mb-2">Practice Complete!</h2>
            <div className="text-5xl font-heading font-black text-accent my-4">
              {resultData.percentage}%
            </div>
            <p className="text-ink-muted">
              You scored {resultData.score} out of {resultData.totalQuestions} correctly.
            </p>
            <Button onClick={handleReset} className="mt-6">
              Generate New Practice
            </Button>
          </Card>

          <div className="space-y-6">
            {resultData.results.map((res, index) => {
              const isCorrect = res.isCorrect
              return (
                <Card key={res._id} className={isCorrect ? 'border-success/50' : 'border-danger/50'}>
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="text-success shrink-0 mt-0.5" size={20} />
                    ) : (
                      <XCircle className="text-danger shrink-0 mt-0.5" size={20} />
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{res.topic}</span>
                      <h3 className="text-lg font-semibold text-ink mt-1">
                        {index + 1}. {res.question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 ml-8 mb-4">
                    {res.options.map((opt, oIndex) => {
                      const isUserAnswer = res.userAnswer === oIndex
                      const isActualCorrect = res.correctAnswer === oIndex
                      
                      let btnClass = 'border-line bg-bg text-ink/50'
                      if (isActualCorrect) {
                        btnClass = 'border-success bg-success/10 text-success font-medium'
                      } else if (isUserAnswer && !isActualCorrect) {
                        btnClass = 'border-danger bg-danger/10 text-danger font-medium'
                      }

                      return (
                        <div key={oIndex} className={`w-full text-left p-3 rounded-lg border ${btnClass}`}>
                          {opt} {isUserAnswer && '(Your Answer)'} {isActualCorrect && '(Correct Answer)'}
                        </div>
                      )
                    })}
                  </div>

                  <div className="ml-8 p-4 rounded-xl bg-surface border border-line text-sm text-ink">
                    <span className="font-semibold block mb-1">Explanation:</span>
                    {res.explanation}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
