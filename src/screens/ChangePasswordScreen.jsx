import React, { useState } from 'react'
import { I } from '../components/icons'
import { Button, Input, Field } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function ChangePasswordScreen({ onDone }) {
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasMin = pwd.length >= 8
  const hasNum = /\d/.test(pwd)
  const matches = pwd && pwd === confirm

  const submit = async (e) => {
    e.preventDefault()
    if (!hasMin || !hasNum) { setError('Password must be 8+ characters with at least one number'); return }
    if (!matches) { setError("Passwords don't match"); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: pwd })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    // Mark must_change_password = false in profile
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    onDone()
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
          <div style={{ position: 'relative' }}>
            <Input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }}/>
            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, padding: 4, color: 'hsl(var(--muted-foreground))' }} aria-label={showPwd ? 'Hide password' : 'Show password'}>
              {showPwd ? <I.EyeOff size={18}/> : <I.Eye size={18}/>}
            </button>
          </div>
        </Field>
        <Field label="Confirm password">
          <div style={{ position: 'relative' }}>
            <Input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} error={confirm && !matches ? 'Mismatch' : null}/>
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, padding: 4, color: 'hsl(var(--muted-foreground))' }} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? <I.EyeOff size={18}/> : <I.Eye size={18}/>}
            </button>
          </div>
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
