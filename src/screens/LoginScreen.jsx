import React, { useState } from 'react'
import { I } from '../components/icons'
import { Button, Input, Field } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    onLogin()
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px' }}>
      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <I.HardHat size={22}/>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '6px 0 0' }}>
          Sign in to log expenses for your site.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>

        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <Input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 4, top: 4, height: 36, width: 36,
                border: 0, background: 'transparent', borderRadius: 6,
                color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {showPwd ? <I.EyeOff size={16}/> : <I.Eye size={16}/>}
            </button>
          </div>
        </Field>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))',
            borderRadius: 8, fontSize: 13,
          }}>
            <I.AlertCircle size={14}/>
            {error}
          </div>
        )}

        <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? <span className="spinner"/> : null}
          {loading ? 'Signing in\u2026' : 'Sign in'}
        </Button>
      </form>

      <div style={{ marginTop: 'auto', fontSize: 12, color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
        Forgot password? Ask your admin to reset it.
      </div>
    </div>
  )
}
