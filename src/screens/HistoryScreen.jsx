import React, { useMemo } from 'react'
import { useData } from '../lib/DataContext'
import { CATEGORIES, formatINRFull, formatDateShort } from '../data/constants'
import { TopBar } from '../components/ui'
import { EntryRow } from './HomeScreen'

function dateHeader(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayMs = 86400000
  const diff = Math.round((today - date) / dayMs)
  if (diff === 0) return `Today \u00b7 ${formatDateShort(date)}`
  if (diff === 1) return `Yesterday \u00b7 ${formatDateShort(date)}`
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function HistoryScreen({ project, allEntries, onBack, onOpenEntry }) {
  const { plotsByProject } = useData()
  const plots = plotsByProject[project.id] || []

  const groups = useMemo(() => {
    const byDate = {}
    allEntries.forEach(e => {
      if (!byDate[e.entry_date]) byDate[e.entry_date] = []
      byDate[e.entry_date].push(e)
    })
    return Object.keys(byDate).sort().reverse().map(d => ({
      date: d,
      entries: byDate[d].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      total: byDate[d].reduce((s, e) => s + e.total_amount, 0),
    }))
  }, [allEntries])

  const totalAll = allEntries.reduce((s, e) => s + e.total_amount, 0)

  return (
    <div className="sheet">
      <TopBar title="History" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 12px' }}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
            {allEntries.length} entries &middot; {groups.length} days
          </div>
          <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{formatINRFull(totalAll)}</div>
        </div>

        {groups.map(g => (
          <div key={g.date} style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '6px 4px 8px', position: 'sticky', top: 0,
              background: 'hsl(var(--background))', zIndex: 1,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'hsl(var(--muted-foreground))' }}>
                {dateHeader(g.date)}
              </div>
              <div className="tabular" style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{formatINRFull(g.total)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {g.entries.map((e, i) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  onClick={() => onOpenEntry(e)}
                  syncing={false}
                  first={i === 0}
                  last={i === g.entries.length - 1}
                  plotName={plots.find(p => p.id === e.plot_id)?.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
