import React, { useState, useMemo } from 'react'
import { Segmented, Field, Input } from './ui'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getMonthStart() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [preset, setPreset] = useState('today')

  const handlePreset = (p) => {
    setPreset(p)
    const today = getToday()
    if (p === 'today') onChange(today, today)
    else if (p === 'week') onChange(getWeekStart(), today)
    else if (p === 'month') onChange(getMonthStart(), today)
    // custom: keep current dates, user will pick
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <Segmented
        options={PRESETS}
        value={preset}
        onChange={handlePreset}
        ariaLabel="Date range preset"
      />
      {preset === 'custom' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Field label="From">
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={e => onChange(e.target.value, endDate)}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={e => onChange(startDate, e.target.value)}
            />
          </Field>
        </div>
      )}
    </div>
  )
}
