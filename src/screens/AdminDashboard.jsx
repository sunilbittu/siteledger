import React, { useState } from 'react'
import { I } from '../components/icons'
import { useData } from '../lib/DataContext'
import { useAdminEntries } from '../lib/useAdminEntries'
import { CATEGORIES, formatINRFull, formatDateShort } from '../data/constants'
import { EntryRow } from './HomeScreen'
import { TopBar, Button } from '../components/ui'
import DateRangePicker from '../components/DateRangePicker'
import { generateReport } from '../lib/generateReport'

function flatPlots(plotsByProject) {
  const all = []
  Object.values(plotsByProject).forEach(arr => arr.forEach(p => all.push(p)))
  return all
}

export default function AdminDashboard({ onLogout }) {
  const { projects, plotsByProject } = useData()
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  const { entries, loading } = useAdminEntries(startDate, endDate)

  const handleDateChange = (s, e) => {
    setStartDate(s)
    setEndDate(e)
  }

  const allPlots = flatPlots(plotsByProject)
  const projectMap = {}
  projects.forEach(p => { projectMap[p.id] = p.name })

  // Summary
  const grandTotal = entries.reduce((s, e) => s + e.total_amount, 0)
  const byCategory = entries.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { amount: 0, count: 0 }
    acc[e.category].amount += e.total_amount
    acc[e.category].count += 1
    return acc
  }, {})

  // Group entries by date, then by project within date
  const grouped = {}
  entries.forEach(e => {
    if (!grouped[e.entry_date]) grouped[e.entry_date] = {}
    if (!grouped[e.entry_date][e.project_id]) grouped[e.entry_date][e.project_id] = []
    grouped[e.entry_date][e.project_id].push(e)
  })

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const handleExport = () => {
    generateReport({
      entries,
      projects,
      plots: allPlots,
      startDate,
      endDate,
    })
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar
        title="Reports"
        right={
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ gap: 4 }}>
            <I.LogOut size={15}/> Logout
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {/* Date Range Picker */}
        <div style={{ marginTop: 12 }}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Summary Card */}
        <div className="card" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
            Total spend
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="tabular" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {loading ? '...' : formatINRFull(grandTotal)}
            </span>
            <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
              &middot; {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Stacked bar */}
          {grandTotal > 0 && (
            <div style={{ marginTop: 14, display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: 'hsl(var(--muted))' }}>
              {Object.entries(byCategory).map(([cat, { amount }]) => (
                <div key={cat} style={{
                  width: `${(amount / grandTotal) * 100}%`,
                  background: `hsl(${CATEGORIES[cat].color})`,
                }}/>
              ))}
            </div>
          )}

          {/* Category chips */}
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(byCategory).map(([cat, { amount }]) => (
              <span
                key={cat}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 999,
                  border: '1px solid hsl(var(--border))',
                  background: 'transparent',
                  fontSize: 12, fontWeight: 500,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: `hsl(${CATEGORIES[cat].color})` }}/>
                <span>{CATEGORIES[cat].short}</span>
                <span className="tabular" style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>{formatINRFull(amount)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Export PDF */}
        {entries.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleExport}
            style={{ width: '100%', marginTop: 12, gap: 6 }}
          >
            <I.Download size={15}/> Export PDF
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 32, color: 'hsl(var(--muted-foreground))' }}>
            <span className="spinner" style={{ width: 20, height: 20 }}/>
          </div>
        )}

        {/* Entries grouped by date → project */}
        {!loading && sortedDates.map(date => (
          <div key={date} style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'hsl(var(--foreground))',
              position: 'sticky', top: 0, background: 'hsl(var(--background))',
              padding: '6px 0', zIndex: 2,
            }}>
              {formatDateShort(date)}
            </div>
            {Object.entries(grouped[date]).map(([projId, projEntries]) => (
              <div key={projId} style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {projectMap[projId] || projId}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {projEntries.map((e, i) => (
                    <EntryRow
                      key={e.id}
                      entry={e}
                      onClick={() => {}}
                      syncing={false}
                      first={i === 0}
                      last={i === projEntries.length - 1}
                      plotName={allPlots.find(p => p.id === e.plot_id)?.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13, marginTop: 16 }}>
            No entries found for this date range.
          </div>
        )}
      </div>
    </div>
  )
}
