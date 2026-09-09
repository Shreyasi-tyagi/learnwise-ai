import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { api } from '../services/api'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function RoadmapPage() {
  const [level, setLevel] = useState('Beginner')
  const [goal, setGoal] = useState('')
  const [studyTime, setStudyTime] = useState('')
  const [roadmaps, setRoadmaps] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const active = roadmaps.find((item) => item.id === activeId) || null

  async function loadRoadmaps() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/learning/roadmap')
      const list = response.data.roadmaps || []
      setRoadmaps(list)
      setActiveId((current) => current || list[0]?.id || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your roadmaps right now.')
    } finally {
      setLoading(false)
    }
  }

  async function loadProgress() {
    try {
      const response = await api.get('/learning/progress')
      const map = {}
      for (const item of response.data.progress || []) {
        if (item.category === 'roadmap') {
          map[item.itemKey] = item.status
        }
      }
      setProgress(map)
    } catch {
      // progress is supplementary here, fail quietly
    }
  }

  useEffect(() => {
    loadRoadmaps()
    loadProgress()
  }, [])

  async function handleGenerate(event) {
    event.preventDefault()
    if (!goal.trim() || !studyTime.trim()) return
    setGenerating(true)
    setError('')
    try {
      const response = await api.post('/learning/roadmap', { level, goal, studyTime })
      setRoadmaps((prev) => [response.data.roadmap, ...prev])
      setActiveId(response.data.roadmap.id)
      setGoal('')
      setStudyTime('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to generate a roadmap right now.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id) {
    const previous = roadmaps
    setRoadmaps((prev) => prev.filter((item) => item.id !== id))
    if (activeId === id) {
      setActiveId(null)
    }
    try {
      await api.delete(`/learning/roadmap/${id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete that roadmap.')
      setRoadmaps(previous)
    }
  }

  async function toggleStep(roadmapId, index, title) {
    const itemKey = `${roadmapId}:${index}`
    const wasDone = progress[itemKey] === 'completed'
    const nextStatus = wasDone ? 'pending' : 'completed'
    setProgress((prev) => ({ ...prev, [itemKey]: nextStatus }))
    try {
      await api.post('/learning/progress', {
        category: 'roadmap',
        itemKey,
        label: title,
        status: nextStatus,
      })
    } catch {
      setProgress((prev) => ({ ...prev, [itemKey]: wasDone ? 'completed' : 'pending' }))
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Personalized Roadmap</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Generate a structured path that adapts to level, goal, and time commitment, then track it here.
        </p>
      </div>

      <Card>
        <form onSubmit={handleGenerate} className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Level</label>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Goal</label>
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="e.g. Learn React"
              className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Study time</label>
            <input
              value={studyTime}
              onChange={(event) => setStudyTime(event.target.value)}
              placeholder="e.g. 5 hrs/week"
              className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button type="submit" disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">{active ? active.goal : 'Current path'}</h2>
            {active ? <Badge>{active.level}</Badge> : null}
          </div>

          {!loading && !active ? (
            <p className="mt-4 text-sm text-ink-muted">Generate a roadmap above to see your path here.</p>
          ) : null}

          <div className="mt-4 space-y-2">
            {(active?.steps || []).map((stepItem, index) => {
              const step = typeof stepItem === 'string' ? { title: stepItem, focus: '' } : stepItem;
              const itemKey = `${active.id}:${index}`
              const done = progress[itemKey] === 'completed'
              return (
                <button
                  key={itemKey}
                  type="button"
                  onClick={() => toggleStep(active.id, index, step.title)}
                  className="flex w-full items-start gap-3 rounded-xl border border-line bg-bg p-3 text-left transition-colors hover:bg-surface"
                >
                  {done ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
                  ) : (
                    <Circle size={18} className="mt-0.5 shrink-0 text-ink-faint" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-ink-muted line-through' : 'text-ink'}`}>{step.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{step.focus}</p>
                    {step.recommendedResources ? (
                      <p className="mt-1 text-xs text-ink-faint">Try: {step.recommendedResources.join(', ')}</p>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">History</h2>
          <div className="mt-3 space-y-2">
            {!loading && roadmaps.length === 0 ? <p className="text-sm text-ink-muted">No roadmaps yet.</p> : null}
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-sm ${
                  roadmap.id === activeId ? 'border-accent bg-accent-soft' : 'border-line bg-bg'
                }`}
              >
                <button type="button" onClick={() => setActiveId(roadmap.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-medium text-ink">{roadmap.goal}</p>
                  <p className="text-xs text-ink-muted">
                    {roadmap.level} · {roadmap.studyTime}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(roadmap.id)}
                  className="shrink-0 text-ink-faint transition-colors hover:text-danger"
                  aria-label="Delete roadmap"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
