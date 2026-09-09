function Card({ children, className = '', onClick }) {
  const clickable = onClick ? 'cursor-pointer' : ''

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md ${clickable} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
