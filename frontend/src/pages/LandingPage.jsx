import { Link } from 'react-router-dom'
import {
  Compass,
  MessageSquareText,
  FileQuestion,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Bookmark,
  Flame,
  GraduationCap,
  BookOpen,
  Target,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent-soft selection:text-accent">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-4 pb-20 pt-12 md:pb-28 md:pt-16 lg:pt-20">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent-soft/40 via-bg to-bg" />

          {/* Decorative floating badges inspired by reference */}
          <div className="pointer-events-none absolute left-[8%] top-16 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent shadow-sm ring-1 ring-accent/20">
            <GraduationCap size={20} />
          </div>
          <div className="pointer-events-none absolute left-[46%] top-14 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20">
            <BookOpen size={18} />
          </div>
          <div className="pointer-events-none absolute left-[50%] top-64 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-sm ring-1 ring-orange-500/20">
            <Target size={18} />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            {/* Left Hero Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft/60 px-4 py-1.5 text-xs font-semibold text-accent backdrop-blur-sm">
                <Sparkles size={14} className="text-accent" />
                <span>AI-powered &bull; Personalized &bull; Focused</span>
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                Stop searching.<br />
                Start <span className="text-accent">learning.</span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg lg:mx-0">
                LearnWise AI helps learners build a personalized roadmap, practice concepts, track progress, save useful resources, and get guidance from an AI mentor — all in one workspace.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row lg:justify-start">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" className="group w-full px-7 py-3 text-base font-semibold shadow-sm transition-all sm:w-auto">
                    Get started free
                    <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full border border-line px-6 py-3 text-base font-medium transition-all sm:w-auto hover:bg-card">
                    See how it works
                    <Play size={13} className="ml-2 fill-current opacity-70" />
                  </Button>
                </a>
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-ink-muted lg:justify-start">
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-sm">
                  <Compass size={14} className="text-indigo-600" />
                  <span>Personalized Roadmaps</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-sm">
                  <MessageSquareText size={14} className="text-accent" />
                  <span>AI Mentor</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-sm">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Practice &amp; Track</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-sm">
                  <Bookmark size={14} className="text-amber-600" />
                  <span>Save &amp; Revisit</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Preview */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="rounded-[2rem] border border-line bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Today</div>
                    <div className="mt-1 text-lg font-bold text-ink">Frontend Developer Roadmap</div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    <Flame size={14} className="fill-orange-500 text-orange-500" />
                    <span>6 day streak</span>
                  </div>
                </div>

                {/* Roadmap Progress Items */}
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted">
                      <span className="text-ink">React Fundamentals</span>
                      <span className="font-semibold text-ink">80%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted">
                      <span className="text-ink">API Integration</span>
                      <span className="font-semibold text-ink">40%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: '40%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted">
                      <span className="text-ink">Projects &amp; Practice</span>
                      <span className="text-[11px] font-semibold text-ink-faint">Next up</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent/40" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>

                {/* AI Mentor Callout Box */}
                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-accent-soft bg-accent-soft/40 p-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-accent">AI Mentor</div>
                    <p className="text-xs leading-relaxed text-ink">
                      “Here’s the shortest path to learn React: docs, one project, one practice set, then review.”
                    </p>
                  </div>
                  <img
                    src="/ai_tutor.jpg"
                    alt="AI Tutor Mascot"
                    className="h-13 w-13 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES HIGHLIGHT SECTION */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Everything you need to learn better
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
              All in one place. All personalized. All for you.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Learning Resources */}
            <Link
              to="/app/resources"
              className="group flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform group-hover:scale-105">
                  <BookOpen size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-ink">Learning Resources</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Discover useful learning resources and save the ones worth revisiting.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-accent">
                <span>Explore resources</span>
                <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Learning Roadmap */}
            <Link
              to="/app/roadmap"
              className="group flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105">
                  <Compass size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-ink">Learning Roadmap</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  A clear path tailored to your goal and current level.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-accent">
                <span>View roadmaps</span>
                <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: AI Mentor */}
            <Link
              to="/app/mentor"
              className="group flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
                  <MessageSquareText size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-ink">AI Mentor</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Get explanations, guidance, and help while you learn.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-accent">
                <span>Chat with mentor</span>
                <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 4: Practice Center */}
            <Link
              to="/app/practice"
              className="group flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105">
                  <FileQuestion size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-ink">Practice Center</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Practice with AI-generated questions and track your performance.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-accent">
                <span>Start quiz</span>
                <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
              A structured flow from goal setting to skill mastery.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-ink">Build your roadmap</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Set your learning goal and level to create a personalized roadmap.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-ink">Learn and practice</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Follow roadmap topics, explore learning resources, and practice with AI-generated questions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col rounded-3xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-ink">Track and improve</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Track progress, save useful resources, and use AI Mentor for guidance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage

