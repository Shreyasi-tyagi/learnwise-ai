import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { api } from '../services/api'

export default function ResourcesPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedTitles, setSavedTitles] = useState(() => new Set())
  const [bookmarks, setBookmarks] = useState([])
  const [savingTitle, setSavingTitle] = useState('')

  async function loadBookmarks() {
    try {
      const response = await api.get('/learning/bookmarks')
      const items = response.data.bookmarks || []
      setBookmarks(items)
      const titles = items.map((item) => item.title)
      setSavedTitles(new Set(titles))
    } catch {
      // bookmarks state is supplementary here, fail quietly
    }
  }

  async function handleBookmark(resource) {
    setSavingTitle(resource.title)
    try {
      const res = await api.post('/learning/bookmarks', {
        title: resource.title,
        type: resource.category,
        difficulty: resource.difficulty,
        duration: '',
        reason: resource.description,
        url: resource.url,
        source: resource.source,
      })
      setSavedTitles((prev) => new Set(prev).add(resource.title))
      if (res.data && res.data.bookmark) {
        setBookmarks((prev) => [res.data.bookmark, ...prev])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save that bookmark right now.')
    } finally {
      setSavingTitle('')
    }
  }

  async function handleRemoveBookmark(id, title) {
    try {
      await api.delete(`/learning/bookmarks/${id}`)
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
      setSavedTitles((prev) => {
        const next = new Set(prev)
        next.delete(title)
        return next
      })
    } catch (err) {
      console.error('Failed to remove bookmark:', err)
    }
  }

  async function loadResources(searchTerm) {
    if (!searchTerm.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/learning/search', { params: { q: searchTerm } })
      setResults(response.data.results || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load resources right now.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    loadResources(query)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Resource Intelligence</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Search a topic and get ranked learning resources with explanations, difficulty, duration, and AI score.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try React, AWS, or DSA"
            className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none ring-0 placeholder:text-ink-faint focus:border-accent"
          />
          <Button type="submit" className="px-6 py-3" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {['React', 'AWS', 'DSA', 'Node.js'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item)
                loadResources(item)
              }}
              className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {results.map((resource) => {
          const saved = savedTitles.has(resource.title)
          return (
            <Card key={resource.title} className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{resource.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{resource.description}</p>
                </div>
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface">
                    <ExternalLink size={14} /> Open
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>{resource.category}</Badge>
                  <Badge>{resource.source}</Badge>
                  <Badge>{resource.difficulty}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => handleBookmark(resource)}
                  disabled={saved || savingTitle === resource.title}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface disabled:cursor-default"
                >
                  {saved ? (
                    <>
                      <BookmarkCheck size={14} className="text-accent" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark size={14} /> {savingTitle === resource.title ? 'Saving...' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {!loading && results.length === 0 && bookmarks.length === 0 && !error ? (
        <Card>
          <p className="text-sm text-ink-muted">No saved resources yet. Search for a topic and bookmark resources you want to revisit.</p>
        </Card>
      ) : null}

      {bookmarks.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink mb-4">Saved Resources</h2>
          <div className="grid gap-4 xl:grid-cols-3">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{bookmark.title}</h3>
                    {bookmark.reason && <p className="mt-1 text-sm text-ink-muted">{bookmark.reason}</p>}
                  </div>
                  {bookmark.url && (
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface">
                      <ExternalLink size={14} /> Open
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {bookmark.type && <Badge>{bookmark.type}</Badge>}
                    {bookmark.source && <Badge>{bookmark.source}</Badge>}
                    {bookmark.difficulty && <Badge>{bookmark.difficulty}</Badge>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(bookmark.id, bookmark.title)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
