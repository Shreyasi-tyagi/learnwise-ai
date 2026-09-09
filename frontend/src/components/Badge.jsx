function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
      {children}
    </span>
  )
}

export default Badge
