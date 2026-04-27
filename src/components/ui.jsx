import React from 'react'
import { I } from './icons'
import { CATEGORIES } from '../data/constants'

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''} ${className}`
  return <button className={cls} {...rest}>{children}</button>
}

export function Input({ error, ...rest }) {
  return <input className={`input ${error ? 'input-error' : ''}`} {...rest} />
}

export function Field({ label, hint, error, children }) {
  return (
    <div className="field">
      <div>
        <span className="label">{label}</span>
        {hint && <span className="label-hint">{hint}</span>}
      </div>
      {children}
      {error && <div className="error-text">{error}</div>}
    </div>
  )
}

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
          role="radio"
          aria-checked={value === o.value}
        >{o.label}</button>
      ))}
    </div>
  )
}

export function Stepper({ value, onChange, min = 1, max = 999 }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">
        <I.Minus size={18}/>
      </button>
      <input
        type="number"
        value={value}
        onChange={e => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)))
          else if (e.target.value === '') onChange(min)
        }}
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        <I.Plus size={18}/>
      </button>
    </div>
  )
}

export function Chip({ tone = 'default', children }) {
  const map = { success: 'chip-success', warn: 'chip-warn', locked: 'chip-locked' }
  return <span className={`chip ${map[tone] || ''}`}>{children}</span>
}

export function TopBar({ title, onBack, right }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="btn btn-ghost btn-icon" onClick={onBack} aria-label="Back" style={{ height: 36, width: 36 }}>
          <I.ArrowLeft size={18}/>
        </button>
      )}
      <div className="topbar-title">{title}</div>
      {right}
    </div>
  )
}

export function CategoryDot({ category }) {
  return <span className="cat-dot" style={{ background: `hsl(${CATEGORIES[category].color})` }}/>
}

export function Toast({ message, icon }) {
  return (
    <div className="toast">
      {icon || <I.Check size={16}/>}
      <span>{message}</span>
    </div>
  )
}

export function SelectSheet({ open, title, options, value, onChange, onClose, renderOption }) {
  if (!open) return null
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="sheet-bottom">
        <div className="handle"/>
        <div style={{ padding: '8px 20px 4px', fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ overflowY: 'auto', padding: '4px 8px 16px', flex: 1 }}>
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '12px 12px', border: 0, background: 'transparent',
                borderRadius: 8, fontSize: 15, textAlign: 'left',
                color: 'hsl(var(--foreground))',
              }}
            >
              <span>{renderOption ? renderOption(o) : o.label}</span>
              {value === o.value && <I.Check size={18} style={{ color: 'hsl(var(--primary))' }}/>}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export function SelectField({ label, hint, value, placeholder, onClick, disabled, error }) {
  return (
    <div className="field">
      <div>
        <span className="label">{label}</span>
        {hint && <span className="label-hint">{hint}</span>}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''}`}
        style={{
          textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>{value || placeholder}</span>
        <I.ChevronDown size={16} style={{ color: 'hsl(var(--muted-foreground))' }}/>
      </button>
      {error && <div className="error-text">{error}</div>}
    </div>
  )
}
