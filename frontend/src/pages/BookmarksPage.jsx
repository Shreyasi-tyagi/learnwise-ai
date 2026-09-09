import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ExternalLink } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { api } from '../services/api'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadBookmarks() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/learning/bookmarks')
      setBookmarks(response.data.bookmarks || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load bookmarks right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  async function handleRemove(id) {
    const previous = bookmarks
    setBookmarks((prev) => prev.filter((item) => item.id !== id))
    try {
      await api.delete(`/learning/bookmarks/${id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to remove that bookmark.')
      setBookmarks(previous)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Bookmarks</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">Saved articles, videos, docs, and notes from your resource search.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {!loading && bookmarks.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No bookmarks yet. Save resources from the{' '}
            <Link to="/app/resources" className="font-medium text-accent">
              Resources
            </Link>{' '}
            page.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="h-full">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">{bookmark.title}</h2>
              <div className="flex items-center gap-2">
                {bookmark.url && (
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface">
                    <ExternalLink size={14} /> Open
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(bookmark.id)}
                  className="shrink-0 text-ink-faint transition-colors hover:text-danger"
                  aria-label="Remove bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {bookmark.reason ? <p className="mt-1 text-sm text-ink-muted">{bookmark.reason}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {bookmark.type ? <Badge>{bookmark.type}</Badge> : null}
              {bookmark.source ? <Badge>{bookmark.source}</Badge> : null}
              {bookmark.difficulty ? <Badge>{bookmark.difficulty}</Badge> : null}
              {bookmark.duration ? <Badge>{bookmark.duration}</Badge> : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
