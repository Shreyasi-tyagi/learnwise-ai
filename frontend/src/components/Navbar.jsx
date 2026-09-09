import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, GraduationCap } from 'lucide-react'
import Button from './Button'

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/90 px-6 py-4 backdrop-blur-md md:px-8">
      <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
          <GraduationCap size={18} />
        </div>
        <span>LearnWise <span className="text-accent">AI</span></span>
      </Link>
      
      <div className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
        <a href="#features" className="transition-colors hover:text-accent">
          Features
        </a>
        <a href="#how-it-works" className="transition-colors hover:text-accent">
          How it works
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost" className="px-4 py-2 text-sm font-medium">
            Log in
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="primary" className="px-5 py-2 text-sm font-medium shadow-sm">
            Sign up
          </Button>
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-line bg-card p-2 text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-line bg-card px-6 py-4 shadow-md md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-ink-muted">
            <a href="#features" onClick={() => setOpen(false)} className="py-2 transition-colors hover:text-accent">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="py-2 transition-colors hover:text-accent">
              How it works
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

