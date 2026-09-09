import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('learnwise_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('learnwise_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('learnwise_token', token)
    } else {
      localStorage.removeItem('learnwise_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('learnwise_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('learnwise_user')
    }
  }, [user])

  const value = useMemo(
    () => ({
      token,
      user,
      signIn(nextToken, nextUser) {
        setToken(nextToken)
        setUser(nextUser)
      },
      signOut() {
        setToken('')
        setUser(null)
      },
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
