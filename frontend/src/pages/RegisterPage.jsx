import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/register', { name, email, password })
      signIn(response.data.token, response.data.user)
      navigate('/app')
    } catch (err) {
      const status = err?.response?.status
      const serverMessage = err?.response?.data?.message
      if (!status) {
        setError('Cannot reach the backend server right now. Start `npm run dev` in the backend folder.')
      } else {
        setError(serverMessage || `Registration failed (${status})`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold tracking-tight text-ink">Create your account</h1>
        <Input label="Name" value={name} onChange={setName} placeholder="Your name" />
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="name@email.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="********" />
        {error ? <div className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">{error}</div> : null}
        <Button type="submit" className="mt-2 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Already have an account? <Link to="/login" className="font-medium text-accent">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
