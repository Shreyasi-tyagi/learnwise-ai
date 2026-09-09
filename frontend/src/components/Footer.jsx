import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-line bg-card/60 py-10 text-sm text-ink-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
            <GraduationCap size={15} />
          </div>
          <span>LearnWise <span className="text-accent">AI</span></span>
        </Link>
        
        <p className="text-xs text-ink-faint text-center">
          &copy; 2026 LearnWise AI. All rights reserved.
        </p>
        
        <div className="flex items-center gap-6 text-xs font-medium text-ink-muted">
          <a href="#features" className="transition-colors hover:text-accent">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-accent">How it works</a>
          <Link to="/login" className="transition-colors hover:text-accent">Login</Link>
          <Link to="/register" className="transition-colors hover:text-accent">Sign up</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
