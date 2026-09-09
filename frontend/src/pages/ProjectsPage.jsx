import Card from '../components/Card'

export default function ProjectsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">Project Recommendations</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Projects will appear here based on the topics you’ve completed.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ink-muted">This section is ready for the next phase of backend data wiring.</p>
      </Card>
    </section>
  )
}
