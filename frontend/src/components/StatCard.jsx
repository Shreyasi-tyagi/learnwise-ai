function StatCard({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
        <Icon size={17} className="text-accent" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-xs text-ink-faint">{label}</div>
        <div className="text-sm font-semibold text-ink">{value}</div>
      </div>
    </div>
  )
}

export default StatCard
