import React, { useState } from 'react'
import { I } from '../components/icons'
import { Button, Input, Field } from '../components/ui'

export default function ChangePasswordScreen({ onDone }) {
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hasMin = pwd.length >= 8
  const hasNum = /\d/.test(pwd)
  const matches = pwd && pwd === confirm

  const submit = (e) => {
    e.preventDefault()
    if (!hasMin || !hasNum) { setError('Password must be 8+ characters with at least one number'); return }
    if (!matches) { setError("Passwords don't match"); return }
    setLoading(true)
    setTimeout(() => onDone(), 600)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'hsl(var(--accent))',
          color: 'hsl(var(--foreground))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <I.Lock size={20}/>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
          Set a new password
        </h1>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '6px 0 0', lineHeight: 1.45 }}>
          Your admin gave you a temporary password. Choose a permanent one to continue.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="New password">
          <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••"/>
        </Field>
        <Field label="Confirm password">
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
            error={confirm && !matches ? 'Mismatch' : null}/>
        </Field>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['At least 8 characters', hasMin],
            ['Contains a number', hasNum],
            ['Passwords match', matches],
          ].map(([txt, ok]) => (
            <li key={txt} style={{ display: 'flex', gap: 8, fontSize: 13, color: ok ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))' }}>
              {ok ? <I.Check size={14}/> : <span style={{ width: 14, height: 14, borderRadius: 999, border: '1.5px solid currentColor', display: 'inline-block' }}/>}
              {txt}
            </li>
          ))}
        </ul>

        {error && <div className="error-text">{error}</div>}

        <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <span className="spinner"/> : null}
          Continue
        </Button>
      </form>
    </div>
  )
}
