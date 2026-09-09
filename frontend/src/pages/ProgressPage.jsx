import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { api } from '../services/api'

export default function ProgressPage() {
  const [summary, setSummary] = useState({})
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProgress() {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, itemsRes] = await Promise.all([
        api.get('/learning/progress/summary'),
        api.get('/learning/progress'),
      ])
      setSummary(summaryRes.data.summary || {})
      setItems(itemsRes.data.progress || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load progress right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProgress()
  }, [])

  const categories = Object.keys(summary)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Progress</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">Your learning completion by category, and the most recent activity.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {!loading && categories.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">No progress recorded yet. Check off roadmap steps to start tracking.</p>
        </Card>
      ) : null}

      {categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const stats = summary[category]
            const completed = stats.completed || 0
            const total = stats.total || 0
            const percent = total ? Math.round((completed / total) * 100) : 0
            return (
              <Card key={category}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold capitalize text-ink">{category}</h2>
                  <Badge>
                    {completed} / {total} done
                  </Badge>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
                </div>
              </Card>
            )
          })}
        </div>
      ) : null}

      <Card>
        <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
        <div className="mt-3 space-y-2">
          {!loading && items.length === 0 ? <p className="text-sm text-ink-muted">Nothing tracked yet.</p> : null}
          {items.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-bg p-3 text-sm">
              {item.status === 'completed' ? (
                <CheckCircle2 size={16} className="shrink-0 text-accent" />
              ) : (
                <Circle size={16} className="shrink-0 text-ink-faint" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-ink">{item.label || item.itemKey}</p>
                <p className="text-xs capitalize text-ink-muted">
                  {item.category} · {item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
