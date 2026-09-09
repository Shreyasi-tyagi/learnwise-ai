function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  )
}

export default Input
