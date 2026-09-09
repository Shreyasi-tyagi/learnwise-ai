import { useEffect, useState } from 'react'
import { Flame, Clock, CheckCircle2, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState({
    roadmaps: [],
    bookmarks: [],
    progressSummary: {},
    progressItems: [],
    latestPractice: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roadmapRes, bookmarksRes, progressRes, progressItemsRes, practiceRes] = await Promise.all([
          api.get('/learning/roadmap'),
          api.get('/learning/bookmarks'),
          api.get('/learning/progress/summary'),
          api.get('/learning/progress'),
          api.get('/learning/practice/latest')
        ])
        
        setData({
          roadmaps: roadmapRes.data.roadmaps || [],
          bookmarks: bookmarksRes.data.bookmarks || [],
          progressSummary: progressRes.data.summary || {},
          progressItems: progressItemsRes.data.progress || [],
          latestPractice: practiceRes.data.practice || null
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentRoadmap = data.roadmaps[0]
  const topicsCompleted = Object.values(data.progressSummary).reduce((acc, curr) => acc + (curr.completed || 0), 0)
  const savedResourcesCount = data.bookmarks.length
  
  let completionPercentage = 0
  if (currentRoadmap && currentRoadmap.steps && currentRoadmap.steps.length > 0) {
    const totalSteps = currentRoadmap.steps.length
    const completedSteps = (data.progressItems || []).filter(
      item => item.category === 'roadmap' && 
              item.itemKey.startsWith(`${currentRoadmap.id}:`) && 
              item.status === 'completed'
    ).length
    completionPercentage = Math.round((completedSteps / totalSteps) * 100)
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen overflow-hidden bg-bg">
        <div className="bg-glow" />
        <main className="relative z-10 w-full max-w-5xl flex-1 px-4 py-6 flex items-center justify-center">
          <p className="text-ink-muted">Loading dashboard...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-bg">
      <div className="bg-glow" />
      <main className="relative z-10 w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Dashboard</div>
            <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Welcome back, {user?.name || 'learner'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Keep moving through your roadmap, review your saved resources, and pick up where you left off.
            </p>
          </div>
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
            <Flame size={14} /> 0 day streak
          </span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard Icon={Clock} label="Daily goal" value={currentRoadmap?.studyTime || "0 min"} />
          <StatCard Icon={CheckCircle2} label="Topics done" value={topicsCompleted.toString()} />
          <StatCard Icon={Bookmark} label="Saved resources" value={savedResourcesCount.toString()} />
          <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <CheckCircle2 size={17} className="text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xs text-ink-faint">Practice performance</div>
              {data.latestPractice ? (
                <>
                  <div className="text-sm font-semibold text-ink">{data.latestPractice.percentage}%</div>
                  <div className="text-xs text-ink-muted">{data.latestPractice.score} / {data.latestPractice.totalQuestions} correct</div>
                  <div className="text-[10px] text-ink-faint uppercase tracking-wider mt-0.5">Latest attempt</div>
                </>
              ) : (
                <div className="text-xs text-ink-muted mt-0.5">
                  No attempts yet<br/>
                  <Link to="/app/practice" className="text-accent hover:underline">Start your first practice</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="mb-0">
            {currentRoadmap ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Current roadmap</p>
                    <p className="mt-1 text-sm text-ink-muted">{currentRoadmap.goal || 'No goal set'}</p>
                  </div>
                  <Badge>{completionPercentage}% complete</Badge>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${completionPercentage}%` }} />
                </div>
                <div className="mt-4 rounded-2xl bg-bg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Continue learning</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {currentRoadmap.steps && currentRoadmap.steps.length > 0 
                      ? `Resume your learning journey: ${currentRoadmap.steps[0]?.title || currentRoadmap.steps[0]}`
                      : 'You have no steps in your roadmap yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to="/app/resources"
                      className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      Open resources
                    </Link>
                    <Link
                      to="/app/roadmap"
                      className="inline-flex items-center justify-center rounded-lg bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line"
                    >
                      View roadmap
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm font-semibold text-ink">No roadmap found</p>
                <p className="mt-2 text-sm text-ink-muted mb-6">Create a roadmap to start learning.</p>
                <Link
                  to="/app/roadmap"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Create roadmap
                </Link>
              </div>
            )}
          </Card>

          <Card className="mb-0">
            <p className="text-sm font-semibold text-ink">Today's focus</p>
            <div className="mt-4 space-y-3 text-sm text-ink-muted">
              <div>- Search one topic</div>
              <div>- Read one resource</div>
              {data.latestPractice ? (
                <div className="text-success flex items-center gap-1.5"><CheckCircle2 size={14} /> Practice completed</div>
              ) : (
                <div>- Complete one practice task</div>
              )}
              <div>- Ask the AI mentor one doubt</div>
            </div>
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Saved resources</p>
              {data.bookmarks.length > 0 ? (
                <div className="mt-3 space-y-2 text-sm text-ink-muted">
                  {data.bookmarks.slice(0, 3).map((bookmark, idx) => (
                    <div key={idx} className="truncate">- {bookmark.title}</div>
                  ))}
                  {data.bookmarks.length > 3 && (
                    <Link to="/app/resources" className="text-xs text-accent mt-2 block">
                      View all {data.bookmarks.length} resources &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mt-3 text-sm text-ink-muted">No saved resources yet.</div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
