import { Link } from 'react-router-dom'

function FeatureCard({ Icon, title, description, to }) {
  const content = (
    <>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
        <Icon size={20} className="text-accent" strokeWidth={1.75} />
      </div>
      <div className="mb-1 text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs leading-relaxed text-ink-muted">{description}</div>
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full w-full rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="h-full w-full rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </div>
  )
}

export default FeatureCard
