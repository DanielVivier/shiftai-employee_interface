'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">ShiftAI</div>
          <h2>Check your email</h2>
          <p className="login-hint">
            We sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </p>
          <button
            className="btn-ghost"
            onClick={() => setSent(false)}
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">ShiftAI</div>
        <h2>Sign in</h2>
        <p className="login-hint">
          Enter your email to receive a magic link.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="input"
          />
          {error && <p className="error-text">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  )
}
