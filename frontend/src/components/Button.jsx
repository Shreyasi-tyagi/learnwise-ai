function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-surface text-ink hover:bg-line',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface',
    danger: 'bg-danger-soft text-danger hover:bg-red-100',
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
