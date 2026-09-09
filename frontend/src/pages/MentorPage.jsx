import { useState, useEffect, useRef } from 'react'
import Card from '../components/Card'
import {
  History, Sparkles, Send, Copy, ThumbsUp, ThumbsDown, Bot,
  BookOpen, Code, Bug, Bookmark, TrendingUp, Lightbulb, Target
} from 'lucide-react'
import { api, sendMentorMessage } from '../services/api'

export default function MentorPage() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: "Hi! 👋 I'm your AI Mentor. I can help you understand concepts, solve problems, explain topics, or debug your code. What would you like to learn today?"
    }
  ])
  
  const messagesEndRef = useRef(null)

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await api.get('/learning/roadmap')
        if (res.data.roadmaps && res.data.roadmaps.length > 0) {
          const active = res.data.roadmaps[0]
          setContext({ goal: active.goal, level: active.level })
        }
      } catch (err) {
        console.error('Failed to fetch context for badge', err)
      }
    }
    fetchRoadmap()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    setInputValue('')
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text }
    
    // Prepare history to send (exclude init message if you want, or just send all)
    // Actually, backend slices to 10 automatically, but let's format it.
    const historyToSend = messages
      .filter(m => m.id !== 'init')
      .map(m => ({ sender: m.sender, text: m.text }))

    setMessages(prev => [...prev, newUserMsg])
    setIsLoading(true)

    try {
      const response = await sendMentorMessage(text, historyToSend)
      const newAiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply
      }
      setMessages(prev => [...prev, newAiMsg])
    } catch (err) {
      console.error(err)
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Oops, I ran into a problem connecting to the server. Please try again!',
        isError: true
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  // Helper to render inline markdown (bold, inline code, italics, math notation)
  const renderInline = (str) => {
    if (!str) return null

    // Replace common LaTeX math notation for readability
    const cleanStr = str
      .replace(/\$\\lfloor\s*(.*?)\s*\\rfloor\$/g, '⌊$1⌋')
      .replace(/\$\\lceil\s*(.*?)\s*\\rceil\$/g, '⌈$1⌉')
      .replace(/\$(.*?)\$/g, '$1')

    // Split on **bold**, `inline code`, *italic* or _italic_
    const tokens = cleanStr.split(/(\*\*.*?\*\*|`.*?`|\*[^*\n]+?\*|_[^_\n]+?_)/g)

    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return <strong key={i} className="font-semibold text-ink">{token.slice(2, -2)}</strong>
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-bg text-accent font-mono text-xs border border-line">
            {token.slice(1, -1)}
          </code>
        )
      }
      if ((token.startsWith('*') && token.endsWith('*') && token.length >= 2) ||
          (token.startsWith('_') && token.endsWith('_') && token.length >= 2)) {
        return <em key={i} className="italic text-ink">{token.slice(1, -1)}</em>
      }
      return token
    })
  }

  // Markdown renderer for AI messages to handle headings, lists, code blocks, and formatting
  const renderMessageContent = (text) => {
    if (!text) return null
    const parts = text.split(/```/)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // It's a code block. Extract language if present.
        const firstNewline = part.indexOf('\n')
        let lang = ''
        let code = part
        if (firstNewline !== -1) {
          lang = part.substring(0, firstNewline).trim().toLowerCase()
          code = part.substring(firstNewline + 1)
        }

        if (!code.trim()) {
          return null
        }

        return (
          <div key={index} className="bg-bg rounded-xl p-4 font-mono text-xs overflow-x-auto relative mb-3 border border-line mt-2">
            {lang && (
              <div className="text-[10px] text-ink-muted uppercase font-semibold mb-2 tracking-wider">
                {lang}
              </div>
            )}
            <pre className="text-accent whitespace-pre-wrap break-words">
              <code>{code.trim()}</code>
            </pre>
            <button 
              onClick={() => handleCopy(code.trim())}
              className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-line text-ink-faint transition-colors" 
              title="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )
      }

      // Normal text: parse markdown blocks
      const lines = part.split('\n')
      const elements = []
      let listBuffer = []
      let listType = null // 'ul' or 'ol'

      const flushList = () => {
        if (listBuffer.length > 0) {
          const key = `list-${elements.length}`
          if (listType === 'ol') {
            elements.push(
              <ol key={key} className="list-decimal list-outside ml-5 my-2 space-y-1 text-ink">
                {listBuffer.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            )
          } else {
            elements.push(
              <ul key={key} className="list-disc list-outside ml-5 my-2 space-y-1 text-ink">
                {listBuffer.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          }
          listBuffer = []
          listType = null
        }
      }

      lines.forEach((line, lineIndex) => {
        const trimmed = line.trim()

        if (!trimmed) {
          flushList()
          return
        }

        // Horizontal Rule
        if (/^(\*\*\*|---|___)$/.test(trimmed)) {
          flushList()
          elements.push(<hr key={`hr-${lineIndex}`} className="border-line my-3" />)
          return
        }

        // Headings
        if (trimmed.startsWith('# ')) {
          flushList()
          elements.push(<h1 key={`h1-${lineIndex}`} className="text-xl font-bold text-ink mt-3 mb-1">{renderInline(trimmed.slice(2))}</h1>)
          return
        }
        if (trimmed.startsWith('## ')) {
          flushList()
          elements.push(<h2 key={`h2-${lineIndex}`} className="text-lg font-bold text-ink mt-3 mb-1">{renderInline(trimmed.slice(3))}</h2>)
          return
        }
        if (trimmed.startsWith('### ')) {
          flushList()
          elements.push(<h3 key={`h3-${lineIndex}`} className="text-base font-semibold text-ink mt-2.5 mb-1">{renderInline(trimmed.slice(4))}</h3>)
          return
        }
        if (trimmed.startsWith('#### ')) {
          flushList()
          elements.push(<h4 key={`h4-${lineIndex}`} className="text-sm font-semibold text-ink mt-2 mb-1">{renderInline(trimmed.slice(5))}</h4>)
          return
        }

        // Unordered list: - ... or * ...
        const ulMatch = trimmed.match(/^[-*]\s+(.*)$/)
        if (ulMatch) {
          if (listType && listType !== 'ul') flushList()
          listType = 'ul'
          listBuffer.push(ulMatch[1])
          return
        }

        // Ordered list: 1. ...
        const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
        if (olMatch) {
          if (listType && listType !== 'ol') flushList()
          listType = 'ol'
          listBuffer.push(olMatch[2])
          return
        }

        // Blockquote: > ...
        if (trimmed.startsWith('> ')) {
          flushList()
          elements.push(
            <blockquote key={`bq-${lineIndex}`} className="border-l-2 border-accent pl-3 italic my-2 text-ink-muted">
              {renderInline(trimmed.slice(2))}
            </blockquote>
          )
          return
        }

        // Paragraph
        flushList()
        elements.push(
          <p key={`p-${lineIndex}`} className="my-1.5 leading-relaxed">
            {renderInline(line)}
          </p>
        )
      })

      flushList()

      return <div key={index}>{elements}</div>
    })
  }

  return (
    <section className="flex flex-col lg:flex-row gap-6 h-full min-h-[85vh]">
      {/* Left Column: Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink flex items-center gap-2">
              AI Mentor <Sparkles className="w-6 h-6 text-accent" />
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Your personal AI learning companion
            </p>
          </div>
          <button className="p-2 border border-line rounded-lg bg-surface text-ink-muted hover:text-ink hover:bg-line transition-colors">
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent text-xs font-medium w-max">
          <BookOpen className="w-4 h-4" />
          {context ? (
            <>Learning: <span className="font-bold">{context.goal || 'General'}</span> &bull; Level: <span className="font-bold">{context.level || 'Beginner'}</span></>
          ) : (
            <>Your learning companion</>
          )}
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden h-full min-h-[500px]">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-card">
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                )}
                
                <div className={`space-y-1 w-full ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div 
                    className={`p-4 text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-accent-soft rounded-2xl rounded-tr-none text-ink' 
                        : msg.isError 
                          ? 'bg-danger-soft rounded-2xl rounded-tl-none text-danger' 
                          : 'bg-surface rounded-2xl rounded-tl-none text-ink'
                    }`}
                  >
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div className="bg-surface rounded-2xl rounded-tl-none p-4 text-sm text-ink-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-card border-t border-line">
            <div className="relative flex items-end">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your learning..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-line bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm shadow-sm resize-none"
                rows={Math.min(5, Math.max(1, inputValue.split('\n').length))}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-ink-faint mt-3">
              AI responses may not always be perfect. Verify important information.
            </p>
          </div>
        </Card>
      </div>

      {/* Right Column: Information */}
      <div className="w-full lg:w-80 flex flex-col space-y-6">
        
        {/* Robot Illustration / Message */}
        <div className="relative bg-white rounded-3xl p-6 flex flex-col items-center justify-center border border-line shadow-sm overflow-hidden min-h-[260px]">
          {/* Chat bubble pointing to the robot */}
          <div className="absolute top-4 right-4 bg-white shadow-md border border-line rounded-2xl rounded-br-none px-4 py-3 text-sm font-medium text-ink z-10 animate-bounce">
            I'm here to<br/>help you learn<br/><span className="text-accent font-bold">smarter!</span> ✨
          </div>
          {/* We use the generated image instead of an icon */}
          <img src="/ai_tutor.jpg" alt="AI Tutor" className="w-48 h-48 object-cover z-0 rounded-xl" />
        </div>

        {/* Capabilities Card */}
        <Card className="space-y-4 border-transparent shadow-sm bg-white">
          <h3 className="font-semibold text-ink text-sm">What I can help you with</h3>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li className="flex items-center gap-3"><BookOpen className="w-4 h-4 text-emerald-500" /> Explain concepts</li>
            <li className="flex items-center gap-3"><Code className="w-4 h-4 text-accent" /> Solve problems</li>
            <li className="flex items-center gap-3"><Bug className="w-4 h-4 text-amber-500" /> Debug your code</li>
            <li className="flex items-center gap-3"><Bookmark className="w-4 h-4 text-rose-500" /> Recommend resources</li>
            <li className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-blue-400" /> Track your progress</li>
          </ul>
        </Card>

        {/* Tips Card */}
        <Card className="space-y-4 bg-danger-soft/20 border-transparent shadow-sm bg-white">
          <h3 className="font-semibold text-ink text-sm">Tips for better answers</h3>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> 
              <span>Be specific with your questions</span>
            </li>
            <li className="flex items-start gap-3">
              <Code className="w-4 h-4 text-accent shrink-0 mt-0.5" /> 
              <span>Share your code or errors</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> 
              <span>Tell me what you're learning</span>
            </li>
          </ul>
        </Card>

      </div>
    </section>
  )
}
